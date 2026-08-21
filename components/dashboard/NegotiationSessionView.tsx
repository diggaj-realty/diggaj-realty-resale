"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { price } from "@/lib/listings";
import StatusBadge from "@/components/dashboard/StatusBadge";
import { confirmNegotiation } from "@/lib/api/negotiationSessions";
import type { NegotiationEventType, NegotiationSession } from "@/types/transaction";

const EVENT_LABEL: Record<NegotiationEventType, string> = {
  BUYER_POSITION: "Buyer's position",
  SELLER_POSITION: "Seller's position",
  AGENT_NOTE: "Advisor note",
  BUYER_COUNTER: "Buyer countered",
  SELLER_COUNTER: "Seller countered",
  PRICE_PROPOSED: "Price proposed",
  BUYER_CONFIRMED: "Buyer confirmed",
  SELLER_CONFIRMED: "Seller confirmed",
  AGREEMENT_REACHED: "Agreement reached",
  NEGOTIATION_FAILED: "Negotiation failed",
  CONFIRMATIONS_RESET: "Amount changed, confirmations reset",
};

const fmtDateTime = (iso: string) =>
  new Date(iso).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const ENDED_STATUSES = ["AGREED", "FAILED", "CANCELLED"];

/** Advisor-assisted (phone/in-person/offline) negotiation. Read-only besides
 *  one action: confirming the currently-proposed amount as your own side —
 *  recording positions/counters and creating the session are advisor/staff-
 *  only, and converting an agreed session into a Deal is too. */
export default function NegotiationSessionView({
  session,
  viewerId,
  onChanged,
}: {
  session: NegotiationSession;
  /** The logged-in user's id — used to figure out which side (if either)
   *  they are on this specific session, rather than trusting role alone. */
  viewerId: string | undefined;
  onChanged?: () => void;
}) {
  const { token } = useAuth();
  const isBuyer = viewerId === session.buyerId;
  const isSeller = viewerId === session.sellerId;
  const myConfirmed = isBuyer ? session.buyerConfirmed : isSeller ? session.sellerConfirmed : true;
  const canConfirm =
    (isBuyer || isSeller) &&
    !ENDED_STATUSES.includes(session.status) &&
    session.proposedAmount != null &&
    !myConfirmed;

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function confirm() {
    if (!token || session.proposedAmount == null) return;
    setBusy(true);
    setError(null);
    try {
      await confirmNegotiation(token, session.id, session.proposedAmount);
      onChanged?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to confirm");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-ink/5">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm font-medium text-ink">
          Negotiation <span className="font-normal text-body">({session.channel.replace("_", " ").toLowerCase()})</span>
        </p>
        <StatusBadge status={session.status} />
      </div>

      {session.proposedAmount != null && (
        <p className="mt-3 text-sm text-body">
          On the table: <span className="font-semibold text-ink">{price(session.proposedAmount)}</span>
        </p>
      )}

      <div className="mt-3 flex flex-wrap gap-4 text-xs text-body">
        <span className={session.buyerConfirmed ? "text-ink" : "text-ink/40"}>
          {session.buyerConfirmed ? "✓" : "○"} Buyer confirmed
        </span>
        <span className={session.sellerConfirmed ? "text-ink" : "text-ink/40"}>
          {session.sellerConfirmed ? "✓" : "○"} Seller confirmed
        </span>
      </div>

      {canConfirm && (
        <div className="mt-4 border-t border-ink/5 pt-4">
          <button
            onClick={confirm}
            disabled={busy}
            className="rounded-full bg-lime px-5 py-2.5 text-xs font-semibold text-ink disabled:opacity-50"
          >
            {busy ? "Confirming…" : `Confirm ${price(session.proposedAmount!)}`}
          </button>
          {error && <p className="mt-2 text-xs text-red-700">{error}</p>}
        </div>
      )}

      {session.events && session.events.length > 0 && (
        <div className="mt-4 border-t border-ink/5 pt-4">
          <p className="mb-3 text-xs font-medium text-ink/50">History</p>
          <div className="flex flex-col gap-3">
            {session.events.map((e) => (
              <div key={e.id} className="flex items-start gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-ink/30" />
                <div className="min-w-0">
                  <p className="text-sm text-ink">
                    {EVENT_LABEL[e.eventType]}
                    {e.amount != null && <span className="text-body">: {price(e.amount)}</span>}
                  </p>
                  <p className="text-xs text-body">{fmtDateTime(e.createdAt)}</p>
                  {e.note && <p className="mt-0.5 text-xs text-ink/70">&ldquo;{e.note}&rdquo;</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
