import { authedGet, authedSend } from "@/lib/api/authed";
import type {
  DealAgreement,
  DealIdentityVerificationRecord,
  DealSignature,
  IdentityVerificationMethod,
  IdentityVerificationSummary,
} from "@/types/transaction";

// ── Identity verification ──
// Per-deal, per-party — distinct from seller KYC and from uploading an ID
// document. A party may only ever start their OWN verification; actually
// marking it VERIFIED/FAILED/EXPIRED requires a verified provider callback,
// which today is a staff-only manual stand-in (no self-service completion,
// and no agent-on-behalf-of path exists).

export const getIdentityVerification = (token: string, dealId: string) =>
  authedGet<IdentityVerificationSummary>(`/deals/${dealId}/identity-verification`, token);

/** Starts your own verification (PENDING/FAILED/EXPIRED → INITIATED). */
export const initiateIdentityVerification = (
  token: string,
  dealId: string,
  method?: IdentityVerificationMethod
) =>
  authedSend<DealIdentityVerificationRecord>(`/deals/${dealId}/identity-verification`, token, {
    method: "POST",
    body: method ? { method } : {},
  });

// ── Agreements + signatures ──
// Generating a new version and completing a signature are both agent/staff-
// only (the latter mirrors payments' markPaid — "the user clicked sign" is
// not evidence of a binding signature). A buyer/seller may only initiate
// their own signature slot.

/** All versions, newest first, each with its embedded signatures. */
export const getAgreements = (token: string, dealId: string) =>
  authedGet<DealAgreement[]>(`/deals/${dealId}/agreements`, token);

/** Starts your own signature on one agreement version — the only signature
 *  action a buyer/seller may take. Returns just the updated signature; the
 *  caller should refetch getAgreements to see the recomputed agreement
 *  status. */
export const initiateSignature = (token: string, dealId: string, agreementId: string) =>
  authedSend<DealSignature>(`/deals/${dealId}/agreements/${agreementId}/signatures`, token, {
    method: "PATCH",
    body: { action: "initiate" },
  });
