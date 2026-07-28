import type { ClosureChecklist } from "@/lib/dashboard/deriveClosureChecklist";

function Row({ label, met, detail }: { label: string; met: boolean; detail?: string }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2">
      <div className="flex items-center gap-2.5">
        <span
          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] ${
            met ? "bg-lime text-ink" : "bg-ink/10 text-ink/40"
          }`}
        >
          {met ? "✓" : ""}
        </span>
        <span className={`text-sm ${met ? "text-ink" : "text-ink/50"}`}>{label}</span>
      </div>
      {detail && <span className="text-xs text-body">{detail}</span>}
    </div>
  );
}

/** Read-only progress toward closure — not a definitive "can close" verdict.
 *  The real gate is staff-configurable and staff-only to query; this shows
 *  where things stand on every dimension the backend is known to check. */
export default function ClosureChecklistView({ checklist, dealStatus }: { checklist: ClosureChecklist; dealStatus: string }) {
  if (dealStatus === "CLOSED") {
    return <p className="text-sm font-medium text-ink">✓ This deal is closed.</p>;
  }

  return (
    <div>
      <div className="divide-y divide-ink/5">
        <Row {...checklist.finalPayment} />
        <Row {...checklist.documents} />
        <Row {...checklist.identity} />
        <Row {...checklist.agreement} />
        <Row {...checklist.payments} />
      </div>
      <p className="mt-3 text-[11px] text-ink/40">
        Exact closure requirements are configured by your coordinator and may not all apply to
        every deal; this is a progress view, not a final decision.
      </p>
    </div>
  );
}
