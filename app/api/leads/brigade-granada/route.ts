import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { buildLeadEmail } from "@/lib/email/leadEmail";

type LeadPayload = {
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
  subject?: string;
  page?: string;
  referrer?: string;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Dedicated lead endpoint for the Brigade Granada microsite. Kept separate
 *  from app/api/leads/route.ts: it uses its own Resend key and inbox
 *  (BRIGADE_GRANADA_RESEND_API_KEY / BRIGADE_GRANADA_LEAD_TO_EMAIL), scoped to
 *  this one project rather than the shared RESEND_API_KEY. Phone is required
 *  here (unlike the general form) since EOI follow-up is phone-first. */
export async function POST(req: NextRequest) {
  const apiKey = process.env.BRIGADE_GRANADA_RESEND_API_KEY;
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
  const subject = String(body.subject ?? "Brigade Granada enquiry").trim() || "Brigade Granada enquiry";
  const page = String(body.page ?? "").trim();
  const referrer = String(body.referrer ?? "").trim();

  if (!name || !email || !phone || !message) {
    return NextResponse.json(
      { error: { message: "Name, email, phone, and message are required." } },
      { status: 400 }
    );
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: { message: "Enter a valid email address." } }, { status: 400 });
  }

  const from = process.env.LEAD_FROM_EMAIL || "Diggaj Realty <onboarding@resend.dev>";
  const to = (process.env.BRIGADE_GRANADA_LEAD_TO_EMAIL || "it@diggajrealty.com,abhishek@diggajrealty.com")
    .split(",")
    .map((addr) => addr.trim())
    .filter(Boolean);

  const mail = buildLeadEmail({
    name,
    email,
    phone,
    message,
    subject,
    project: "Brigade Granada",
    page,
    referrer,
  });

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
    console.error("Brigade Granada lead email error:", err);
    return NextResponse.json(
      { error: { message: "Couldn't send your message — please try again or email us directly." } },
      { status: 502 }
    );
  }

  return NextResponse.json({ data: { sent: true } });
}
