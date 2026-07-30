"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { price } from "@/lib/listings";
import { fmtDate, BlockedNotice } from "@/components/dashboard/shared";
import { respondToOfflineNegotiation } from "@/lib/api/buyer";
import { ApiError } from "@/lib/api/client";
import type { OfflineNegotiationRecord } from "@/types/transaction";

/** What staff recorded from a call or viewing — the buyer and seller each
 *  confirm it themselves (staff cannot confirm on their behalf), and it
 *  isn't the deal's real price until both have. Additive, never overwrites
 *  the online Offer/OfferEvent history shown elsewhere on this page. */
export default function OfflineNegotiationList({
  dealId,
  records,
  buyerId,
  sellerId,
  viewerId,
  onChanged,
}: {
  dealId: string;
  records: OfflineNegotiationRecord[];
  buyerId: string;
  sellerId: string;
  viewerId: string | undefined;
  onChanged?: () => void;
}) {
  if (records.length === 0) {
    return <p className="text-sm text-body">No offline negotiation has been recorded for this deal.</p>;
  }

  // Historical records may still be present for context, but only the
  // current one is ever actionable — respond to an older figure and the
  // backend just returns 409 SUPERSEDED.
  const current = records.find((n) => n.isCurrent);
  const historical = records.filter((n) => n !== current);

  return (
    <div className="flex flex-col gap-3">
      {current && (
        <CurrentNegotiationCard
          dealId={dealId}
          record={current}
          buyerId={buyerId}
          sellerId={sellerId}
          viewerId={viewerId}
          onChanged={onChanged}
        />
      )}
      {historical.length > 0 && (
        <p className="text-[11px] text-ink/40">
          {historical.length} earlier recorded amount(s) superseded by the figure above.
        </p>
      )}
    </div>
  );
}

function CurrentNegotiationCard({
  dealId,
  record,
  buyerId,
  sellerId,
  viewerId,
  onChanged,
}: {
  dealId: string;
  record: OfflineNegotiationRecord;
  buyerId: string;
  sellerId: string;
  viewerId: string | undefined;
  onChanged?: () => void;
}) {
  const { token } = useAuth();
  const isBuyer = viewerId === buyerId;
  const isSeller = viewerId === sellerId;
  const myConfirmed = isBuyer ? record.buyerConfirmed : isSeller ? record.sellerConfirmed : true;
  const canRespond = (isBuyer || isSeller) && !record.isDisputeOpen && !myConfirmed;

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [disputing, setDisputing] = useState(false);
  const [note, setNote] = useState("");

  async function respond(action: { action: "confirm" } | { action: "dispute"; note: string }) {
    if (!token) return;
    setBusy(true);
    setError(null);
    try {
      await respondToOfflineNegotiation(token, dealId, record.id, action);
      setDisputing(false);
      onChanged?.();
    } catch (e) {
      if (e instanceof ApiError && e.status === 409) {
        // A newer figure was recorded, or the viewer already confirmed —
        // either way the local view is stale, so just refetch instead of
        // showing a generic error the buyer/seller can't act on.
        onChanged?.();
        setError("Someone recorded a newer figure — refreshing.");
      } else {
        setError(e instanceof Error ? e.message : "Failed to respond");
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-ink/5">
      <div className="flex items-start justify-between gap-4">
        <p className="text-lg font-semibold text-ink">{price(record.agreedAmount)}</p>
        <p className="text-xs text-ink/40">{fmtDate(record.createdAt)}</p>
      </div>
      {record.recordedByName && (
        <p className="mt-1 text-xs text-body">Recorded by {record.recordedByName}</p>
      )}

      {record.isDisputeOpen ? (
        <div className="mt-3">
          <BlockedNotice
            title="Resolution paused"
            note={record.disputedNote}
            meta={`Disputed by ${record.disputedBy === "BUYER" ? "the buyer" : "the seller"} — a Diggaj coordinator needs to review this before the deal can continue.`}
          />
        </div>
      ) : record.bothConfirmed ? (
        <p className="mt-3 rounded-2xl bg-limepale px-4 py-2.5 text-sm font-medium text-ink">
          Both parties have confirmed this amount.
        </p>
      ) : (
        <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-body">
          <span className={record.buyerConfirmed ? "text-ink" : "text-ink/40"}>
            {record.buyerConfirmed ? "✓" : "○"} Buyer confirmed
          </span>
          <span className={record.sellerConfirmed ? "text-ink" : "text-ink/40"}>
            {record.sellerConfirmed ? "✓" : "○"} Seller confirmed
          </span>
        </div>
      )}

      {canRespond && (
        <div className="mt-4 border-t border-ink/5 pt-4">
          {disputing ? (
            <div className="flex flex-col gap-2">
              <textarea
                rows={2}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="What was actually agreed?"
                className="resize-none rounded-xl border border-ink/10 bg-white px-3 py-2 text-sm outline-none focus:border-ink/30"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => respond({ action: "dispute", note })}
                  disabled={busy || !note.trim()}
                  className="rounded-full bg-red-700 px-4 py-2 text-xs font-semibold text-white disabled:opacity-50"
                >
                  {busy ? "Sending…" : "Submit dispute"}
                </button>
                <button
                  onClick={() => setDisputing(false)}
                  className="rounded-full px-4 py-2 text-xs font-medium text-body underline underline-offset-4"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => respond({ action: "confirm" })}
                disabled={busy}
                className="rounded-full bg-lime px-5 py-2.5 text-xs font-semibold text-ink disabled:opacity-50"
              >
                {busy ? "Confirming…" : `Confirm ${price(record.agreedAmount)}`}
              </button>
              <button
                onClick={() => setDisputing(true)}
                disabled={busy}
                className="rounded-full px-5 py-2.5 text-xs font-medium text-red-700 underline underline-offset-4 disabled:opacity-50"
              >
                That&apos;s not right
              </button>
            </div>
          )}
          {error && <p className="mt-2 text-xs text-red-700">{error}</p>}
        </div>
      )}
    </div>
  );
}
