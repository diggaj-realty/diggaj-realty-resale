import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { buildLeadEmail } from "@/lib/email/leadEmail";

type LeadPayload = {
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
  subject?: string;
  source?: string;
  page?: string;
  referrer?: string;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
  const source = String(body.source ?? "").trim();
  const page = String(body.page ?? "").trim();
  const referrer = String(body.referrer ?? "").trim();

  // `message` is deliberately not required: the compact form variant (sticky
  // bar, listing sidebar) captures name/email/phone only, and rejecting those
  // would throw away the leads this form is most likely to win.
  if (!name || !email) {
    return NextResponse.json({ error: { message: "Name and email are required." } }, { status: 400 });
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: { message: "Enter a valid email address." } }, { status: 400 });
  }

  // Placeholder defaults — swap RESEND_API_KEY/LEAD_FROM_EMAIL/LEAD_TO_EMAIL
  // in .env.local once a sending domain is verified in Resend.
  const from = process.env.LEAD_FROM_EMAIL || "Diggaj Realty <onboarding@resend.dev>";
  const to = process.env.LEAD_TO_EMAIL || "hello@diggajrealty.com";

  const mail = buildLeadEmail({ name, email, phone, message, subject, source, page, referrer });

  const resend = new Resend(apiKey);
  try {
    const { error } = await resend.emails.send({
      from,
      to,
      replyTo: email,
      subject: mail.subject,
      html: mail.html,
      text: mail.text,
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
