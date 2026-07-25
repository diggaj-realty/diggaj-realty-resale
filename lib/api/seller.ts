import { authedGet, authedSend, authedUpload } from "@/lib/api/authed";
import type { Paginated, Property } from "@/types/api";
import type { CreatePropertyInput, SellerKyc } from "@/types/seller";
import type { Offer } from "@/types/buyer";

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

// ── Offers & negotiation (seller side — GET /offers, GET /deals, GET
// /site-visits are role-scoped server-side and shared with lib/api/buyer.ts).
// Sellers act on a forwarded (PENDING) offer with accept / reject / counter —
// distinct from the buyer's acceptCounter / rejectCounter on a COUNTERED one. ──
export const acceptOffer = (token: string, offerId: string) =>
  authedSend<Offer>(`/offers/${offerId}`, token, { method: "PATCH", body: { action: "accept" } });

export const rejectOffer = (token: string, offerId: string) =>
  authedSend<Offer>(`/offers/${offerId}`, token, { method: "PATCH", body: { action: "reject" } });

export const counterOffer = (token: string, offerId: string, counterAmount: number) =>
  authedSend<Offer>(`/offers/${offerId}`, token, {
    method: "PATCH",
    body: { action: "counter", counterAmount },
  });
