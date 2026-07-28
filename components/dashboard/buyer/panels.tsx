"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { price } from "@/lib/listings";
import { propertyHref } from "@/lib/slug";
import { buildFilterQueryString } from "@/lib/filters";
import { useAuth } from "@/lib/auth/AuthContext";
import StatusBadge from "@/components/dashboard/StatusBadge";
import OfferCard from "@/components/dashboard/OfferCard";
import { Panel, Step, fmtDate } from "@/components/dashboard/shared";
import { useCachedPanelData } from "@/lib/dashboard/useCachedPanelData";
import {
  getShortlist,
  removeShortlist,
  getOffers,
  getSiteVisits,
  cancelSiteVisit,
  getSavedSearches,
  deleteSavedSearch,
  setSavedSearchAlerts,
  getDeals,
} from "@/lib/api/buyer";
import { getInterests } from "@/lib/api/interests";
import type {
  Deal,
  Offer,
  SavedSearch,
  SavedSearchFilters,
  SiteVisit,
  ShortlistedProperty,
} from "@/types/buyer";
import { TERMINAL_INTEREST_STATUSES } from "@/types/transaction";
import type { PropertyInterest } from "@/types/transaction";

// ── Saved properties ──────────────────────────────────────────
const MAX_COMPARE = 3;

