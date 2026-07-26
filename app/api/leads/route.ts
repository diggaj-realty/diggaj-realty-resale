import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

type LeadPayload = { name?: string; email?: string; phone?: string; message?: string; subject?: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}

/** Sends a contact/lead submission to the team via Resend. This is a
 *  same-origin Next.js Route Handler (not the external resale-admin API) —
 *  the backend has no leads endpoint of its own, and this needs a
 *  server-only API key, so it lives here rather than in lib/api/client.ts. */
export async function POST(req: NextRequest) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: { message: "Lead notifications aren't configured yet — please email us directly instead." } },
      { status: 503 }
    );
  }

  let body: LeadPayload;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: { message: "Invalid request body" } }, { status: 400 });
  }

  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").trim();
  const phone = String(body.phone ?? "").trim();
  const message = String(body.message ?? "").trim();
  const subject = String(body.subject ?? "General inquiry").trim() || "General inquiry";

  if (!name || !email || !message) {
    return NextResponse.json({ error: { message: "Name, email, and message are required." } }, { status: 400 });
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: { message: "Enter a valid email address." } }, { status: 400 });
  }

  // Placeholder defaults — swap RESEND_API_KEY/LEAD_FROM_EMAIL/LEAD_TO_EMAIL
  // in .env.local once a sending domain is verified in Resend.
  const from = process.env.LEAD_FROM_EMAIL || "Diggaj Realty <onboarding@resend.dev>";
  const to = process.env.LEAD_TO_EMAIL || "hello@diggajrealty.com";

  const resend = new Resend(apiKey);
  try {
    const { error } = await resend.emails.send({
      from,
      to,
      replyTo: email,
      subject: `New lead: ${subject}`,
      html: `
        <p><strong>${escapeHtml(name)}</strong> — ${escapeHtml(email)}${phone ? ` — ${escapeHtml(phone)}` : ""}</p>
        <p>${escapeHtml(message).replace(/\n/g, "<br/>")}</p>
        <p style="color:#999;font-size:12px">Subject: ${escapeHtml(subject)}</p>
      `,
    });
    if (error) throw new Error(error.message);
  } catch (err) {
    console.error("Lead email error:", err);
    return NextResponse.json(
      { error: { message: "Couldn't send your message — please try again or email us directly." } },
      { status: 502 }
    );
  }

  return NextResponse.json({ data: { sent: true } });
}
