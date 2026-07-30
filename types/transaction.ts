import type { SiteVisitOutcome, SiteVisitStatus } from "./buyer";

// ── Property interest — the pre-offer lead, before any Offer/Deal exists ──

export type InterestStatus =
  | "NEW"
  | "CONTACT_REQUESTED"
  | "AGENT_ASSIGNED"
  | "CONTACT_IN_PROGRESS"
  | "SITE_VISIT_REQUESTED"
  | "SITE_VISIT_SCHEDULED"
  | "SITE_VISIT_COMPLETED"
  | "INTERESTED"
  | "NOT_INTERESTED"
  | "NEGOTIATION_IN_PROGRESS"
  | "CONVERTED_TO_DEAL"
  | "CLOSED"
  | "CANCELLED";

export type InterestSource = "SHORTLIST" | "CONTACT_REQUEST" | "SITE_VISIT_REQUEST" | "GENERAL_INTEREST" | "OTHER";

/** Once here, a lead is no longer actionable — mirrors the backend's own
 *  terminal-status list, don't recompute this from status names elsewhere. */
export const TERMINAL_INTEREST_STATUSES: readonly InterestStatus[] = [
  "CONVERTED_TO_DEAL",
  "CLOSED",
  "CANCELLED",
  "NOT_INTERESTED",
];

export type PropertyInterest = {
  id: string;
  propertyId: string;
  buyerId: string;
  agentId: string | null;
  status: InterestStatus;
  source: InterestSource | null;
  buyerNote: string | null;
  createdAt: string;
  updatedAt: string;
  propertyTitle?: string;
  propertyLocation?: string;
  propertyAskingPrice?: number;
  propertyStatus?: string;
  buyerName?: string;
  buyerEmail?: string;
  buyerPhone?: string;
  agentName?: string;
  agentEmail?: string;
  agentPhone?: string;
  /** True in almost all cases — an agent is auto-assigned the moment a lead
   *  is created, and the platform makes an SLA promise on their behalf. */
  agentAssigned?: boolean;
};

/** GET /interests/:id adds the site visits linked to this lead. */
export type InterestSiteVisit = {
  id: string;
  status: SiteVisitStatus;
  outcome: SiteVisitOutcome | null;
  requestedDate: string;
  scheduledDate: string | null;
  dealId: string | null;
};

export type PropertyInterestDetail = PropertyInterest & { siteVisits: InterestSiteVisit[] };

// ── Agent-assisted negotiation session — the offline/phone/in-person path ──

export type NegotiationChannel = "PHONE" | "IN_PERSON" | "ONLINE" | "OTHER";
export type NegotiationSessionStatus = "OPEN" | "AGREEMENT_PENDING_CONFIRMATION" | "AGREED" | "FAILED" | "CANCELLED";

export type NegotiationEventType =
  | "BUYER_POSITION"
  | "SELLER_POSITION"
  | "AGENT_NOTE"
  | "BUYER_COUNTER"
  | "SELLER_COUNTER"
  | "PRICE_PROPOSED"
  | "BUYER_CONFIRMED"
  | "SELLER_CONFIRMED"
  | "AGREEMENT_REACHED"
  | "NEGOTIATION_FAILED"
  | "CONFIRMATIONS_RESET";

export type NegotiationEvent = {
  id: string;
  sessionId: string;
  actorId: string;
  actorRole: "BUYER" | "SELLER" | "AGENT" | "BACKEND" | "ADMIN";
  eventType: NegotiationEventType;
  amount: number | null;
  note: string | null;
  createdAt: string;
};

export type NegotiationSession = {
  id: string;
  propertyId: string;
  interestId: string | null;
  dealId: string | null;
  buyerId: string;
  sellerId: string;
  agentId: string;
  channel: NegotiationChannel;
  status: NegotiationSessionStatus;
  /** Confirmations are per-party and only settable by that party — an agent
   *  can't tick either on someone's behalf. */
  buyerConfirmed: boolean;
  sellerConfirmed: boolean;
  /** The amount currently on the table for both parties to confirm. Changing
   *  it resets both confirmations. */
  proposedAmount: number | null;
  /** Locked in once both parties have confirmed. */
  finalAgreedAmount: number | null;
  /** Derived server-side: both confirmed, an amount is set, and the session
   *  isn't already AGREED — i.e. the agent can convert it to a Deal now. */
  readyForDeal: boolean;
  createdAt: string;
  updatedAt: string;
  propertyTitle?: string;
  propertyLocation?: string;
  propertyAskingPrice?: number;
  buyerName?: string;
  sellerName?: string;
  agentName?: string;
  /** Only present on GET /negotiation-sessions/:id. */
  events?: NegotiationEvent[];
};

/** POST .../confirm's response — the session plus which side just confirmed. */
export type NegotiationConfirmResult = NegotiationSession & {
  confirmedAs: "BUYER" | "SELLER";
  bothConfirmed: boolean;
};

// ── Cross-party document requests — agent-mediated, never a direct channel ──

export type DocumentRequestStatus =
  | "PENDING_AGENT_REVIEW"
  | "REJECTED"
  | "FORWARDED_TO_OWNER"
  | "EXISTING_DOCUMENT_SHARED"
  | "OWNER_UPLOADED"
  | "APPROVED"
  | "COMPLETED"
  | "CANCELLED";