export function SavedPanel() {
  const { token } = useAuth();
  const router = useRouter();
  const cacheKey = token ? `buyerSaved:${token}` : null;
  const { items, setItems, error, setError } = useCachedPanelData<ShortlistedProperty[]>(cacheKey, () =>
    getShortlist(token!).then((r) => r.items)
  );
  const [busy, setBusy] = useState<string | null>(null);
  const [compareIds, setCompareIds] = useState<string[]>([]);

  async function remove(id: string) {
    if (!token) return;
    setBusy(id);
    try {
      await removeShortlist(token, id);
      setItems((prev) => prev?.filter((p) => p.id !== id) ?? null);
      setCompareIds((prev) => prev.filter((x) => x !== id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to remove");
    } finally {
      setBusy(null);
    }
  }

  function toggleCompare(id: string) {
    setCompareIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : prev.length < MAX_COMPARE ? [...prev, id] : prev
    );
  }

  return (
    <div>
      <Panel
        loading={items === null && !error}
        error={error}
        empty={items?.length === 0}
        emptyText="No saved properties yet. Browse listings and tap the heart to save the ones you like."
      >
        {items?.map((p) => {
          const checked = compareIds.includes(p.id);
          return (
            <div key={p.id} className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-ink/5">
              <label className="flex shrink-0 cursor-pointer items-center" title="Select to compare">
                <input
                  type="checkbox"
                  checked={checked}
                  disabled={!checked && compareIds.length >= MAX_COMPARE}
                  onChange={() => toggleCompare(p.id)}
                  className="h-4 w-4 accent-lime"
                />
              </label>
              <Link href={propertyHref(p)} className="relative h-16 w-20 shrink-0 overflow-hidden rounded-xl bg-cream">
                {p.photos[0]?.url && <Image src={p.photos[0].url} alt={p.title} fill sizes="80px" className="object-cover" />}
              </Link>
              <Link href={propertyHref(p)} className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-ink">{p.title}</p>
                <p className="truncate text-xs text-body">{p.location}</p>
                <p className="mt-0.5 text-[11px] text-ink/40">Saved {fmtDate(p.shortlistedAt)}</p>
              </Link>
              <button
                onClick={() => remove(p.id)}
                disabled={busy === p.id}
                className="shrink-0 rounded-full bg-ink/5 px-3 py-1.5 text-xs font-medium text-ink/70 hover:bg-ink/10 disabled:opacity-50"
              >
                {busy === p.id ? "Removing…" : "Remove"}
              </button>
            </div>
          );
        })}
      </Panel>

      {compareIds.length >= 2 && (
        <div className="sticky bottom-4 mt-4 flex items-center justify-between gap-3 rounded-2xl bg-panel px-5 py-3.5 text-white shadow-2xl">
          <p className="text-sm">{compareIds.length} selected to compare</p>
          <button
            onClick={() => router.push(`/compare?ids=${compareIds.join(",")}`)}
            className="shrink-0 rounded-full bg-lime px-5 py-2 text-xs font-semibold text-ink"
          >
            Compare →
          </button>
        </div>
      )}
    </div>
  );
}

// ── Offers & negotiation ──────────────────────────────────────
export function OffersPanel() {
  const { token } = useAuth();
  const cacheKey = token ? `buyerOffers:${token}` : null;
  const { items, setItems, error } = useCachedPanelData<Offer[]>(cacheKey, () =>
    getOffers(token!, "buyer").then((r) => r.items)
  );

  return (
    <Panel
      loading={items === null && !error}
      error={error}
      empty={items?.length === 0}
      emptyText="No offers yet. Open a listing and submit an offer to start negotiating."
    >
      {items?.map((o) => (
        <OfferCard
          key={o.id}
          offer={o}
          viewerRole="BUYER"
          onChanged={(updated) => setItems((prev) => prev?.map((x) => (x.id === updated.id ? updated : x)) ?? null)}
        />
      ))}
    </Panel>
  );
}

// ── Site visits ───────────────────────────────────────────────
export function VisitsPanel() {
  const { token } = useAuth();
  const cacheKey = token ? `buyerVisits:${token}` : null;
  const { items, error, setError, load } = useCachedPanelData<SiteVisit[]>(cacheKey, () =>
    getSiteVisits(token!, "buyer").then((r) => r.items)
  );
  const [busy, setBusy] = useState<string | null>(null);

  async function cancel(id: string) {
    if (!token) return;
    setBusy(id);
    try {
      await cancelSiteVisit(token, id);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to cancel");
    } finally {
      setBusy(null);
    }
  }

  return (
    <Panel
      loading={items === null && !error}
      error={error}
      empty={items?.length === 0}
      emptyText="No site visits requested. Request a tour from any listing to schedule a visit."
    >
      {items?.map((v) => {
        const cancellable = v.status === "REQUESTED" || v.status === "SCHEDULED";
        return (
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
              <p>Requested for {fmtDate(v.requestedDate)}</p>
              {v.scheduledDate && <p>Scheduled for {fmtDate(v.scheduledDate)}</p>}
              {v.agentName && <p>Agent: {v.agentName}</p>}
              {v.buyerNote && <p className="text-ink/70">Your note: “{v.buyerNote}”</p>}
              {v.feedback && <p className="text-ink/70">Agent feedback: “{v.feedback}”</p>}
            </div>
            {cancellable && (
              <div className="mt-4 flex justify-end border-t border-ink/5 pt-4">
                <button
                  onClick={() => cancel(v.id)}
                  disabled={busy === v.id}
                  className="rounded-full bg-ink/5 px-4 py-2 text-xs font-medium text-ink/70 hover:bg-ink/10 disabled:opacity-50"
                >
                  {busy === v.id ? "Cancelling…" : "Cancel visit"}
                </button>
              </div>
            )}
          </div>
        );
      })}
    </Panel>
  );
}

// ── Saved searches ────────────────────────────────────────────
function filtersSummary(f: SavedSearchFilters): string {
  const parts: string[] = [];
  if (f.q) parts.push(`“${f.q}”`);
  if (f.type) parts.push(f.type.charAt(0) + f.type.slice(1).toLowerCase());
  if (f.city) parts.push(f.city);
  if (f.locality) parts.push(f.locality);
  if (f.minBhk) parts.push(`${f.minBhk}+ BHK`);
  if (f.minBathrooms) parts.push(`${f.minBathrooms}+ bath`);
  if (f.minPrice || f.maxPrice) {
    parts.push(
      f.minPrice && f.maxPrice
        ? `${price(f.minPrice)}–${price(f.maxPrice)}`
        : f.minPrice
        ? `from ${price(f.minPrice)}`
        : `up to ${price(f.maxPrice!)}`
    );
  }
  if (f.furnishing) parts.push(f.furnishing.replace(/_/g, " ").toLowerCase());
  if (f.possessionStatus) parts.push(f.possessionStatus === "READY_TO_MOVE" ? "Ready to move" : "Under construction");
  if (f.eliteOnly) parts.push("Elite only");
  if (f.amenities?.length) parts.push(`${f.amenities.length} amenities`);
  return parts.length ? parts.join(" · ") : "All properties";
}

export function SearchesPanel() {
  const { token } = useAuth();
  const cacheKey = token ? `buyerSearches:${token}` : null;
  const { items, setItems, error, setError } = useCachedPanelData<SavedSearch[]>(cacheKey, () =>
    getSavedSearches(token!)
  );
  const [busy, setBusy] = useState<string | null>(null);

  async function toggle(s: SavedSearch) {
    if (!token) return;
    setBusy(s.id);
    try {
      await setSavedSearchAlerts(token, s.id, !s.alertsEnabled);
      setItems((prev) => prev?.map((x) => (x.id === s.id ? { ...x, alertsEnabled: !x.alertsEnabled } : x)) ?? null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(null);
    }
  }
  async function remove(id: string) {
    if (!token) return;
    setBusy(id);
    try {
      await deleteSavedSearch(token, id);
      setItems((prev) => prev?.filter((x) => x.id !== id) ?? null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(null);
    }
  }

  return (
    <Panel
      loading={items === null && !error}
      error={error}
      empty={items?.length === 0}
      emptyText="No saved searches. Save a filter set from the listings page to get alerts on new matches."
    >
      {items?.map((s) => (
        <div key={s.id} className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-ink/5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-ink">{s.name ?? "Saved search"}</p>
              <p className="truncate text-xs text-body">{filtersSummary(s.filters)}</p>
            </div>
            <label className="flex shrink-0 items-center gap-2 text-xs text-body">
              <input
                type="checkbox"
                checked={s.alertsEnabled}
                onChange={() => toggle(s)}
                disabled={busy === s.id}
                className="h-4 w-4 accent-lime"
              />
              Alerts
            </label>
          </div>
          <div className="mt-4 flex items-center gap-3 border-t border-ink/5 pt-4">
            <Link
              href={`/listings${buildFilterQueryString(s.filters) ? `?${buildFilterQueryString(s.filters)}` : ""}`}
              className="rounded-full bg-panel px-4 py-2 text-xs font-medium text-white"
            >
              Apply search →
            </Link>
            <button
              onClick={() => remove(s.id)}
              disabled={busy === s.id}
              className="ml-auto rounded-full bg-ink/5 px-4 py-2 text-xs font-medium text-ink/70 hover:bg-ink/10 disabled:opacity-50"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </Panel>
  );
}

// ── Closing / documentation (deals) ───────────────────────────
function BuyerDealCard({ deal }: { deal: Deal }) {
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
          <p className="text-[11px] text-body">Token paid</p>
          <p className="text-sm font-semibold text-ink">{deal.tokenAmount != null ? price(deal.tokenAmount) : "-"}</p>
        </div>
        <div className="rounded-xl bg-cream px-3 py-2.5">
          <p className="text-[11px] text-body">Final payment</p>
          <p className="text-sm font-semibold text-ink">{deal.finalAmount != null ? price(deal.finalAmount) : "-"}</p>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        <Step done label="Offer accepted, deal opened" detail={fmtDate(deal.createdAt)} />
        <Step
          done={deal.tokenAmount != null}
          label="Token payment recorded"
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
        <Link
          href={`/dashboard/buyer/deals/${deal.id}`}
          className="text-xs font-medium text-ink underline underline-offset-2"
        >
          View full transaction →
        </Link>
      </div>
    </div>
  );
}

export function ClosingPanel() {
  const { token } = useAuth();
  const cacheKey = token ? `buyerDeals:${token}` : null;
  const { items, error } = useCachedPanelData<Deal[]>(cacheKey, () => getDeals(token!).then((r) => r.items));

  return (
    <Panel
      loading={items === null && !error}
      error={error}
      empty={items?.length === 0}
      emptyText="No active deals. Once an offer is accepted, your closing paperwork and payment progress appear here."
    >
      {items?.map((d) => (
        <BuyerDealCard key={d.id} deal={d} />
      ))}
    </Panel>
  );
}

// ── Interests (pre-offer leads) ────────────────────────────────
function InterestCard({ interest }: { interest: PropertyInterest }) {
  const active = !TERMINAL_INTEREST_STATUSES.includes(interest.status);
  return (
    <Link
      href={`/dashboard/buyer/interests/${interest.id}`}
      className="block rounded-2xl bg-white p-4 shadow-sm ring-1 ring-ink/5 hover:ring-ink/10"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-ink">{interest.propertyTitle ?? "Property"}</p>
          <p className="truncate text-xs text-body">{interest.propertyLocation}</p>
        </div>
        <StatusBadge status={interest.status} />
      </div>
      <div className="mt-3 flex items-center justify-between gap-3 text-xs text-body">
        <span>{active ? (interest.agentName ? `Agent: ${interest.agentName}` : "Awaiting agent assignment") : "Closed out"}</span>
        <span className="text-ink/40">{fmtDate(interest.createdAt)}</span>
      </div>
    </Link>
  );
}

export function InterestsPanel() {
  const { token } = useAuth();
  const cacheKey = token ? `buyerInterests:${token}` : null;
  const { items, error } = useCachedPanelData<PropertyInterest[]>(cacheKey, () =>
    getInterests(token!).then((r) => r.items)
  );

  return (
    <Panel
      loading={items === null && !error}
      error={error}
      empty={items?.length === 0}
      emptyText="No interests yet. Tap “Interested in this property” on any listing to get connected with an agent."
    >
      {items?.map((i) => (
        <InterestCard key={i.id} interest={i} />
      ))}
    </Panel>
  );
}
