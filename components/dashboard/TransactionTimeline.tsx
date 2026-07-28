import type { DealStage } from "@/types/buyer";

// Collapses the backend's 12-value DealStage onto the 9 milestones this
// timeline shows — purely a display grouping, the underlying `stage` string
// (computed server-side by computeDealProgress) is what's authoritative.
// Site Visit / Negotiation may never light up for a given deal — both are
// optional parts of a transaction, not guaranteed steps. Note the backend's
// own stage-check order can report a payment stage before identity/agreement
// are done in some cases — that's a real backend ordering quirk, not
// something to "fix" here: this table only maps each stage name to its
// conceptual position, it never re-derives which stage is current.
const NODES = [
  "Offer Accepted",
  "Agent Assigned",
  "Site Visit",
  "Negotiation",
  "Documents",
  "Identity Verification",
  "Agreement",
  "Payment",
  "Closed",
] as const;

const STAGE_TO_NODE: Record<DealStage, number> = {
  OFFER_ACCEPTED: 0,
  AGENT_ASSIGNED: 1,
  SITE_VISIT_PENDING: 2,
  SITE_VISIT_COMPLETED: 2,
  NEGOTIATION_RECORDED: 3,
  DOCUMENTATION_IN_PROGRESS: 4,
  DOCUMENTATION_COMPLETE: 4,
  IDENTITY_VERIFICATION: 5,
  AGREEMENT_SIGNING: 6,
  PAYMENT_IN_PROGRESS: 7,
  PAYMENT_COMPLETE: 7,
  DEAL_CLOSED: 8,
};

export default function TransactionTimeline({ stage, stageLabel }: { stage: DealStage; stageLabel: string }) {
  const reachedIndex = STAGE_TO_NODE[stage] ?? 0;

  return (
    <div>
      <div className="flex items-start justify-between gap-1 overflow-x-auto pb-1">
        {NODES.map((label, i) => {
          const done = i <= reachedIndex;
          const current = i === reachedIndex;
          return (
            <div key={label} className="flex min-w-[72px] flex-1 flex-col items-center text-center">
              <div className="flex w-full items-center">
                <span className={`h-px flex-1 ${i === 0 ? "opacity-0" : done ? "bg-lime" : "bg-ink/10"}`} />
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold ring-1 ${
                    current
                      ? "bg-panel text-white ring-panel"
                      : done
                      ? "bg-lime text-ink ring-lime"
                      : "bg-white text-ink/30 ring-ink/10"
                  }`}
                >
                  {done && !current ? "✓" : i + 1}
                </span>
                <span className={`h-px flex-1 ${i === NODES.length - 1 ? "opacity-0" : done ? "bg-lime" : "bg-ink/10"}`} />
              </div>
              <p className={`mt-2 text-[11px] leading-tight ${done ? "font-medium text-ink" : "text-ink/40"}`}>{label}</p>
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-center text-xs text-body">
        Current stage: <span className="font-medium text-ink">{stageLabel}</span>
      </p>
    </div>
  );
}