export type DocumentRequest = {
  id: string;
  dealId: string;
  requestedById: string;
  requestedByName?: string;
  requestedFromId: string;
  requestedFromName?: string;
  agentId: string | null;
  agentName?: string;
  docType: string;
  reason: string | null;
  status: DocumentRequestStatus;
  /** Required on rejection — why the agent said no. */
  reviewRemarks: string | null;
  sourceDocumentId: string | null;
  sourceDocument?: { id: string; docType: string; status: string } | null;
  createdAt: string;
  updatedAt: string;
};

// ── Identity verification — per-deal, per-party, distinct from KYC/upload ──

export type IdentityVerificationMethod = "KYC_PROVIDER" | "AADHAAR_OTP" | "OTHER_COMPLIANT_METHOD";
export type IdentityVerificationStatus = "PENDING" | "INITIATED" | "VERIFIED" | "FAILED" | "EXPIRED";

export type DealIdentityVerificationRecord = {
  id: string;
  dealId: string;
  userId: string;
  userName?: string;
  method: IdentityVerificationMethod;
  status: IdentityVerificationStatus;
  providerReference: string | null;
  remarks: string | null;
  verifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

/** GET /deals/:id/identity-verification's response shape. */
export type IdentityVerificationSummary = {
  verifications: DealIdentityVerificationRecord[];
  buyerVerified: boolean;
  sellerVerified: boolean;
  /** The gate the agreement stage depends on. */
  bothVerified: boolean;
};

// ── Agreements + signatures — versioned; a signed version is never edited ──

export type AgreementStatus =
  | "DRAFT"
  | "READY_FOR_SIGNATURE"
  | "SIGNING_IN_PROGRESS"
  | "PARTIALLY_SIGNED"
  | "FULLY_EXECUTED"
  | "EXPIRED"
  | "CANCELLED";

export type SignatureStatus = "PENDING" | "INITIATED" | "SIGNED" | "FAILED" | "EXPIRED";

export type DealSignature = {
  id: string;
  agreementId: string;
  userId: string;
  userName?: string;
  role: "BUYER" | "SELLER";
  status: SignatureStatus;
  provider: string | null;
  providerReference: string | null;
  signedAt: string | null;
  createdAt: string;
};

export type DealAgreement = {
  id: string;
  dealId: string;
  version: number;
  status: AgreementStatus;
  documentUrl: string | null;
  checksum: string | null;
  agreedAmount: number | null;
  createdById: string | null;
  createdAt: string;
  updatedAt: string;
  /** Derived server-side from the signature rows — never assume "executed"
   *  from anything but this. */
  buyerSigned: boolean;
  sellerSigned: boolean;
  fullyExecuted: boolean;
  signatures: DealSignature[];
};

// ── Recorded price confirm/dispute — GET/POST /deals/:id/offline-negotiation ──
// Distinct from the legacy `OfflineNegotiation` embedded in TransactionDetail
// (types/buyer.ts), which lacks bothConfirmed/isDisputeOpen/isCurrent — this
// is the richer, dedicated-endpoint shape and should be the sole rendering
// source once fetched.

export type OfflineNegotiationRecord = {
  id: string;
  dealId: string;
  agreedAmount: number;
  buyerConfirmed: boolean;
  sellerConfirmed: boolean;
  /** The figure becomes the deal's real price only once this is true —
   *  staff cannot set it, only the buyer's and seller's own confirmations do. */
  bothConfirmed: boolean;
  isDisputeOpen: boolean;
  /** False once a newer figure supersedes this one — always respond to the
   *  record where this is true, never an older one. */
  isCurrent: boolean;
  disputedBy: "BUYER" | "SELLER" | null;
  disputedNote: string | null;
  recordedByName?: string;
  createdAt: string;
  updatedAt: string;
};

export type OfflineNegotiationRespondAction =
  | { action: "confirm" }
  | { action: "dispute"; note: string };

// ── Cost sheet acknowledge/query — GET/POST /deals/:id/cost-sheet (buyer-only) ──

export type CostSheetLineCategory = "CHARGE" | "DEDUCTION" | string;

export type CostSheetLine = {
  id: string;
  label: string;
  amount: number;
  category: CostSheetLineCategory;
  note: string | null;
  /** Stamp duty and registration move with circle rates and the
   *  sub-registrar office — must be visibly labeled as an estimate, not
   *  presented as a firm number. */
  isEstimate: boolean;
};

export type CostSheet = {
  id: string;
  dealId: string;
  version: number;
  /** Recomputed server-side from exactly the rows returned — never
   *  recompute this client-side. */
  total: number;
  acknowledgedAt: string | null;
  isQueryOpen: boolean;
  queriedLineId: string | null;
  lines: CostSheetLine[];
};

export type CostSheetRespondAction =
  | { action: "acknowledge" }
  | { action: "query"; lineId: string; note: string };

// ── Deal progress ladder — GET /deals/:id/progress, buyer AND seller ──

export type ProgressStep = {
  stage: string;
  label: string;
  reached: boolean;
  current: boolean;
};

/** `source` must not be flattened: DERIVED is a fact the platform observed
 *  from its own records; DECLARED is a staff member's claim, and can move
 *  backward — the two must render distinctly, not as one uniform bar. */
export type ProgressSource = "DERIVED" | "DECLARED";

export type DealProgress = {
  status?: "FELL_THROUGH";
  failureCode?: string;
  failedAt?: string;
  stage: string;
  stageLabel: string;
  source: ProgressSource;
  steps: ProgressStep[];
  priceConfirmed: boolean;
  documents: { approved: number; total: number };
  /** Buyer-only — omitted entirely for a seller viewer. */
  payments?: unknown;
  costSheet?: unknown;
};
