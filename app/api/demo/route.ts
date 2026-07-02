import nodemailer from "nodemailer";
import { customerEmail, teamEmail } from "../../../lib/email-templates";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const hits = (ipHits.get(ip) || []).filter((t) => now - t < HOUR);
  if (hits.length >= 5) return true;
  hits.push(now);
  ipHits.set(ip, hits);
  if (ipHits.size > 5000) ipHits.clear(); // crude memory cap
  return false;
}

function shouldConfirm(email: string): boolean {
  const now = Date.now();
  const last = confirmedRecently.get(email);
  if (last && now - last < 24 * HOUR) return false;
  confirmedRecently.set(email, now);
  if (confirmedRecently.size > 5000) confirmedRecently.clear();
  return true;
}

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  // Honeypot — pretend success so bots don't retry.
  if (body.botcheck) return Response.json({ success: true });

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (rateLimited(ip)) {
    return Response.json(
      { error: "Too many requests — please try again later." },
      { status: 429 },
    );
  }

  const name = clean(body.name, 120);
  const email = clean(body.email, 200);
  const company = clean(body.company, 160);
  const message = cleanMultiline(body.message, 4000);

  if (!name || !EMAIL_RE.test(email)) {
    return Response.json(
      { error: "Please provide your name and a valid email address." },
      { status: 422 },
    );
  }

  const c = config();
  if (!c.host || !c.user || !c.pass || c.notify.length === 0) {
    // Not configured yet — the client falls back to a mailto.
    return Response.json({ error: "not-configured" }, { status: 503 });
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

  try {
    // 1) Notify the team (reply goes straight to the lead).
    await transport.sendMail({
      from: c.from,
      to: c.notify,
      replyTo: email,
      subject: team.subject,
      text: team.text,
      html: team.html,
    });

    // 2) Confirm to the customer (once per address per 24 h).
    if (shouldConfirm(email)) {
      const customer = customerEmail({ name });
      await transport.sendMail({
        from: c.from,
        to: email,
        replyTo: c.notify[0] || c.from,
        subject: customer.subject,
        text: customer.text,
        html: customer.html,
      });
    }
  } catch {
    return Response.json(
      { error: "We couldn't send your request just now. Please try again shortly." },
      { status: 502 },
    );
  }

  return Response.json({ success: true });
}
