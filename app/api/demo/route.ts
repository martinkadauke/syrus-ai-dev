import nodemailer from "nodemailer";

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
const cap = (s: string, n: number) => s.slice(0, n);
const esc = (s: string) =>
  s.replace(/[<>&]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" })[c] as string);

function confirmationHtml(name: string) {
  return `<!doctype html><html><body style="margin:0;background:#f4f1ea;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#2b211a">
<div style="max-width:520px;margin:0 auto;padding:32px 20px">
  <div style="background:#ffffff;border:1px solid #e7ded0;border-radius:14px;padding:32px">
    <div style="font-size:18px;font-weight:700;color:#c96f4a">Syrus</div>
    <h1 style="font-size:22px;line-height:1.3;margin:20px 0 12px">Thanks, ${esc(name)} — we've got your request.</h1>
    <p style="font-size:15px;line-height:1.6;color:#5c5044;margin:0 0 14px">
      We received your request for a Syrus demo and we'll be in touch shortly to set it up.
    </p>
    <p style="font-size:15px;line-height:1.6;color:#5c5044;margin:0 0 14px">
      Syrus lets your team put AI to work across delivery — turning goals into tracked
      epics and tickets, writing the code, and keeping a developer's review on every
      change — without giving up the git workflow you already trust.
    </p>
    <p style="font-size:15px;line-height:1.6;color:#5c5044;margin:0">
      If you'd like to add anything, just reply to this email.
    </p>
  </div>
  <p style="font-size:12px;color:#9c8f7d;text-align:center;margin:18px 0 0">
    Syrus · syrus-ai.dev
  </p>
</div></body></html>`;
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

  const name = cap(String(body.name ?? "").trim(), 120);
  const email = cap(String(body.email ?? "").trim(), 200);
  const company = cap(String(body.company ?? "").trim(), 160);
  const message = cap(String(body.message ?? "").trim(), 4000);

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

  try {
    // 1) Notify the team (reply goes straight to the lead).
    await transport.sendMail({
      from: c.from,
      to: c.notify,
      replyTo: email,
      subject: `New Syrus demo request — ${name}${company ? ` (${company})` : ""}`,
      text: `New Syrus demo request\n\nName: ${name}\nCompany: ${company || "—"}\nEmail: ${email}\n\n${message || "(no message)"}\n`,
      html: `<h2 style="font-family:sans-serif">New Syrus demo request</h2>
<p style="font-family:sans-serif"><b>Name:</b> ${esc(name)}<br><b>Company:</b> ${esc(company) || "—"}<br><b>Email:</b> <a href="mailto:${esc(email)}">${esc(email)}</a></p>
<p style="font-family:sans-serif;white-space:pre-wrap">${esc(message) || "(no message)"}</p>`,
    });

    // 2) Confirm to the customer.
    await transport.sendMail({
      from: c.from,
      to: email,
      replyTo: c.notify[0] || c.from,
      subject: "Thanks for your interest in Syrus",
      text: `Hi ${name},\n\nThanks for reaching out — we've received your request for a Syrus demo and will be in touch shortly to set it up.\n\nIf you'd like to add anything, just reply to this email.\n\n— The Syrus team\nsyrus-ai.dev\n`,
      html: confirmationHtml(name),
    });
  } catch {
    return Response.json(
      { error: "We couldn't send your request just now. Please try again shortly." },
      { status: 502 },
    );
  }

  return Response.json({ success: true });
}
