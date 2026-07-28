import { authedGet, authedSend } from "@/lib/api/authed";
import type { DocumentRequest } from "@/types/transaction";

// Cross-party document requests — never a direct buyer↔seller channel.
// Every request lands on the deal's agent first; only they can reject,
// forward it as a fresh upload requirement, or share an already-approved
// document. None of those three review actions exist on this side of the
// app — buyer/seller only request and (while still open) cancel their own.

/** Requests on a deal — buyer/seller see their own (made or received);
 *  agent/staff see all of them. */
export const getDocumentRequests = (token: string, dealId: string) =>
  authedGet<DocumentRequest[]>(`/deals/${dealId}/document-requests`, token);

/** Asks for a document held by the other party. `requestedFrom` is derived
 *  server-side (the other side of this deal) — not something the caller
 *  picks. Blocked (409) if an open request for the same doc already exists. */
export const requestDocument = (token: string, dealId: string, docType: string, reason?: string) =>
  authedSend<DocumentRequest>(`/deals/${dealId}/document-requests`, token, {
    method: "POST",
    body: { docType, reason },
  });

/** Withdraws a request you made yourself, while it's still open
 *  (PENDING_AGENT_REVIEW or FORWARDED_TO_OWNER). */
export const cancelDocumentRequest = (token: string, dealId: string, requestId: string) =>
  authedSend<DocumentRequest>(`/deals/${dealId}/document-requests/${requestId}`, token, {
    method: "PATCH",
    body: { action: "cancel" },
  });
