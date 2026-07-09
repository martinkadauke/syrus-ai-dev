import nodemailer from "nodemailer";
import { customerEmail, teamEmail } from "../../../lib/email-templates";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ── CORS ────────────────────────────────────────────────────────────────────
// The marketing site is now static on GitHub Pages (syrus-ai.dev) while this
// endpoint stays on the VM (reachable at api.syrus-ai.dev), so the form posts
// here cross-origin. Allow only the site's own origins; same-origin callers
// send no Origin header and are unaffected. Configurable via DEMO_CORS_ORIGINS.
const ALLOWED_ORIGINS = new Set(
  (process.env.DEMO_CORS_ORIGINS ||
    "https://syrus-ai.dev,https://www.syrus-ai.dev")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
);

function corsHeaders(origin: string | null): Record<string, string> {
  const h: Record<string, string> = { Vary: "Origin" };
  if (origin && ALLOWED_ORIGINS.has(origin)) {
    h["Access-Control-Allow-Origin"] = origin;
    h["Access-Control-Allow-Methods"] = "POST, OPTIONS";
    h["Access-Control-Allow-Headers"] = "Content-Type";
    h["Access-Control-Max-Age"] = "86400";
  }
  return h;
}

// Preflight for the cross-origin JSON POST.
export function OPTIONS(req: Request) {
  return new Response(null, {
    status: 204,
    headers: corsHeaders(req.headers.get("origin")),
  });
}

type Cfg = {
  host?: string;
  port: number;
  user?: string;
  pass?: string;
  from: string;
  notify: string[];
};

function config(): Cfg {
  const user = process.env.SMTP_USER || "contact@syrus-ai.dev";
  return {
    host: process.env.SMTP_HOST || "smtp.strato.de",
    port: Number(process.env.SMTP_PORT || 465),
    user,
    pass: process.env.SMTP_PASS,
    from: process.env.SMTP_FROM || `Syrus <${user}>`,
    notify: (process.env.DEMO_NOTIFY || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
  };
}

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

// Cap length, trim, and flatten control chars/newlines to spaces — name and
// company feed the raw email Subject, so nothing header-shaped may survive.
const clean = (v: unknown, n: number) =>
  String(v ?? "")
    .replace(/[\u0000-\u001f\u007f]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, n);

// Keep newlines in the free-text message (rendered safely by the template),
// but strip all other control chars.
const cleanMultiline = (v: unknown, n: number) =>
  String(v ?? "")
    .replace(/\r\n?/g, "\n")
    .replace(/[\u0000-\u0009\u000b-\u001f\u007f]+/g, " ")
    .trim()
    .slice(0, n);

// ── Abuse guards (in-memory; resets on container restart, which is fine) ────
// The endpoint triggers outbound branded mail to an arbitrary address, so it
// must not be usable to spray mail: 5 requests/hour per IP, and at most one
// customer confirmation per address per 24 h (the team is still notified).
const HOUR = 3_600_000;
const ipHits = new Map<string, number[]>();
const confirmedRecently = new Map<string, number>();
let globalHits: number[] = [];

function rateLimited(ip: string): boolean {
  const now = Date.now();
  // Global backstop: even with spoofed per-IP keys, total outbound mail stays
  // bounded (protects the domain's sender reputation).
  globalHits = globalHits.filter((t) => now - t < HOUR);
  if (globalHits.length >= 30) return true;
  const hits = (ipHits.get(ip) || []).filter((t) => now - t < HOUR);
  if (hits.length >= 5) return true;
  hits.push(now);
  globalHits.push(now);
  ipHits.set(ip, hits);
  if (ipHits.size > 5000) {
    // evict the oldest half rather than dropping all state
    for (const key of [...ipHits.keys()].slice(0, 2500)) ipHits.delete(key);
  }
  return false;
}

function recentlyConfirmed(email: string): boolean {
  const last = confirmedRecently.get(email);
  return Boolean(last && Date.now() - last < 24 * HOUR);
}

function recordConfirmed(email: string): void {
  confirmedRecently.set(email, Date.now());
  if (confirmedRecently.size > 5000) {
    for (const key of [...confirmedRecently.keys()].slice(0, 2500))
      confirmedRecently.delete(key);
  }
}

export async function POST(req: Request) {
  // Attach CORS headers to every response (the static site posts cross-origin).
  const cors = corsHeaders(req.headers.get("origin"));
  const reply = (data: unknown, status = 200) =>
    Response.json(data, { status, headers: cors });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return reply({ error: "Invalid request." }, 400);
  }

  // Honeypot — pretend success so bots don't retry.
  if (body.botcheck) return reply({ success: true });

  // Use the LAST XFF entry: NPM appends the real client IP to whatever the
  // client sent, so the first entry is attacker-controlled but the last is the
  // trusted hop.
  const ip =
    req.headers
      .get("x-forwarded-for")
      ?.split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .at(-1) || "unknown";
  if (rateLimited(ip)) {
    return reply({ error: "Too many requests — please try again later." }, 429);
  }

  const name = clean(body.name, 120);
  const email = clean(body.email, 200);
  const company = clean(body.company, 160);
  const message = cleanMultiline(body.message, 4000);

  if (!name || !EMAIL_RE.test(email)) {
    return reply(
      { error: "Please provide your name and a valid email address." },
      422,
    );
  }

  const c = config();
  if (!c.host || !c.user || !c.pass || c.notify.length === 0) {
    // Not configured yet — the client falls back to a mailto.
    return reply({ error: "not-configured" }, 503);
  }

  const transport = nodemailer.createTransport({
    host: c.host,
    port: c.port,
    secure: c.port === 465,
    auth: { user: c.user, pass: c.pass },
  });

  const team = teamEmail({
    name,
    email,
    company,
    message,
    submittedAt: new Date(),
  });

  // 1) Notify the team (reply goes straight to the lead). This is the send
  //    that matters — if it fails, the request failed.
  try {
    await transport.sendMail({
      from: c.from,
      to: c.notify,
      replyTo: email,
      subject: team.subject,
      text: team.text,
      html: team.html,
    });
  } catch {
    return reply(
      { error: "We couldn't send your request just now. Please try again shortly." },
      502,
    );
  }

  // 2) Confirm to the customer (once per address per 24 h). Non-fatal: the
  //    lead is already with the team, so a failed confirmation must not make
  //    the client retry (which would notify the team twice). Only record the
  //    address after a successful send so a failure doesn't suppress the next
  //    attempt for 24 h.
  if (!recentlyConfirmed(email)) {
    try {
      const customer = customerEmail({ name });
      await transport.sendMail({
        from: c.from,
        to: email,
        replyTo: c.notify[0] || c.from,
        subject: customer.subject,
        text: customer.text,
        html: customer.html,
      });
      recordConfirmed(email);
    } catch {
      // swallow — team notification succeeded, which is what counts
    }
  }

  return reply({ success: true });
}
