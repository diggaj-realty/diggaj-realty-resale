import { price } from "@/lib/listings";
import { fmtDate } from "@/components/dashboard/shared";
import type { OfflineNegotiation } from "@/types/buyer";

/** Negotiation that happened off-platform (in person, by phone, through the
 *  agent), logged after the fact — additive, never overwrites the online
 *  Offer/OfferEvent history shown elsewhere on this page. */
export default function OfflineNegotiationList({ records }: { records: OfflineNegotiation[] }) {
  if (records.length === 0) {
    return <p className="text-sm text-body">No offline negotiation has been recorded for this deal.</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {records.map((n) => (
        <div key={n.id} className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-ink/5">
          <div className="flex items-start justify-between gap-4">
            <p className="text-sm font-semibold text-ink">{price(n.agreedAmount)}</p>
            <p className="text-xs text-ink/40">{fmtDate(n.createdAt)}</p>
          </div>
          {n.notes && <p className="mt-1 text-xs text-body">&ldquo;{n.notes}&rdquo;</p>}
          <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-body">
            {n.recordedByName && <span>Recorded by {n.recordedByName}</span>}
            <span className={n.buyerConfirmed ? "text-ink" : "text-ink/40"}>
              {n.buyerConfirmed ? "✓" : "○"} Buyer confirmed
            </span>
            <span className={n.sellerConfirmed ? "text-ink" : "text-ink/40"}>
              {n.sellerConfirmed ? "✓" : "○"} Seller confirmed
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
