import { authedGet, authedSend } from "@/lib/api/authed";
import type { Paginated } from "@/types/api";
import type {
  Deal,
  DealDocument,
  Offer,
  OfferWithEvents,
  PaymentRequest,
  SavedSearch,
  SavedSearchFilters,
  SiteVisit,
  ShortlistedProperty,
  TransactionDetail,
} from "@/types/buyer";

// ── Saved properties (shortlist) ──
export const getShortlist = (token: string) =>
  authedGet<Paginated<ShortlistedProperty>>("/shortlists?pageSize=50", token);

export const addShortlist = (token: string, propertyId: string) =>
  authedSend<{ propertyId: string; shortlisted: boolean }>("/shortlists", token, {
    method: "POST",
    body: { propertyId },
  });

export const removeShortlist = (token: string, propertyId: string) =>
  authedSend<{ propertyId: string; shortlisted: boolean }>(`/shortlists/${propertyId}`, token, {
    method: "DELETE",
  });

// ── Offers & negotiation ──
// `as` picks which side to view for a dual-role (buyer+seller) account —
// harmless to always pass for a single-role account too, it just confirms
// the side that role already resolves to.
export const getOffers = (token: string, as?: "buyer" | "seller") =>
  authedGet<Paginated<Offer>>(`/offers?pageSize=50${as ? `&as=${as}` : ""}`, token);

/** Single offer with its full events[] timeline, oldest first. Not included
 *  on the list endpoint — fetch this when a user opens one offer's history. */
export const getOffer = (token: string, offerId: string) =>
  authedGet<OfferWithEvents>(`/offers/${offerId}`, token);

// Unlimited-round negotiation (§5 of the API reference): these four actions
// are shared by both buyer and seller — which one is callable right now is
// gated by the offer's own `turn` field, not by who you are. `accept` always
// accepts `currentAmount`, whatever's currently on the table.
export const acceptOffer = (token: string, offerId: string) =>
  authedSend<Offer>(`/offers/${offerId}`, token, { method: "PATCH", body: { action: "accept" } });

export const rejectOffer = (token: string, offerId: string) =>
  authedSend<Offer>(`/offers/${offerId}`, token, { method: "PATCH", body: { action: "reject" } });

export const counterOffer = (token: string, offerId: string, counterAmount: number) =>
  authedSend<Offer>(`/offers/${offerId}`, token, {
    method: "PATCH",
    body: { action: "counter", counterAmount },
  });

/** Ends the negotiation with no deal — callable by either party (or staff)
 *  regardless of whose turn it is, any time the offer is still active. */
export const closeNegotiation = (token: string, offerId: string) =>
  authedSend<Offer>(`/offers/${offerId}`, token, { method: "PATCH", body: { action: "close" } });

/** Buyer makes a new offer on a LIVE property. Always starts PENDING_REVIEW. */
export const createOffer = (
  token: string,
  input: { propertyId: string; amount: number; message?: string }
) => authedSend<Offer>("/offers", token, { method: "POST", body: input });

// ── Site visits ──
export const getSiteVisits = (token: string, as?: "buyer" | "seller") =>
  authedGet<Paginated<SiteVisit>>(`/site-visits?pageSize=50${as ? `&as=${as}` : ""}`, token);

export const cancelSiteVisit = (token: string, id: string) =>
  authedSend<SiteVisit>(`/site-visits/${id}`, token, {
    method: "PATCH",
    body: { action: "cancel" },
  });

// Mutual date agreement (buyer <-> agent): either side proposes a time, the
// other accepts, declines, or proposes a different one. Only callable by the
// visit's buyer or its assigned agent — sellers are read-only on site visits.
export const proposeSiteVisit = (token: string, id: string, proposedDate: string) =>
  authedSend<SiteVisit>(`/site-visits/${id}`, token, {
    method: "PATCH",
    body: { action: "propose", proposedDate },
  });

export const acceptSiteVisit = (token: string, id: string) =>
  authedSend<SiteVisit>(`/site-visits/${id}`, token, {
    method: "PATCH",
    body: { action: "accept" },
  });

export const declineSiteVisit = (token: string, id: string, reason?: string) =>
  authedSend<SiteVisit>(`/site-visits/${id}`, token, {
    method: "PATCH",
    body: { action: "decline", ...(reason ? { reason } : {}) },
  });

/** Buyer requests a site visit. Auto-assigns the property's agent, if any.
 *  403s with a clear message if AppConfig.siteVisitsEnabled is off. */
export const createSiteVisit = (
  token: string,
  input: { propertyId: string; requestedDate: string; buyerNote?: string }
) => authedSend<SiteVisit>("/site-visits", token, { method: "POST", body: input });

// ── Saved searches ──
export const getSavedSearches = (token: string) =>
  authedGet<SavedSearch[]>("/saved-searches", token);

export const createSavedSearch = (
  token: string,
  input: { name?: string; filters: SavedSearchFilters; alertsEnabled?: boolean }
) => authedSend<SavedSearch>("/saved-searches", token, { method: "POST", body: input });

export const deleteSavedSearch = (token: string, id: string) =>
  authedSend<{ id: string; deleted: boolean }>(`/saved-searches/${id}`, token, {
    method: "DELETE",
  });

export const setSavedSearchAlerts = (token: string, id: string, alertsEnabled: boolean) =>
  authedSend<{ id: string; name: string | null; alertsEnabled: boolean }>(
    `/saved-searches/${id}`,
    token,
    { method: "PATCH", body: { alertsEnabled } }
  );

// ── Deals (closing / documentation flow) ──
export const getDeals = (token: string) =>
  authedGet<Paginated<Deal>>("/deals?pageSize=50", token);

// ── Deal closing document checklist ──
// Shared by buyer and seller views — access is participant-scoped server-side.
export const getDealDocuments = (token: string, dealId: string) =>
  authedGet<DealDocument[]>(`/deals/${dealId}/documents`, token);

/** Buyer/seller fulfills a checklist item. `fileUrl` must come from
 *  `authedUpload(token, file, "deal-documents")` first. Auto-advances the
 *  document to UPLOADED — approval/rejection is staff-only. */
export const uploadDealDocument = (token: string, dealId: string, docId: string, fileUrl: string) =>
  authedSend<DealDocument>(`/deals/${dealId}/documents/${docId}`, token, {
    method: "PATCH",
    body: { fileUrl },
  });

// ── Post-acceptance transaction detail ──
// One deal id, one call: property, both parties, assigned agent, the
// accepted offer's full timeline, site visit, offline negotiation records,
// document checklist, payment requests, and the backend-derived `stage` —
// see `GET /accepted-offers/:id` in the resale-admin API. Same party-scoped
// access as `/deals/:id` (buyer/seller/agent of this specific deal, or staff).
export const getTransactionDetail = (token: string, dealId: string) =>
  authedGet<TransactionDetail>(`/accepted-offers/${dealId}`, token);

/** The only payment-request action a buyer/seller may ever call — marks
 *  "I've started paying," not "I've paid." Only the party the request is
 *  addressed to (`recipient`) may call this; `markPaid`/`markFailed`/`cancel`
 *  are staff-only and deliberately have no frontend entry point. */
export const initiatePayment = (token: string, dealId: string, requestId: string) =>
  authedSend<PaymentRequest>(`/deals/${dealId}/payment-requests/${requestId}`, token, {
    method: "PATCH",
    body: { action: "initiate" },
  });
