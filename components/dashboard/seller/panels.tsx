"use client";

import Link from "next/link";
import { useState } from "react";
import { price } from "@/lib/listings";
import { useAuth } from "@/lib/auth/AuthContext";
import StatusBadge from "@/components/dashboard/StatusBadge";
import PropertyRow from "@/components/dashboard/PropertyRow";
import DealDocuments from "@/components/dashboard/DealDocuments";
import OfferCard from "@/components/dashboard/OfferCard";
import { Panel, Step, fmtDate } from "@/components/dashboard/shared";
import { useCachedPanelData } from "@/lib/dashboard/useCachedPanelData";
import { getOffers, getDeals, getSiteVisits } from "@/lib/api/buyer";
import { getMyListings, requestPlanUpgrade } from "@/lib/api/seller";
import type { Deal, Offer, SiteVisit } from "@/types/buyer";
import type { Property } from "@/types/api";
import { ApiError } from "@/lib/api/client";

// ── My listings ────────────────────────────────────────────────
function ListingActions({ property, onUpdated }: { property: Property; onUpdated: (p: Property) => void }) {
  const { token } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (property.plan === "ELITE") return null;

  if (property.requestedPlan === "ELITE") {
    return <span className="rounded-full bg-amber-100 px-3 py-1.5 text-xs font-medium text-amber-900">Elite upgrade pending approval</span>;
  }

  async function request() {
    if (!token) return;
    setBusy(true);
    setError(null);
    try {
      const updated = await requestPlanUpgrade(token, property.id, "ELITE");
      onUpdated(updated);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to request upgrade");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={request}
        disabled={busy}
        className="rounded-full bg-panel px-4 py-2 text-xs font-medium text-white disabled:opacity-50"
      >
        {busy ? "Requesting…" : "Request Elite →"}
      </button>
      {error && <span className="text-xs text-red-700">{error}</span>}
    </div>
  );
}

export function ListingsPanel() {
  const { token } = useAuth();
  const cacheKey = token ? `sellerListings:${token}` : null;
  const { items, setItems, error } = useCachedPanelData<Property[]>(cacheKey, () =>
    getMyListings(token!).then((r) => r.items)
  );

  return (
    <Panel
      loading={items === null && !error}
      error={error}
      empty={items?.length === 0}
      emptyText="No listings yet."
    >
      {items?.map((p) => (
        <PropertyRow
          key={p.id}
          property={p}
          actions={
            <ListingActions
              property={p}
              onUpdated={(updated) =>
                setItems((prev) => prev?.map((x) => (x.id === updated.id ? updated : x)) ?? null)
              }
            />
          }
        />
      ))}
    </Panel>
  );
}

// ── Offers & negotiation ──────────────────────────────────────
export function OffersPanel() {
  const { token } = useAuth();
  const cacheKey = token ? `sellerOffers:${token}` : null;
  const { items, setItems, error } = useCachedPanelData<Offer[]>(cacheKey, () =>
    getOffers(token!, "seller").then((r) => r.items)
  );

  return (
    <Panel
      loading={items === null && !error}
      error={error}
      empty={items?.length === 0}
      emptyText="No offers yet. Offers on your properties will appear here once our team forwards them."
    >
      {items?.map((o) => (
        <OfferCard
          key={o.id}
          offer={o}
          viewerRole="SELLER"
          onChanged={(updated) => setItems((prev) => prev?.map((x) => (x.id === updated.id ? updated : x)) ?? null)}
        />
      ))}
    </Panel>
  );
}

// ── Site visits (read-only for sellers) ───────────────────────
export function VisitsPanel() {
  const { token } = useAuth();
  const cacheKey = token ? `sellerVisits:${token}` : null;
  const { items, error } = useCachedPanelData<SiteVisit[]>(cacheKey, () =>
    getSiteVisits(token!, "seller").then((r) => r.items)
  );

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
function SellerDealCard({ deal }: { deal: Deal }) {
  const [showDocs, setShowDocs] = useState(false);
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-ink/5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-ink">{deal.propertyTitle ?? "Property"}</p>
          <p className="truncate text-xs text-body">{deal.propertyLocation}</p>
        </div>
        <StatusBadge status={deal.status} />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
        <div className="rounded-xl bg-cream px-3 py-2.5">
          <p className="text-[11px] text-body">Agreed price</p>
          <p className="text-sm font-semibold text-ink">{price(deal.agreedPrice)}</p>
        </div>
        <div className="rounded-xl bg-cream px-3 py-2.5">
          <p className="text-[11px] text-body">Token received</p>
          <p className="text-sm font-semibold text-ink">{deal.tokenAmount != null ? price(deal.tokenAmount) : "—"}</p>
        </div>
        <div className="rounded-xl bg-cream px-3 py-2.5">
          <p className="text-[11px] text-body">Final payment</p>
          <p className="text-sm font-semibold text-ink">{deal.finalAmount != null ? price(deal.finalAmount) : "—"}</p>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        <Step done label="Offer accepted — deal opened" detail={fmtDate(deal.createdAt)} />
        <Step
          done={deal.tokenAmount != null}
          label="Token payment received"
          detail={deal.tokenDate ? fmtDate(deal.tokenDate) : deal.tokenAmount != null ? undefined : "Pending"}
        />
        <Step
          done={deal.finalAmount != null}
          label="Final payment & documentation"
          detail={deal.finalPaymentDate ? fmtDate(deal.finalPaymentDate) : deal.finalAmount != null ? undefined : "Pending"}
        />
        <Step done={deal.status === "CLOSED"} label="Deal closed" />
      </div>

      {deal.notes && (
        <p className="mt-4 rounded-xl bg-ink/5 px-3 py-2.5 text-xs text-ink/70">
          <span className="font-medium">Notes: </span>
          {deal.notes}
        </p>
      )}

      <div className="mt-4 border-t border-ink/5 pt-4">
        <button
          onClick={() => setShowDocs((s) => !s)}
          className="text-xs font-medium text-ink underline underline-offset-2"
        >
          {showDocs ? "Hide document checklist" : "View document checklist →"}
        </button>
        {showDocs && (
          <div className="mt-4">
            <DealDocuments dealId={deal.id} viewerRole="SELLER" />
          </div>
        )}
      </div>

      <div className="mt-4 border-t border-ink/5 pt-4 text-xs text-body">
        Questions about the paperwork?{" "}
        <Link href="/contact" className="font-medium text-ink underline underline-offset-2">
          Contact your Diggaj coordinator →
        </Link>
      </div>
    </div>
  );
}

export function DealsPanel() {
  const { token } = useAuth();
  const cacheKey = token ? `sellerDeals:${token}` : null;
  const { items, error } = useCachedPanelData<Deal[]>(cacheKey, () => getDeals(token!).then((r) => r.items));

  return (
    <Panel
      loading={items === null && !error}
      error={error}
      empty={items?.length === 0}
      emptyText="No active deals. Once you accept an offer, closing progress and payment milestones appear here."
    >
      {items?.map((d) => (
        <SellerDealCard key={d.id} deal={d} />
      ))}
    </Panel>
  );
}
