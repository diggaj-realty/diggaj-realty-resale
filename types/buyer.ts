import type { GetPropertiesParams, Property } from "./api";

export type OfferStatus =
  | "PENDING_REVIEW"
  | "PENDING"
  | "ACCEPTED"
  | "REJECTED"
  | "COUNTERED"
  | "NEGOTIATION_CLOSED";

/** Unlimited-round negotiation: whoever isn't `turn` is waiting. `null` once
 *  the negotiation is no longer active (accepted/rejected/closed). */
export type OfferTurn = "BUYER" | "SELLER" | null;

export type Offer = {
  id: string;
  propertyId: string;
  buyerId: string;
  amount: number;
  message: string | null;
  status: OfferStatus;
  /** Buyer-facing status (collapses PENDING_REVIEW → PENDING). */
  displayStatus: OfferStatus;
  counterAmount: number | null;
  counterBy: "BACKEND" | "SELLER" | "BUYER" | null;
  /** The number currently on the table — `amount` if never countered, else
   *  the latest `counterAmount`. Use this for button copy, don't recompute. */
  currentAmount: number;
  turn: OfferTurn;
  reviewedBy: string | null;
  createdAt: string;
  updatedAt: string;
  propertyTitle?: string;
  propertyLocation?: string;
};

export type OfferEventType =
  | "CREATED"
  | "FORWARDED"
  | "COUNTERED_BACKEND"
  | "COUNTERED_SELLER"
  | "COUNTERED_BUYER"
  | "ACCEPTED"
  | "REJECTED"
  | "COUNTER_ACCEPTED"
  | "COUNTER_REJECTED"
  | "CLOSED";

export type OfferEvent = {
  id: string;
  type: OfferEventType;
  amount: number | null;
  actorRole: "BUYER" | "SELLER" | "BACKEND";
  note: string | null;
  createdAt: string;
};

export type OfferWithEvents = Offer & { events: OfferEvent[] };

export type DealStatus = "IN_PROGRESS" | "CLOSED" | "CANCELLED";

export type Deal = {
  id: string;
  propertyId: string;
  buyerId: string;
  sellerId: string;
  agentId: string | null;
  agreedPrice: number;
  tokenAmount: number | null;
  tokenDate: string | null;
  finalAmount: number | null;
  finalPaymentDate: string | null;
  paymentMode: string | null;
  transactionRef: string | null;
  notes: string | null;
  status: DealStatus;
  createdAt: string;
  updatedAt: string;
  propertyTitle?: string;
  propertyLocation?: string;
  sellerName?: string;
  agentName?: string;
};

export type SiteVisitStatus = "REQUESTED" | "SCHEDULED" | "COMPLETED" | "CANCELLED";

export type SiteVisit = {
  id: string;
  propertyId: string;
  buyerId: string;
  agentId: string | null;
  status: SiteVisitStatus;
  requestedDate: string;
  scheduledDate: string | null;
  buyerNote: string | null;
  feedback: string | null;
  createdAt: string;
  updatedAt: string;
  propertyTitle?: string;
  propertyLocation?: string;
  agentName?: string;
  buyerName?: string;
};

/** Mirrors the backend's PropertyFilters — same shape GET /properties accepts,
 *  minus pagination — since a SavedSearch just persists a normalized filter set. */
export type SavedSearchFilters = Omit<GetPropertiesParams, "page" | "pageSize">;

export type SavedSearch = {
  id: string;
  name: string | null;
  filters: SavedSearchFilters;
  alertsEnabled: boolean;
  lastAlertedAt: string | null;
  createdAt: string;
};

export type ShortlistedProperty = { shortlistedAt: string } & Property;

export type DealDocumentStatus = "PENDING" | "UPLOADED" | "APPROVED" | "REJECTED";
export type DealDocumentRequiredFrom = "BUYER" | "SELLER" | "EITHER";

/** One row of a deal's closing document checklist (Sale Deed, NOC, Encumbrance
 *  Certificate, etc. — `docType` is free text, staff-defined per deal). */
export type DealDocument = {
  id: string;
  dealId: string;
  docType: string;
  requiredFrom: DealDocumentRequiredFrom;
  fileUrl: string | null;
  status: DealDocumentStatus;
  remarks: string | null;
  uploadedBy: string | null;
  createdAt: string;
  updatedAt: string;
};
