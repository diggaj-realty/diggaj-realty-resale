import { authedGet, authedSend } from "@/lib/api/authed";
import type { Paginated } from "@/types/api";
import type {
  Deal,
  Offer,
  SavedSearch,
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

// ── Site visits ──
export const getSiteVisits = (token: string) =>
  authedGet<Paginated<SiteVisit>>("/site-visits?pageSize=50", token);

export const cancelSiteVisit = (token: string, id: string) =>
  authedSend<SiteVisit>(`/site-visits/${id}`, token, {
    method: "PATCH",
    body: { action: "cancel" },
  });

// ── Saved searches ──
export const getSavedSearches = (token: string) =>
  authedGet<SavedSearch[]>("/saved-searches", token);

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
