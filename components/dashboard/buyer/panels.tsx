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
  proposeSiteVisit,
  acceptSiteVisit,
  declineSiteVisit,
  disputeScheduledSiteVisit,
  getSavedSearches,
  deleteSavedSearch,
  setSavedSearchAlerts,
  getDeals,
} from "@/lib/api/buyer";
import { ApiError } from "@/lib/api/client";
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
// Mutual date agreement lives between buyer and agent only (sellers just
// watch, read-only). When the agent proposes/re-proposes a time, this card
// shows accept/decline; a buyer can also always propose their own time.
function SiteVisitCard({ visit, onChanged }: { visit: SiteVisit; onChanged: (updated: SiteVisit) => void }) {
  const { token } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [proposing, setProposing] = useState(false);
  const [proposedDate, setProposedDate] = useState("");
  const [disputing, setDisputing] = useState(false);
  const [disputeReason, setDisputeReason] = useState("");

  const active = visit.status === "REQUESTED" || visit.status === "SCHEDULED";
  const awaitingBuyer = visit.awaitingResponseFrom === "BUYER";
  // Staff booked this directly from a call — the buyer never confirmed it
  // in-app, so it gets a "dispute" action instead of "reschedule".
  const bookedOffline = visit.status === "SCHEDULED" && visit.scheduledVia === "AGREED_OFFLINE";

  async function run(action: () => Promise<SiteVisit>) {
    if (!token) return;
    setBusy(true);
    setError(null);
    try {
      const updated = await action();
      onChanged(updated);
      setProposing(false);
      setProposedDate("");
      setDisputing(false);
      setDisputeReason("");
    } catch (e) {
      if (e instanceof ApiError && e.status === 409) {
        setError("This booking has already changed — refresh to see the latest.");
      } else {
        setError(e instanceof Error ? e.message : "Action failed");
      }
    } finally {
      setBusy(false);
    }
  }

  function submitPropose() {
    if (!token || !proposedDate) return;
    run(() => proposeSiteVisit(token, visit.id, new Date(proposedDate).toISOString()));
  }

  function cancel() {
    if (!token) return;
    run(() => cancelSiteVisit(token, visit.id));
  }

  function submitDispute() {
    if (!token) return;
    run(() => disputeScheduledSiteVisit(token, visit.id, disputeReason.trim() || undefined));
  }

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-ink/5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <Link href={`/listings/x--${visit.propertyId}`} className="block truncate text-sm font-medium text-ink hover:underline">
            {visit.propertyTitle ?? "Property"}
          </Link>
          <p className="truncate text-xs text-body">{visit.propertyLocation}</p>
        </div>
        <StatusBadge status={visit.status} />
      </div>
      <div className="mt-3 space-y-1 text-xs text-body">
        <p>Requested for {fmtDate(visit.requestedDate)}</p>
        {visit.proposedDate && (
          <p>
            {visit.proposedBy === "BUYER" ? "You proposed" : "Agent proposed"} {fmtDate(visit.proposedDate)}
            {awaitingBuyer && " — awaiting your response"}
          </p>
        )}
        {visit.scheduledDate && (
          <p>
            Scheduled for {fmtDate(visit.scheduledDate)}
            {bookedOffline && (
              <span className="ml-1.5 inline-block rounded-full bg-ink/5 px-2 py-0.5 text-[10px] font-medium text-ink/60 ring-1 ring-ink/10">
                booked following a call
              </span>
            )}
          </p>
        )}
        {visit.agentName && <p>Agent: {visit.agentName}</p>}
        {visit.buyerNote && <p className="text-ink/70">Your note: “{visit.buyerNote}”</p>}
        {visit.feedback && <p className="text-ink/70">Agent feedback: “{visit.feedback}”</p>}
      </div>

      {error && <p className="mt-3 text-xs text-red-700">{error}</p>}

      {active && (
        <div className="mt-4 border-t border-ink/5 pt-4">
          {proposing ? (
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <input
                type="datetime-local"
                value={proposedDate}
                onChange={(e) => setProposedDate(e.target.value)}
                className="rounded-xl border border-ink/10 bg-white px-4 py-2 text-sm outline-none focus:border-ink/30"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => setProposing(false)}
                  className="rounded-full bg-ink/5 px-4 py-2 text-xs font-medium text-ink/70 hover:bg-ink/10"
                >
                  Cancel
                </button>
                <button
                  onClick={submitPropose}
                  disabled={busy || !proposedDate}
                  className="rounded-full bg-panel px-4 py-2 text-xs font-medium text-white disabled:opacity-50"
                >
                  {busy ? "Sending…" : "Send"}
                </button>
              </div>
            </div>
          ) : disputing ? (
            <div className="flex flex-col gap-2">
              <textarea
                rows={2}
                value={disputeReason}
                onChange={(e) => setDisputeReason(e.target.value)}
                placeholder="What did you actually agree to? (optional)"
                className="resize-none rounded-xl border border-ink/10 bg-white px-3 py-2 text-sm outline-none focus:border-ink/30"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => setDisputing(false)}
                  className="rounded-full bg-ink/5 px-4 py-2 text-xs font-medium text-ink/70 hover:bg-ink/10"
                >
                  Cancel
                </button>
                <button
                  onClick={submitDispute}
                  disabled={busy}
                  className="rounded-full bg-red-700 px-4 py-2 text-xs font-medium text-white disabled:opacity-50"
                >
                  {busy ? "Sending…" : "Submit dispute"}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap gap-2">
                {awaitingBuyer && (
                  <>
                    <button
                      onClick={() => token && run(() => declineSiteVisit(token, visit.id))}
                      disabled={busy}
                      className="rounded-full bg-ink/5 px-4 py-2 text-xs font-medium text-ink/70 hover:bg-ink/10 disabled:opacity-50"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => token && run(() => acceptSiteVisit(token, visit.id))}
                      disabled={busy}
                      className="rounded-full bg-panel px-4 py-2 text-xs font-medium text-white disabled:opacity-50"
                    >
                      {busy ? "Working…" : "Accept"}
                    </button>
                  </>
                )}
                {bookedOffline ? (
                  <button
                    onClick={() => setDisputing(true)}
                    disabled={busy}
                    className="rounded-full bg-ink/5 px-4 py-2 text-xs font-medium text-red-700 hover:bg-ink/10 disabled:opacity-50"
                  >
                    Dispute this booking
                  </button>
                ) : (
                  <button
                    onClick={() => setProposing(true)}
                    disabled={busy}
                    className="rounded-full bg-ink/5 px-4 py-2 text-xs font-medium text-ink/70 hover:bg-ink/10 disabled:opacity-50"
                  >
                    {visit.status === "SCHEDULED" ? "Reschedule" : "Propose a time"}
                  </button>
                )}
              </div>
              <button
                onClick={cancel}
                disabled={busy}
                className="text-xs font-medium text-red-700 underline underline-offset-2 disabled:opacity-50"
              >
                Cancel visit
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function VisitsPanel() {
  const { token } = useAuth();
  const cacheKey = token ? `buyerVisits:${token}` : null;
  const { items, setItems, error } = useCachedPanelData<SiteVisit[]>(cacheKey, () =>
    getSiteVisits(token!, "buyer").then((r) => r.items)
  );

  return (
    <Panel
      loading={items === null && !error}
      error={error}
      empty={items?.length === 0}
      emptyText="No site visits requested. Request a tour from any listing to schedule a visit."
    >
      {items?.map((v) => (
        <SiteVisitCard
          key={v.id}
          visit={v}
          onChanged={(updated) => setItems((prev) => prev?.map((x) => (x.id === updated.id ? updated : x)) ?? null)}
        />
      ))}
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
