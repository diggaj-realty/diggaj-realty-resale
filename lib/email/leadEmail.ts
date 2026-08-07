/**
 * Lead notification email, shared by app/api/leads/route.ts and
 * app/api/leads/brigade-granada/route.ts.
 *
 * Both routes previously inlined three bare <p> tags separated by em dashes,
 * which arrived as one unstructured run-on line in the default serif face —
 * no labels, nothing clickable, no way to scan a name out of the inbox list.
 *
 * Email HTML is not web HTML. The constraints this file works under:
 *  - Tables for layout. Outlook (Word rendering engine) has no flexbox or grid.
 *  - Inline styles only. Gmail strips <style> blocks in several contexts, and
 *    no client will fetch an external sheet.
 *  - Web-safe font stack. Inter is not installed on the recipient's machine and
 *    @font-face is unreliable, so this deliberately doesn't use the site's face.
 *  - bgcolor attributes alongside CSS background, for the same Outlook reason.
 *  - A text/plain alternative is always sent: some clients block HTML by
 *    default, and having one materially helps spam scoring.
 */

export type LeadEmailFields = {
  name: string;
  email: string;
  phone?: string;
  message: string;
  /** What the visitor was looking at — the form's own subject, e.g. a layout. */
  subject: string;
  /** Set for project microsites; omitted for the general contact form. */
  project?: string;
  page?: string;
  referrer?: string;
};

const INK = "#1c1a16";
const LIME = "#cdea6f";
const CREAM = "#f4efe5";
const BODY = "#6f6f6f";
const FONT =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

export function escapeHtml(s: string): string {
  return s.replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!)
  );
}

/** Digits (and a leading +) only — what tel: accepts. No country code is
 *  invented: a bare 10-digit number stays bare and dials fine domestically. */
function telHref(phone: string): string {
  const cleaned = phone.replace(/[^\d+]/g, "");
  return `tel:${cleaned}`;
}

/** One label/value row of the details table. */
function row(label: string, valueHtml: string): string {
  return `
    <tr>
      <td style="padding:0 0 14px 0;vertical-align:top;width:88px;font-family:${FONT};font-size:11px;line-height:18px;letter-spacing:0.08em;text-transform:uppercase;color:${BODY};">${label}</td>
      <td style="padding:0 0 14px 0;vertical-align:top;font-family:${FONT};font-size:15px;line-height:22px;color:${INK};">${valueHtml}</td>
    </tr>`;
}

