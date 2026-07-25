import { authedGet, authedSend } from "@/lib/api/authed";
import type { Paginated } from "@/types/api";
import type {
  Deal,
  Offer,
  SavedSearch,
  SavedSearchFilters,
  SiteVisit,
  ShortlistedProperty,
} from "@/types/buyer";

// ── Saved properties (shortlist) ──
export const getShortlist = (token: string) =>
  authedGet<Paginated<ShortlistedProperty>>("/shortlists?pageSize=50", token);

export const removeShortlist = (token: string, propertyId: string) =>
  authedSend<{ propertyId: string; shortlisted: boolean }>(`/shortlists/${propertyId}`, token, {
    method: "DELETE",
  });

// ── Offers & negotiation ──
export const getOffers = (token: string) =>
  authedGet<Paginated<Offer>>("/offers?pageSize=50", token);

/** Respond to a seller/backend counter offer (re-negotiation). */
export const respondToCounter = (token: string, offerId: string, accept: boolean) =>
  authedSend<Offer>(`/offers/${offerId}`, token, {
    method: "PATCH",
    body: { action: accept ? "acceptCounter" : "rejectCounter" },
  });

/** Buyer makes a new offer on a LIVE property. Always starts PENDING_REVIEW. */
export const createOffer = (
  token: string,
  input: { propertyId: string; amount: number; message?: string }
) => authedSend<Offer>("/offers", token, { method: "POST", body: input });

// ── Site visits ──
export const getSiteVisits = (token: string) =>
  authedGet<Paginated<SiteVisit>>("/site-visits?pageSize=50", token);

export const cancelSiteVisit = (token: string, id: string) =>
  authedSend<SiteVisit>(`/site-visits/${id}`, token, {
    method: "PATCH",
    body: { action: "cancel" },
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
