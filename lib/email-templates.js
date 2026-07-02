// Branded transactional email templates (CommonJS so both the Next route and
// plain node scripts can use them). Design mirrors the site's cool theme:
// navy ink, blue accent, cream text, the Syrus mark, and the Latin tagline.
//
// Email-client constraints honored here (reviewed against Outlook desktop,
// Gmail, Apple Mail):
// - NO `font:` shorthand (Outlook/Word drops the whole declaration) → longhand
//   via the f() helper.
// - `max-width` is ignored by Outlook → MSO conditional ghost table fixes the
//   card at 560px there.
// - Buttons/badges are table cells with bgcolor + padding (padding on <a> and
//   display:inline-block don't work in Outlook).
// - Solid accent backgrounds, no gradients: Gmail/Outlook dark modes transform
//   color/background-color as a pair but leave background-image gradients
//   untouched, which would break CTA contrast.
// - User text is escaped AND newlines become <br> (Outlook has no pre-wrap).

const C = {
  bg: "#0b111e", // page
  card: "#121b2e", // panel
  border: "#263149",
  heading: "#e9eef8",
  body: "#9aa7bf",
  faint: "#828fa8",
  accent: "#5b95f7",
  onAccent: "#071426",
  quote: "#c6cede",
};

const FONT =
  "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";
const MONO = "ui-monospace,'SF Mono',Menlo,Consolas,monospace";
const SITE = "https://syrus-ai.dev";

/** Longhand font styles (Outlook-safe). */
const f = (weight, sizePx, lineHeight, family = FONT) =>
  `font-family:${family};font-size:${sizePx}px;line-height:${lineHeight};font-weight:${weight};`;

