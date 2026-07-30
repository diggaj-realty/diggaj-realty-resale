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

/** Agent's post-visit call — negotiation happens in person on the visit
 *  itself, this just records what was agreed. Not yet returned by any
 *  /api/v1 response (the backend's siteVisitDTO doesn't serialize these two
 *  columns yet, even though they exist on the model) — typed here so the UI
 *  picks them up the moment that changes, but expect `undefined`/`null` today. */
export type SiteVisitOutcome = "INTERESTED" | "NOT_INTERESTED";

/** How the current/most recent SCHEDULED date was set. AGREED_OFFLINE means
 *  staff booked it directly from a phone call and asserted the buyer's
 *  agreement — the buyer never confirmed it in-app, and can dispute it.
 *  BUYER_ACCEPTED means the buyer confirmed it themselves via acceptSiteVisit,
 *  and is rescheduled rather than disputed. */
export type SiteVisitScheduledVia = "AGREED_OFFLINE" | "BUYER_ACCEPTED";

export type SiteVisit = {
  id: string;
  propertyId: string;
  buyerId: string;
  agentId: string | null;
  status: SiteVisitStatus;
  requestedDate: string;
  scheduledDate: string | null;
  /** A time put forward but not yet agreed, and by whom — only set while
   *  status is REQUESTED and a propose/accept/decline round is in progress. */
  proposedDate: string | null;
  proposedBy: "BUYER" | "AGENT" | null;
  /** Whose response the visit is waiting on; null once it's SCHEDULED/CANCELLED/COMPLETED. */
  awaitingResponseFrom: "BUYER" | "AGENT" | null;
  /** Only meaningful once status is (or was) SCHEDULED — older visits and
   *  ones never scheduled won't have it. */
  scheduledVia?: SiteVisitScheduledVia | null;
  buyerNote: string | null;
  feedback: string | null;
  createdAt: string;
  updatedAt: string;
  propertyTitle?: string;
  propertyLocation?: string;
  agentName?: string;
  buyerName?: string;
  outcome?: SiteVisitOutcome | null;
  interestedAmount?: number | null;
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
  /** The party this document belongs to — distinct from `uploadedBy`.
   *  `null` on older documents predating ownership tracking. */
  ownerId: string | null;
  /** Whether the current viewer may see `fileUrl` — the owner, the deal's
   *  agent/staff, or a party holding an active DocumentAccessGrant. When
   *  `false`, `fileUrl` is nulled out server-side regardless of `status`. */
  canView: boolean;
};

/** What the buyer and seller agreed off-platform (in person, by phone, or
 *  through the agent), logged after the fact by the assigned agent/staff.
 *  Purely additive — never overwrites the online Offer/OfferEvent history. */
export type OfflineNegotiation = {
  id: string;
  dealId: string;
  agreedAmount: number;
  buyerConfirmed: boolean;
  sellerConfirmed: boolean;
  notes: string | null;
  recordedById: string;
  recordedByName?: string;
  createdAt: string;
  updatedAt: string;
};

export type PaymentRequestStatus = "PENDING" | "PAYMENT_INITIATED" | "PAID" | "FAILED" | "CANCELLED";
export type PaymentRecipient = "BUYER" | "SELLER";

/** A request for money that surfaces on the buyer's or seller's own
 *  dashboard with a "Pay Now" action. Only the backend (or eventually a
 *  verified payment-gateway webhook) may ever set `PAID` — `initiate` is the
 *  only lifecycle action a buyer/seller can call. */
export type PaymentRequest = {
  id: string;
  dealId: string;
  recipient: PaymentRecipient;
  amount: number;
  title: string | null;
  description: string | null;
  dueDate: string | null;
  status: PaymentRequestStatus;
  paidAt: string | null;
  paymentRef: string | null;
  createdById: string;
  createdByName?: string;
  createdAt: string;
  updatedAt: string;
};

/** Derived operational stage for a post-acceptance deal — computed and
 *  returned by the backend (`computeDealProgress`), never recomputed here. */
export type DealStage =
  | "OFFER_ACCEPTED"
  | "AGENT_ASSIGNED"
  | "SITE_VISIT_PENDING"
  | "SITE_VISIT_COMPLETED"
  | "NEGOTIATION_RECORDED"
  | "DOCUMENTATION_IN_PROGRESS"
  | "DOCUMENTATION_COMPLETE"
  | "IDENTITY_VERIFICATION"
  | "AGREEMENT_SIGNING"
  | "PAYMENT_IN_PROGRESS"
  | "PAYMENT_COMPLETE"
  | "DEAL_CLOSED";

/** Free-text, dated progress updates posted by agent/staff — customer-facing,
 *  distinct from the structured document/payment records above. */
export type DealLogEntry = {
  id: string;
  message: string;
  authorRole: "AGENT" | "BACKEND" | "ADMIN" | string;
  createdAt: string;
};

export type TransactionParty = {
  id: string;
  name: string;
  email?: string;
  phone?: string | null;
};

/** The complete post-acceptance transaction view — GET /accepted-offers/:id
 *  (`:id` is the deal id; a Deal is created the instant an offer/visit is
 *  accepted, so it's the stable handle for the whole closing process).
 *  Readable by the deal's own buyer/seller/agent, or BACKEND/ADMIN. */
export type TransactionDetail = {
  dealId: string;
  stage: DealStage;
  stageLabel: string;
  documentProgress: { approved: number; total: number };
  paymentProgress: { paid: number; total: number; pendingAmount: number };

  property: Property;
  buyer: TransactionParty;
  seller: TransactionParty;
  agent: TransactionParty | null;

  /** Null when the deal came straight from a site visit agreed in person —
   *  a legitimate path, not missing data. */
  acceptedOffer: OfferWithEvents | null;
  deal: Deal;

  siteVisit: SiteVisit | null;
  offlineNegotiations: OfflineNegotiation[];
  documents: DealDocument[];
  /** Pre-scoped by the backend to the caller's own side unless they're staff
   *  or the assigned agent — render as-is, no further filtering needed. */
  paymentRequests: PaymentRequest[];
  logEntries: DealLogEntry[];
};
