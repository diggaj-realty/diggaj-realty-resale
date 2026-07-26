import { price } from "@/lib/listings";
import StatusBadge from "@/components/dashboard/StatusBadge";
import { fmtDate } from "@/components/dashboard/shared";
import type { SiteVisit } from "@/types/buyer";

const OUTCOME_LABEL = { INTERESTED: "Interested", NOT_INTERESTED: "Not interested" } as const;

export default function SiteVisitSummary({ siteVisit }: { siteVisit: SiteVisit | null }) {
  if (!siteVisit) {
    return <p className="text-sm text-body">No site visit was part of this deal.</p>;
  }

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-ink/5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-ink">Site visit</p>
        <StatusBadge status={siteVisit.status} />
      </div>
      <div className="mt-3 space-y-1 text-xs text-body">
        <p>Requested for {fmtDate(siteVisit.requestedDate)}</p>
        {siteVisit.scheduledDate && <p>Scheduled for {fmtDate(siteVisit.scheduledDate)}</p>}
        {siteVisit.agentName && <p>Agent: {siteVisit.agentName}</p>}
        {siteVisit.buyerNote && <p className="text-ink/70">Buyer&apos;s note: &ldquo;{siteVisit.buyerNote}&rdquo;</p>}
        {siteVisit.feedback && <p className="text-ink/70">Agent feedback: &ldquo;{siteVisit.feedback}&rdquo;</p>}
      </div>

      <div className="mt-3 border-t border-ink/5 pt-3 text-xs">
        {siteVisit.outcome ? (
          <p>
            Outcome: <span className="font-medium text-ink">{OUTCOME_LABEL[siteVisit.outcome]}</span>
            {siteVisit.outcome === "INTERESTED" && siteVisit.interestedAmount != null && (
              <span className="text-body"> — interested at {price(siteVisit.interestedAmount)}</span>
            )}
          </p>
        ) : (
          <p className="text-body">Outcome not yet recorded.</p>
        )}
      </div>
    </div>
  );
}
