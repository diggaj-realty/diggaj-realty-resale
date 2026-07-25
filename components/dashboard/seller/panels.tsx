"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { price } from "@/lib/listings";
import { useAuth } from "@/lib/auth/AuthContext";
import StatusBadge from "@/components/dashboard/StatusBadge";
import PropertyRow from "@/components/dashboard/PropertyRow";
import { Panel, Step, fmtDate } from "@/components/dashboard/shared";
import { getOffers, getDeals, getSiteVisits } from "@/lib/api/buyer";
import { acceptOffer, rejectOffer, counterOffer, getMyListings } from "@/lib/api/seller";
import type { Deal, Offer, SiteVisit } from "@/types/buyer";
import type { Property } from "@/types/api";

// ── My listings ────────────────────────────────────────────────
export function ListingsPanel() {
  const { token } = useAuth();
  const [items, setItems] = useState<Property[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    getMyListings(token)
      .then((r) => setItems(r.items))
      .catch((e) => setError(e.message));
  }, [token]);

  return (
    <Panel
      loading={items === null && !error}
      error={error}
      empty={items?.length === 0}
      emptyText="No listings yet."
    >
      {items?.map((p) => (
        <PropertyRow key={p.id} property={p} statusLabel={p.status} />
      ))}
    </Panel>
  );
}

// ── Offers & negotiation ──────────────────────────────────────
// Note: the public API never writes/exposes the OfferEvent audit trail (only
// the internal admin dashboard's server actions do), so this shows the offer's
// current state — not a full multi-step timeline.
export function OffersPanel() {
  const { token } = useAuth();
  const [items, setItems] = useState<Offer[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [counterDraft, setCounterDraft] = useState<Record<string, string>>({});
  const [counteringId, setCounteringId] = useState<string | null>(null);

  function load() {
    if (!token) return;
    getOffers(token)
      .then((r) => setItems(r.items))
      .catch((e) => setError(e.message));
  }
  useEffect(load, [token]);

  async function respond(offerId: string, action: "accept" | "reject") {
    if (!token) return;
    setBusy(offerId);
    try {
      await (action === "accept" ? acceptOffer : rejectOffer)(token, offerId);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Action failed");
    } finally {
      setBusy(null);
    }
  }

  async function submitCounter(offerId: string) {
    if (!token) return;
    const amount = Number(counterDraft[offerId]);
    if (!Number.isFinite(amount) || amount <= 0) return;
    setBusy(offerId);
    try {
      await counterOffer(token, offerId, amount);
      setCounteringId(null);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to counter");
    } finally {
      setBusy(null);
    }
  }

  return (
    <Panel
      loading={items === null && !error}
      error={error}
      empty={items?.length === 0}
      emptyText="No offers yet. Offers on your properties will appear here once our team forwards them."
    >
      {items?.map((o) => {
        const actionable = o.status === "PENDING";
        const waitingOnBuyer = o.status === "COUNTERED" && o.counterBy === "SELLER";
        return (
          <div key={o.id} className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-ink/5">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <Link href={`/listings/x--${o.propertyId}`} className="block truncate text-sm font-medium text-ink hover:underline">
                  {o.propertyTitle ?? "Property"}
                </Link>
                <p className="truncate text-xs text-body">{o.propertyLocation}</p>
              </div>
              <StatusBadge status={o.status} />
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-1 text-sm">
              <span className="text-body">
                Buyer offered: <span className="font-semibold text-ink">{price(o.amount)}</span>
              </span>
              {o.counterAmount != null && (
                <span className="text-body">
                  Counter: <span className="font-semibold text-ink">{price(o.counterAmount)}</span>
                </span>
              )}
            </div>
            {o.message && <p className="mt-2 text-xs text-body">“{o.message}”</p>}

            {waitingOnBuyer && (
              <p className="mt-4 border-t border-ink/5 pt-4 text-xs text-body">
                You countered at {price(o.counterAmount!)} — waiting for the buyer to respond.
              </p>
            )}

            {actionable && (
              <div className="mt-4 border-t border-ink/5 pt-4">
                {counteringId === o.id ? (
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <input
                      type="number"
                      min={1}
                      placeholder="Counter amount (₹)"
                      value={counterDraft[o.id] ?? ""}
                      onChange={(e) => setCounterDraft((d) => ({ ...d, [o.id]: e.target.value }))}
                      className="rounded-xl border border-ink/10 bg-white px-4 py-2 text-sm outline-none focus:border-ink/30"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => setCounteringId(null)}
                        className="rounded-full bg-ink/5 px-4 py-2 text-xs font-medium text-ink/70 hover:bg-ink/10"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => submitCounter(o.id)}
                        disabled={busy === o.id}
                        className="rounded-full bg-panel px-4 py-2 text-xs font-medium text-white disabled:opacity-50"
                      >
                        {busy === o.id ? "Sending…" : "Send counter"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => respond(o.id, "reject")}
                      disabled={busy === o.id}
                      className="rounded-full bg-ink/5 px-4 py-2 text-xs font-medium text-ink/70 hover:bg-ink/10 disabled:opacity-50"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => setCounteringId(o.id)}
                      disabled={busy === o.id}
                      className="rounded-full bg-ink/5 px-4 py-2 text-xs font-medium text-ink/70 hover:bg-ink/10 disabled:opacity-50"
                    >
                      Counter
                    </button>
                    <button
                      onClick={() => respond(o.id, "accept")}
                      disabled={busy === o.id}
                      className="rounded-full bg-panel px-4 py-2 text-xs font-medium text-white disabled:opacity-50"
                    >
                      {busy === o.id ? "Working…" : "Accept"}
                    </button>
                  </div>
                )}
              </div>
            )}
            <p className="mt-3 text-[11px] text-ink/40">Received {fmtDate(o.createdAt)}</p>
          </div>
        );
      })}
    </Panel>
  );
}

