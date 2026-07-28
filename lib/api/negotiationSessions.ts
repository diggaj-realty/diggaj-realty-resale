import { authedGet, authedSend } from "@/lib/api/authed";
import type { Paginated } from "@/types/api";
import type { NegotiationConfirmResult, NegotiationSession, NegotiationSessionStatus } from "@/types/transaction";

// Agent-assisted negotiation (phone/in-person/offline) — a NegotiationSession
// is created and its events (positions/counters/notes) are recorded by the
// assigned agent/staff only. Buyer/seller only ever read their own sessions
// and confirm the currently-proposed amount below; converting an AGREED
// session into a Deal is also agent/staff-only.

export const getNegotiationSessions = (
  token: string,
  params?: { status?: NegotiationSessionStatus; propertyId?: string }
) => {
  const qs = new URLSearchParams({ pageSize: "50" });
  if (params?.status) qs.set("status", params.status);
  if (params?.propertyId) qs.set("propertyId", params.propertyId);
  return authedGet<Paginated<NegotiationSession>>(`/negotiation-sessions?${qs}`, token);
};

/** Single session with its full event timeline. */
export const getNegotiationSession = (token: string, id: string) =>
  authedGet<NegotiationSession>(`/negotiation-sessions/${id}`, token);

/** Confirms the currently-proposed amount as this caller's own side — which
 *  side is resolved server-side from the token, never passed in. Changing
 *  the proposed amount resets both parties' confirmations, so re-confirming
 *  after a change is normal, not a bug. */
export const confirmNegotiation = (token: string, id: string, agreedAmount?: number) =>
  authedSend<NegotiationConfirmResult>(`/negotiation-sessions/${id}/confirm`, token, {
    method: "POST",
    body: agreedAmount != null ? { agreedAmount } : undefined,
  });

/** Either party (or staff) can end a stalled negotiation — no turn
 *  restriction, mirrors the online-offer `close` action. */
export const endNegotiationSession = (token: string, id: string, action: "fail" | "cancel", note?: string) =>
  authedSend<NegotiationSession>(`/negotiation-sessions/${id}`, token, {
    method: "PATCH",
    body: { action, note },
  });
