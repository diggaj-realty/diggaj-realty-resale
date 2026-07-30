import { authedGet, authedSend } from "@/lib/api/authed";
import type { Paginated } from "@/types/api";
import type { InterestStatus, PropertyInterest, PropertyInterestDetail } from "@/types/transaction";

/** Buyer expresses interest in a property — the pre-offer lead an agent
 *  works from (contact, site visit, offline negotiation), distinct from a
 *  shortlist bookmark and from an online Offer. Idempotent per
 *  (property, buyer): calling again just returns the existing lead. */
export const expressInterest = (
  token: string,
  propertyId: string,
  input?: { source?: string; buyerNote?: string; buyerPhone?: string }
) => authedSend<PropertyInterest>("/interests", token, { method: "POST", body: { propertyId, ...input } });

/** Role-scoped list: buyer sees their own, agent sees leads assigned to
 *  them, seller sees leads on their own properties (buyer contact info
 *  stripped unless they're the assigned agent). */
export const getInterests = (token: string, params?: { status?: InterestStatus; propertyId?: string }) => {
  const qs = new URLSearchParams({ pageSize: "50" });
  if (params?.status) qs.set("status", params.status);
  if (params?.propertyId) qs.set("propertyId", params.propertyId);
  return authedGet<Paginated<PropertyInterest>>(`/interests?${qs}`, token);
};

/** Single lead, with its linked site visits. */
export const getInterest = (token: string, id: string) =>
  authedGet<PropertyInterestDetail>(`/interests/${id}`, token);

/** The only status transition a buyer may make themselves — every other
 *  transition (AGENT_ASSIGNED, INTERESTED, CONVERTED_TO_DEAL, etc.) is
 *  staff- or system-driven. */
export const cancelInterest = (token: string, id: string) =>
  authedSend<PropertyInterest>(`/interests/${id}`, token, { method: "PATCH", body: { status: "CANCELLED" } });