const esc = (s) =>
  String(s ?? "").replace(
    /[<>&"]/g,
    (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;" })[c],
  );

/** Escape + preserve user line breaks in HTML (Outlook lacks pre-wrap). */
const escMultiline = (s) => esc(s).replace(/\r?\n/g, "<br>");

const firstName = (name) => String(name || "").trim().split(/\s+/)[0] || "there";

/** Bulletproof button: td carries bg + padding (Outlook-safe). */
function button(href, label) {
  return `<table role="presentation" cellpadding="0" cellspacing="0"><tr>
<td bgcolor="${C.accent}" style="background-color:${C.accent};border-radius:999px;padding:14px 26px;">
  <a href="${href}" style="display:inline-block;color:${C.onAccent};${f(600, 14, 1)}text-decoration:none;">${label}</a>
</td>
</tr></table>`;
}

function eyebrow(text) {
  return `<div style="${f(600, 11, 1.4, MONO)}letter-spacing:2px;text-transform:uppercase;color:${C.accent};margin:0 0 14px;">&#9679;&nbsp;&nbsp;${text}</div>`;
}

/** Shared outer shell: dark page, logo row, card, brand footer. */
function shell({ preheader, inner }) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="dark">
<meta name="supported-color-schemes" content="dark">
</head>
<body style="margin:0;padding:0;background-color:${C.bg};">
<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${esc(preheader)}&nbsp;&#8203;&nbsp;&#8203;&nbsp;&#8203;&nbsp;&#8203;&nbsp;&#8203;</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="${C.bg}" style="background-color:${C.bg};">
<tr><td align="center" style="padding:36px 16px;">
  <!--[if mso]><table role="presentation" width="560" cellpadding="0" cellspacing="0" align="center"><tr><td><![endif]-->
  <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;max-width:560px;">
    <tr><td align="left" style="padding:0 6px 18px;">
      <img src="${SITE}/syrus-icon.png" width="30" height="30" alt="Syrus" style="border-radius:8px;vertical-align:middle;border:0;">
      <span style="${f(600, 17, 1.2)}color:${C.heading};padding-left:10px;vertical-align:middle;">Syrus</span>
    </td></tr>
    <tr><td bgcolor="${C.card}" style="background-color:${C.card};border:1px solid ${C.border};border-radius:16px;padding:36px 32px;">
      ${inner}
    </td></tr>
    <tr><td align="center" style="padding:26px 12px 0;">
      <p style="margin:0 0 6px;${f(400, 12, 1.6)}color:${C.faint};">
        <a href="${SITE}" style="color:${C.faint};text-decoration:none;font-weight:600;">syrus-ai.dev</a>
        &nbsp;&middot;&nbsp; AI across your delivery pipeline, fully in control
      </p>
      <p style="margin:0 0 10px;${f(400, 12, 1.6, "Georgia,'Times New Roman',serif")}font-style:italic;color:${C.faint};">
        Bis dat qui cito dat.
      </p>
      <p style="margin:0;${f(400, 11, 1.7)}color:#5d6a86;">
        Syrus &middot; Thomas Kadauke &middot; Essegger Str. 27, 71067 Sindelfingen, Germany<br>
        <a href="${SITE}/impressum" style="color:#5d6a86;">Impressum</a>
        &nbsp;&middot;&nbsp;
        <a href="${SITE}/privacy" style="color:#5d6a86;">Privacy</a>
      </p>
    </td></tr>
  </table>
  <!--[if mso]></td></tr></table><![endif]-->
</td></tr>
</table>
</body>
</html>`;
}

/** Confirmation sent to the person who requested the demo. */
function customerEmail({ name }) {
  const fn = esc(firstName(name));
  const steps = [
    ["We read your note", "A real person looks at what you want to build and how your team works today."],
    ["We reach out", "Usually within one business day, to find a slot that suits you."],
    ["You see Syrus on your roadmap", "Goals become tracked epics &amp; tickets, AI writes the code, and a developer approves every merge — live, end to end."],
  ];

  const stepsHtml = steps
    .map(
      (s, i) => `<tr>
<td valign="top" style="padding:0 12px 18px 0;width:28px;">
  <table role="presentation" cellpadding="0" cellspacing="0"><tr>
    <td width="28" height="28" align="center" bgcolor="${C.accent}" style="background-color:${C.accent};border-radius:50%;color:${C.onAccent};${f(700, 13, "28px")}">${i + 1}</td>
  </tr></table>
</td>
<td valign="top" style="padding:1px 0 18px;">
  <p style="margin:0;${f(600, 14, 1.45)}color:${C.heading};">${s[0]}</p>
  <p style="margin:3px 0 0;${f(400, 13, 1.6)}color:${C.body};">${s[1]}</p>
</td>
</tr>`,
    )
    .join("");

  const inner = `
${eyebrow("Demo request received")}
<h1 style="margin:0 0 14px;${f(600, 25, 1.25)}color:${C.heading};letter-spacing:-0.3px;">
  Thanks, ${fn} &mdash; we&rsquo;ve got your request.
</h1>
<p style="margin:0 0 26px;${f(400, 15, 1.65)}color:${C.body};">
  You&rsquo;re one step from seeing how teams ship more of their roadmap with AI &mdash;
  without giving up the git workflow, the reviews, or the final say.
</p>
<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:0 0 10px;">
${stepsHtml}
</table>
<div style="padding:6px 0 26px;">
  ${button(SITE, "Explore Syrus &rarr;")}
</div>
<hr style="border:none;border-top:1px solid ${C.border};margin:0 0 18px;">
<p style="margin:0;${f(400, 13, 1.6)}color:${C.faint};">
  Anything to add &mdash; team size, repos, a date that works? Just reply to this email; it goes straight to us.
</p>`;

  return {
    subject: "Your Syrus demo — here’s what happens next",
    html: shell({
      preheader: "We’ve got your request — expect a reply within one business day.",
      inner,
    }),
    text: `Hi ${firstName(name)},

Thanks — we've got your demo request.

What happens next:
1. We read your note — a real person looks at what you want to build.
2. We reach out, usually within one business day, to find a slot.
3. You see Syrus on your roadmap: goals become tracked epics & tickets, AI writes the code, and a developer approves every merge.

Anything to add — team size, repos, a date that works? Just reply to this email; it goes straight to us.

— The Syrus team
${SITE}

Syrus · Thomas Kadauke · Essegger Str. 27, 71067 Sindelfingen, Germany
Impressum: ${SITE}/impressum · Privacy: ${SITE}/privacy`,
  };
}

/** Internal notification to the team about a new lead. */
function teamEmail({ name, email, company, message, submittedAt }) {
  const fn = firstName(name);
  const when = new Intl.DateTimeFormat("de-DE", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Berlin",
  }).format(submittedAt || new Date());

  const row = (label, valueHtml) => `<tr>
<td valign="top" style="padding:7px 18px 7px 0;${f(600, 11, 1.5, MONO)}letter-spacing:1.5px;text-transform:uppercase;color:${C.faint};white-space:nowrap;">${label}</td>
<td valign="top" style="padding:6px 0;${f(400, 14, 1.5)}color:${C.heading};">${valueHtml}</td>
</tr>`;

  const inner = `
${eyebrow("New demo request")}
<h1 style="margin:0 0 22px;${f(600, 23, 1.3)}color:${C.heading};letter-spacing:-0.3px;">
  ${esc(name)}${company ? ` <span style="color:${C.body};font-weight:400;">&mdash; ${esc(company)}</span>` : ""}
</h1>
<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:0 0 20px;">
${row("Name", esc(name))}
${row("Company", esc(company) || `<span style="color:${C.faint};">&mdash;</span>`)}
${row("Email", `<a href="mailto:${esc(email)}" style="color:${C.accent};text-decoration:none;">${esc(email)}</a>`)}
${row("Received", `${esc(when)} (Berlin)`)}
</table>
<div style="background-color:${C.bg};border-left:3px solid ${C.accent};border-radius:8px;padding:14px 16px;margin:0 0 26px;">
  <p style="margin:0;${f(400, 14, 1.65)}color:${C.quote};">${escMultiline(message) || "(no message)"}</p>
</div>
<div style="padding:0 0 18px;">
  ${button(`mailto:${esc(email)}?subject=${encodeURIComponent("Re: Your Syrus demo request")}`, `Reply to ${esc(fn)} &rarr;`)}
</div>
<p style="margin:0;${f(400, 12, 1.6)}color:${C.faint};">
  Replying to this email goes straight to ${esc(fn)} &mdash; the Reply-To is set to the lead.
</p>`;

  return {
    subject: `New demo request — ${name}${company ? ` (${company})` : ""}`,
    html: shell({
      preheader: `${name}${company ? ` from ${company}` : ""} wants a Syrus demo.`,
      inner,
    }),
    text: `New Syrus demo request

Name:     ${name}
Company:  ${company || "—"}
Email:    ${email}
Received: ${when} (Berlin)

${message || "(no message)"}

Reply to this email to answer ${fn} directly (Reply-To is set to the lead).`,
  };
}

module.exports = { customerEmail, teamEmail };
