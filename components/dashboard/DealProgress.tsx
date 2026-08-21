import { fmtDate, BlockedNotice } from "@/components/dashboard/shared";
import type { DealProgress as DealProgressData, ProgressSource } from "@/types/transaction";

const SOURCE_LABEL: Record<ProgressSource, string> = {
  DERIVED: "Confirmed by the platform",
  DECLARED: "Updated by your advisor",
};

/** DERIVED is a fact the platform observed from its own records; DECLARED is
 *  a staff member's claim, and can move backward. Rendered distinctly on
 *  purpose — a bar that shows both identically loses the reader's trust the
 *  first time a staff-declared stage walks back, which it genuinely does. */
function SourceTag({ source }: { source: ProgressSource }) {
  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ring-1 ${
        source === "DERIVED"
          ? "bg-limepale text-ink ring-lime/40"
          : "bg-amber-100 text-amber-900 ring-amber-200"
      }`}
    >
      {SOURCE_LABEL[source]}
    </span>
  );
}

/** The 12-stage deal ladder, shown to buyer and seller alike — replaces the
 *  old client-derived TransactionTimeline now that the backend returns
 *  pre-computed steps, so there's only one "what stage are we on" instead of
 *  two independent derivations drifting apart. */
export default function DealProgress({ progress }: { progress: DealProgressData }) {
  if (progress.status === "FELL_THROUGH") {
    return (
      <BlockedNotice
        title="This deal did not go through"
        meta={
          progress.failedAt
            ? `${progress.failureCode ?? "Fell through"} — as of ${fmtDate(progress.failedAt)}. The property has returned to market.`
            : "The property has returned to market."
        }
      />
    );
  }

  const reachedCount = progress.steps.filter((s) => s.reached).length;

  return (
    <div>
      <div className="flex items-center justify-between text-xs text-body">
        <span>
          Step {Math.max(reachedCount, 1)} of {progress.steps.length}
        </span>
        <span className="font-medium text-ink">{progress.stageLabel}</span>
      </div>

      <div className="mt-3 flex items-start justify-between gap-1 overflow-x-auto pb-1">
        {progress.steps.map((step, i) => (
          <div key={step.stage} className="flex min-w-[76px] flex-1 flex-col items-center text-center">
            <div className="flex w-full items-center">
              <span className={`h-[3px] flex-1 rounded-full ${i === 0 ? "opacity-0" : step.reached ? "bg-lime" : "bg-ink/10"}`} />
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold transition-shadow ${
                  step.current
                    ? "bg-panel text-white ring-4 ring-panel/15"
                    : step.reached
                    ? "bg-lime text-ink ring-1 ring-lime"
                    : "bg-white text-ink/30 ring-1 ring-ink/10"
                }`}
              >
                {step.reached && !step.current ? "✓" : i + 1}
              </span>
              <span
                className={`h-[3px] flex-1 rounded-full ${
                  i === progress.steps.length - 1 ? "opacity-0" : step.reached ? "bg-lime" : "bg-ink/10"
                }`}
              />
            </div>
            <p
              className={`mt-2 min-h-[2.4em] text-[11px] leading-tight ${
                step.current ? "font-semibold text-ink" : step.reached ? "font-medium text-ink" : "text-ink/40"
              }`}
            >
              {step.label}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
        <SourceTag source={progress.source} />
        {progress.documents.total > 0 && (
          <span className="text-xs text-body">
            Documents: {progress.documents.approved}/{progress.documents.total} approved
          </span>
        )}
      </div>
    </div>
  );
}
