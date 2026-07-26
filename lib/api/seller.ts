import { authedGet, authedSend, authedUpload } from "@/lib/api/authed";
import type { Paginated, Property } from "@/types/api";
import type { CreatePropertyInput, SellerKyc } from "@/types/seller";

// ── KYC ──
export const getMyKyc = (token: string) => authedGet<SellerKyc | null>("/kyc", token);

export const submitKyc = (
  token: string,
  input: { idType: string; idDocUrl: string; selfieUrl: string }
) => authedSend<SellerKyc>("/kyc", token, { method: "POST", body: input });

// ── Uploads ──
export const uploadKycFile = (token: string, file: File) =>
  authedUpload(token, file, "kyc-documents");

export const uploadPropertyMedia = (token: string, file: File) =>
  authedUpload(token, file, "property-media");

// ── Listings ──
export const getMyListings = (token: string) =>
  authedGet<Paginated<Property>>("/listings?pageSize=50", token);

export const createListing = (token: string, input: CreatePropertyInput) =>
  authedSend<Property>("/listings", token, { method: "POST", body: input });

// Seller requests to promote a property to a higher plan (currently ELITE
// only). Doesn't change `plan` immediately — sets `requestedPlan` pending
// staff approval. No payment collected yet.
export const requestPlanUpgrade = (token: string, propertyId: string, plan: "ELITE") =>
  authedSend<Property>(`/listings/${propertyId}/request-plan`, token, { method: "POST", body: { plan } });

// Offer negotiation actions (accept/reject/counter/close) and GET /offers,
// /deals, /site-visits are all role-symmetric and live in lib/api/buyer.ts —
// the backend gates them by the record's `turn`/participants, not by role.
