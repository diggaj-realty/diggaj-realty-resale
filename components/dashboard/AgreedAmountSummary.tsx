import { price } from "@/lib/listings";
import { fmtDate } from "@/components/dashboard/shared";
import type { Deal, OfferWithEvents } from "@/types/buyer";
import type { OfflineNegotiationRecord } from "@/types/transaction";

/** Distinguishes every amount that can be on the table for a deal, since
 *  "the price" silently means four different things depending on when you
 *  ask: what the buyer first offered, what the seller/buyer actually
 *  accepted online, what was later re-negotiated in person, and — if those
 *  differ — the one that actually governs the transaction right now. */
export default function AgreedAmountSummary({
  acceptedOffer,
  deal,
  offlineNegotiations,
}: {
  acceptedOffer: OfferWithEvents | null;
  deal: Deal;
  offlineNegotiations: OfflineNegotiationRecord[];
}) {
  // isCurrent, not index 0, is the only reliable way to find the live
  // figure — a newer record superseding an older one doesn't guarantee
  // ordering in the array.
  const latestOffline = offlineNegotiations.find((n) => n.isCurrent) ?? null;
  const currentAmount = latestOffline?.agreedAmount ?? deal.agreedPrice;

  return (
    <div className="rounded-2xl bg-panel p-5 text-white">
      <p className="text-xs text-white/60">Current agreed amount</p>
      <p className="mt-1 text-3xl font-semibold tracking-[-0.02em]">{price(currentAmount)}</p>
      {latestOffline && (
        <p className="mt-1 text-xs text-white/60">
          {latestOffline.bothConfirmed
            ? `Confirmed by both parties on ${fmtDate(latestOffline.updatedAt)}`
            : "Recorded by your advisor — awaiting confirmation from both parties"}
        </p>
      )}

      <div className="mt-5 grid grid-cols-1 gap-2 border-t border-white/10 pt-4 sm:grid-cols-3">
        {acceptedOffer && (
          <div>
            <p className="text-[11px] text-white/50">Original offer</p>
            <p className="text-sm font-medium">{price(acceptedOffer.amount)}</p>
          </div>
        )}
        <div>
          <p className="text-[11px] text-white/50">Accepted amount</p>
          <p className="text-sm font-medium">{price(deal.agreedPrice)}</p>
        </div>
        {latestOffline && (
          <div>
            <p className="text-[11px] text-white/50">Latest offline negotiated amount</p>
            <p className="text-sm font-medium">{price(latestOffline.agreedAmount)}</p>
          </div>
        )}
      </div>
    </div>
  );
}
