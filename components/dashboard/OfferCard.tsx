"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { price } from "@/lib/listings";
import StatusBadge from "@/components/dashboard/StatusBadge";
import OfferTimeline from "@/components/dashboard/OfferTimeline";
import { fmtDate } from "@/components/dashboard/shared";
import { invalidate } from "@/lib/dashboard/panelCache";
import { acceptOffer, rejectOffer, counterOffer, closeNegotiation } from "@/lib/api/buyer";
import type { Offer } from "@/types/buyer";
import type { UserRole } from "@/types/auth";

const COUNTER_BY_LABEL: Record<NonNullable<Offer["counterBy"]>, string> = {
  BUYER: "buyer",
  SELLER: "seller",
  BACKEND: "Diggaj team",
};

/** One offer's negotiation card — identical turn-based logic for both the
 *  buyer and seller dashboard, since accept/reject/counter/close are gated
 *  by the offer's own `turn` field, not by which side is viewing. */
export default function OfferCard({
  offer,
  viewerRole,
  onChanged,
}: {
  offer: Offer;
  viewerRole: UserRole;
  onChanged: (updated: Offer) => void;
}) {
  const { token } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countering, setCountering] = useState(false);
  const [counterAmount, setCounterAmount] = useState("");
  const [showHistory, setShowHistory] = useState(false);

  const myTurn = offer.turn === viewerRole;
  const active = offer.status === "PENDING" || offer.status === "COUNTERED";
  const displayStatus = viewerRole === "BUYER" ? offer.displayStatus : offer.status;
  const counterpartLabel = viewerRole === "BUYER" ? "seller" : "buyer";
  const amountLabel = viewerRole === "BUYER" ? "Your offer" : "Buyer offered";

  async function run(action: () => Promise<Offer>, afterSuccess?: () => void) {
    if (!token) return;
    setBusy(true);
    setError(null);
    try {
      const updated = await action();
      onChanged(updated);
      afterSuccess?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Action failed");
    } finally {
      setBusy(false);
    }
  }

  // Acceptance auto-creates a Deal on the backend — drop any cached deals
  // list so the Closing/Deals panel refetches instead of showing stale data
  // the next time it's opened, rather than relying only on its own remount.
  function acceptAndRefreshDeals() {
    if (!token) return;
    run(() => acceptOffer(token, offer.id), () => {
      invalidate("buyerDeals:");
      invalidate("sellerDeals:");
    });
  }

  async function submitCounter() {
    const amount = Number(counterAmount);
    if (!token || !Number.isFinite(amount) || amount <= 0) return;
    await run(() => counterOffer(token, offer.id, amount));
    setCountering(false);
  }

  function handleClose() {
    if (!token) return;
    if (!window.confirm("End this negotiation without a deal? This can't be undone.")) return;
    run(() => closeNegotiation(token, offer.id));
  }

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-ink/5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <Link
            href={`/listings/x--${offer.propertyId}`}
            className="block truncate text-sm font-medium text-ink hover:underline"
          >
            {offer.propertyTitle ?? "Property"}
          </Link>
          <p className="truncate text-xs text-body">{offer.propertyLocation}</p>
        </div>
        <StatusBadge status={displayStatus} />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-1 text-sm">
        <span className="text-body">
          {amountLabel}: <span className="font-semibold text-ink">{price(offer.amount)}</span>
        </span>
        {offer.counterAmount != null && (
          <span className="text-body">
            Latest: <span className="font-semibold text-ink">{price(offer.currentAmount)}</span>
          </span>
        )}
      </div>
      {offer.message && <p className="mt-2 text-xs text-body">“{offer.message}”</p>}

      {active && !myTurn && (
        <p className="mt-4 border-t border-ink/5 pt-4 text-xs text-body">
          Waiting for the {counterpartLabel} to respond
          {offer.counterAmount != null ? `: currently at ${price(offer.currentAmount)}.` : "."}
        </p>
      )}

      {active && myTurn && (
        <div className="mt-4 border-t border-ink/5 pt-4">
          {offer.counterBy && (
            <p className="mb-3 text-xs text-body">
              The {COUNTER_BY_LABEL[offer.counterBy]} countered at {price(offer.currentAmount)}.
            </p>
          )}
          {countering ? (
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <input
                type="number"
                min={1}
                placeholder="Counter amount (₹)"
                value={counterAmount}
                onChange={(e) => setCounterAmount(e.target.value)}
                className="rounded-xl border border-ink/10 bg-white px-4 py-2 text-sm outline-none focus:border-ink/30"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => setCountering(false)}
                  className="rounded-full bg-ink/5 px-4 py-2 text-xs font-medium text-ink/70 hover:bg-ink/10"
                >
                  Cancel
                </button>
                <button
                  onClick={submitCounter}
                  disabled={busy}
                  className="rounded-full bg-panel px-4 py-2 text-xs font-medium text-white disabled:opacity-50"
                >
                  {busy ? "Sending…" : "Send counter"}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => token && run(() => rejectOffer(token, offer.id))}
                disabled={busy}
                className="rounded-full bg-ink/5 px-4 py-2 text-xs font-medium text-ink/70 hover:bg-ink/10 disabled:opacity-50"
              >
                Decline
              </button>
              <button
                onClick={() => setCountering(true)}
                disabled={busy}
                className="rounded-full bg-ink/5 px-4 py-2 text-xs font-medium text-ink/70 hover:bg-ink/10 disabled:opacity-50"
              >
                Counter
              </button>
              <button
                onClick={acceptAndRefreshDeals}
                disabled={busy}
                className="rounded-full bg-panel px-4 py-2 text-xs font-medium text-white disabled:opacity-50"
              >
                {busy ? "Working…" : `Accept ${price(offer.currentAmount)}`}
              </button>
            </div>
          )}
        </div>
      )}

      {error && <p className="mt-3 text-xs text-red-700">{error}</p>}

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-ink/5 pt-3">
        <button
          onClick={() => setShowHistory((s) => !s)}
          className="text-xs font-medium text-ink underline underline-offset-2"
        >
          {showHistory ? "Hide history" : "View history →"}
        </button>
        <div className="flex items-center gap-3">
          <p className="text-[11px] text-ink/40">Submitted {fmtDate(offer.createdAt)}</p>
          {active && (
            <button
              onClick={handleClose}
              disabled={busy}
              className="text-xs font-medium text-red-700 underline underline-offset-2 disabled:opacity-50"
            >
              End negotiation
            </button>
          )}
        </div>
      </div>

      {showHistory && (
        <div className="mt-3">
          <OfferTimeline offerId={offer.id} />
        </div>
      )}
    </div>
  );
}
