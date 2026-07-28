import type { Deal } from "@/types/buyer";
import type { IdentityVerificationSummary, DealAgreement } from "@/types/transaction";

export type ClosureRequirement = { label: string; met: boolean; detail?: string };

export type ClosureChecklist = {
  finalPayment: ClosureRequirement;
  documents: ClosureRequirement;
  identity: ClosureRequirement;
  agreement: ClosureRequirement;
  payments: ClosureRequirement;
};

/** Mirrors the backend's evaluateClosureGate as closely as a buyer/seller CAN
 *  see it — the real gate (GET/POST /deals/:id/close) is agent/staff-only,
 *  and it also checks AppConfig.closureRequires* toggles that aren't exposed
 *  to non-staff. So this deliberately doesn't assert a definitive
 *  canClose/blocked verdict (that would risk being wrong about what's
 *  actually required for this specific deal) — it just shows each
 *  dimension's real state. Only "final payment recorded" is unconditionally
 *  required server-side, everything else may or may not be gating closure
 *  depending on staff configuration.
 *
 *  Isolated here, one function, rather than scattered across components —
 *  per the same principle TransactionTimeline already follows for `stage`. */
export function deriveClosureChecklist({
  deal,
  documentProgress,
  identity,
  latestAgreement,
  paymentProgress,
}: {
  deal: Deal;
  documentProgress: { approved: number; total: number };
  identity: IdentityVerificationSummary | null;
  latestAgreement: DealAgreement | null;
  paymentProgress: { paid: number; total: number };
}): ClosureChecklist {
  return {
    finalPayment: {
      label: "Final payment recorded",
      met: deal.finalPaymentDate != null,
    },
    documents: {
      label: "Documents approved",
      met: documentProgress.total === 0 || documentProgress.approved === documentProgress.total,
      detail: `${documentProgress.approved}/${documentProgress.total}`,
    },
    identity: {
      label: "Both identities verified",
      met: identity?.bothVerified ?? false,
    },
    agreement: {
      label: "Agreement fully executed",
      met: latestAgreement?.fullyExecuted ?? false,
    },
    payments: {
      label: "Payments settled",
      met: paymentProgress.total === 0 || paymentProgress.paid === paymentProgress.total,
      detail: `${paymentProgress.paid}/${paymentProgress.total}`,
    },
  };
}
