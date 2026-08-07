export type LeadInput = {
  name: string;
  email: string;
  phone?: string;
  message: string;
  subject?: string;
  page?: string;
  referrer?: string;
};

/** POSTs a contact/lead submission to a same-origin Next.js Route Handler
 *  backed by Resend — not the external resale-admin API, so this doesn't go
 *  through lib/api/client.ts's `api()`. `endpoint` defaults to the general
 *  /api/leads route; project microsites (e.g. Brigade Granada) pass their own
 *  dedicated route so they can use a separate Resend key/inbox. */
export async function submitLead(input: LeadInput, endpoint = "/api/leads"): Promise<void> {
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const json = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(json?.error?.message ?? "Failed to send message");
  }
}
