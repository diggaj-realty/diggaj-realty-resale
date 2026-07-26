export type LeadInput = {
  name: string;
  email: string;
  phone?: string;
  message: string;
  subject?: string;
};

/** POSTs a contact/lead submission to this app's own /api/leads route (a
 *  same-origin Next.js Route Handler backed by Resend) — not the external
 *  resale-admin API, so this doesn't go through lib/api/client.ts's `api()`. */
export async function submitLead(input: LeadInput): Promise<void> {
  const res = await fetch("/api/leads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const json = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(json?.error?.message ?? "Failed to send message");
  }
}