// ── Site visits (read-only for sellers) ───────────────────────
export function VisitsPanel() {
  const { token } = useAuth();
  const [items, setItems] = useState<SiteVisit[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    getSiteVisits(token)
      .then((r) => setItems(r.items))
      .catch((e) => setError(e.message));
  }, [token]);

  return (
    <Panel
      loading={items === null && !error}
      error={error}
      empty={items?.length === 0}
      emptyText="No site visits scheduled yet. They'll appear here once a buyer requests one."
    >
      {items?.map((v) => (
        <div key={v.id} className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-ink/5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <Link href={`/listings/x--${v.propertyId}`} className="block truncate text-sm font-medium text-ink hover:underline">
                {v.propertyTitle ?? "Property"}
              </Link>
              <p className="truncate text-xs text-body">{v.propertyLocation}</p>
            </div>
            <StatusBadge status={v.status} />
          </div>
          <div className="mt-3 space-y-1 text-xs text-body">
            {v.buyerName && <p>Buyer: {v.buyerName}</p>}
            <p>Requested for {fmtDate(v.requestedDate)}</p>
            {v.scheduledDate && <p>Scheduled for {fmtDate(v.scheduledDate)}</p>}
            {v.agentName && <p>Agent: {v.agentName}</p>}
            {v.feedback && <p className="text-ink/70">Agent feedback: “{v.feedback}”</p>}
          </div>
        </div>
      ))}
    </Panel>
  );
}

// ── Deals (closing / documentation) ───────────────────────────
export function DealsPanel() {
  const { token } = useAuth();
  const [items, setItems] = useState<Deal[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    getDeals(token)
      .then((r) => setItems(r.items))
      .catch((e) => setError(e.message));
  }, [token]);

  return (
    <Panel
      loading={items === null && !error}
      error={error}
      empty={items?.length === 0}
      emptyText="No active deals. Once you accept an offer, closing progress and payment milestones appear here."
    >
      {items?.map((d) => (
        <div key={d.id} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-ink/5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-ink">{d.propertyTitle ?? "Property"}</p>
              <p className="truncate text-xs text-body">{d.propertyLocation}</p>
            </div>
            <StatusBadge status={d.status} />
          </div>

          <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
            <div className="rounded-xl bg-cream px-3 py-2.5">
              <p className="text-[11px] text-body">Agreed price</p>
              <p className="text-sm font-semibold text-ink">{price(d.agreedPrice)}</p>
            </div>
            <div className="rounded-xl bg-cream px-3 py-2.5">
              <p className="text-[11px] text-body">Token received</p>
              <p className="text-sm font-semibold text-ink">{d.tokenAmount != null ? price(d.tokenAmount) : "—"}</p>
            </div>
            <div className="rounded-xl bg-cream px-3 py-2.5">
              <p className="text-[11px] text-body">Final payment</p>
              <p className="text-sm font-semibold text-ink">{d.finalAmount != null ? price(d.finalAmount) : "—"}</p>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            <Step done label="Offer accepted — deal opened" detail={fmtDate(d.createdAt)} />
            <Step
              done={d.tokenAmount != null}
              label="Token payment received"
              detail={d.tokenDate ? fmtDate(d.tokenDate) : d.tokenAmount != null ? undefined : "Pending"}
            />
            <Step
              done={d.finalAmount != null}
              label="Final payment & documentation"
              detail={d.finalPaymentDate ? fmtDate(d.finalPaymentDate) : d.finalAmount != null ? undefined : "Pending"}
            />
            <Step done={d.status === "CLOSED"} label="Deal closed" />
          </div>

          {d.notes && (
            <p className="mt-4 rounded-xl bg-ink/5 px-3 py-2.5 text-xs text-ink/70">
              <span className="font-medium">Notes: </span>
              {d.notes}
            </p>
          )}

          <div className="mt-4 border-t border-ink/5 pt-4 text-xs text-body">
            Questions about the paperwork?{" "}
            <Link href="/contact" className="font-medium text-ink underline underline-offset-2">
              Contact your Diggaj coordinator →
            </Link>
          </div>
        </div>
      ))}
    </Panel>
  );
}