/** A table-based button — <a> with padding collapses in Outlook. */
function button(href: string, label: string): string {
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="display:inline-block;margin:0 8px 8px 0;">
      <tr>
        <td bgcolor="${LIME}" style="border-radius:999px;">
          <a href="${href}" style="display:inline-block;padding:11px 22px;font-family:${FONT};font-size:14px;font-weight:600;color:${INK};text-decoration:none;border-radius:999px;">${label}</a>
        </td>
      </tr>
    </table>`;
}

export function buildLeadEmail(f: LeadEmailFields): {
  subject: string;
  html: string;
  text: string;
} {
  const name = f.name.trim();
  const email = f.email.trim();
  const phone = (f.phone ?? "").trim();
  const message = f.message.trim();
  const project = (f.project ?? "").trim();

  // Scannable from the inbox list without opening anything: who it is and how
  // to reach them. The old "New lead: Brigade Granada — EOI enquiry" repeated
  // the project twice and never named the person.
  const who = phone ? `${name} · ${phone}` : name;
  const subject = project ? `New lead · ${project} — ${who}` : `New lead · ${who}`;

  const receivedAt = new Date().toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "medium",
    timeStyle: "short",
  });

  const meta: [string, string][] = [
    ...(project ? ([["Project", project]] as [string, string][]) : []),
    ["Enquiry", f.subject],
    ["Page", f.page || "—"],
    ["Referrer", f.referrer || "direct / none"],
    ["Received", `${receivedAt} IST`],
  ];

  const html = `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<meta name="color-scheme" content="light only" />
<title>${escapeHtml(subject)}</title>
</head>
<body style="margin:0;padding:0;background:${CREAM};">
  <!-- Inbox preview line: shown next to the subject, then hidden in the body. -->
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">
    ${escapeHtml(name)} — ${escapeHtml(email)}${phone ? ` — ${escapeHtml(phone)}` : ""}
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${CREAM}" style="background:${CREAM};padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;background:#ffffff;border-radius:14px;overflow:hidden;">

          <!-- Header -->
          <tr>
            <td bgcolor="${INK}" style="background:${INK};padding:26px 32px;">
              <div style="font-family:${FONT};font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:${LIME};">
                ${project ? escapeHtml(project) : "Diggaj Realty"}
              </div>
              <div style="margin-top:8px;font-family:${FONT};font-size:22px;line-height:28px;font-weight:600;color:#ffffff;">
                New enquiry
              </div>
            </td>
          </tr>

          <!-- Contact + actions -->
          <tr>
            <td style="padding:32px 32px 8px 32px;">
              <div style="font-family:${FONT};font-size:24px;line-height:30px;font-weight:600;color:${INK};">
                ${escapeHtml(name)}
              </div>
              <div style="margin-top:20px;">
                ${phone ? button(telHref(phone), `Call ${escapeHtml(phone)}`) : ""}
                ${button(`mailto:${escapeHtml(email)}`, "Reply by email")}
              </div>
            </td>
          </tr>

          <!-- Details -->
          <tr>
            <td style="padding:20px 32px 8px 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                ${row(
                  "Email",
                  `<a href="mailto:${escapeHtml(email)}" style="color:${INK};text-decoration:underline;word-break:break-all;">${escapeHtml(email)}</a>`
                )}
                ${
                  phone
                    ? row(
                        "Phone",
                        `<a href="${telHref(phone)}" style="color:${INK};text-decoration:underline;">${escapeHtml(phone)}</a>`
                      )
                    : ""
                }
              </table>
            </td>
          </tr>

          <!-- Message -->
          <tr>
            <td style="padding:8px 32px 0 32px;">
              <div style="font-family:${FONT};font-size:11px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:${BODY};">
                Message
              </div>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:10px;">
                <tr>
                  <td bgcolor="${CREAM}" style="background:${CREAM};border-radius:10px;padding:16px 18px;font-family:${FONT};font-size:15px;line-height:24px;color:${INK};">
                    ${escapeHtml(message).replace(/\r?\n/g, "<br />")}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Meta -->
          <tr>
            <td style="padding:26px 32px 30px 32px;">
              <div style="border-top:1px solid #e9e6df;padding-top:18px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                  ${meta
                    .map(
                      ([k, v]) => `
                  <tr>
                    <td style="padding:0 12px 6px 0;vertical-align:top;font-family:${FONT};font-size:12px;line-height:18px;color:${BODY};white-space:nowrap;">${escapeHtml(k)}</td>
                    <td style="padding:0 0 6px 0;vertical-align:top;font-family:${FONT};font-size:12px;line-height:18px;color:${BODY};word-break:break-all;">${escapeHtml(v)}</td>
                  </tr>`
                    )
                    .join("")}
                </table>
              </div>
            </td>
          </tr>
        </table>

        <div style="margin-top:16px;font-family:${FONT};font-size:11px;line-height:16px;color:${BODY};">
          Sent by diggajrealty.com · Reply to this email to reach ${escapeHtml(name)} directly.
        </div>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = [
    subject,
    "",
    `Name:    ${name}`,
    `Email:   ${email}`,
    ...(phone ? [`Phone:   ${phone}`] : []),
    "",
    "Message:",
    message,
    "",
    "---",
    ...meta.map(([k, v]) => `${k}: ${v}`),
    "",
    `Reply to this email to reach ${name} directly.`,
  ].join("\n");

  return { subject, html, text };
}
