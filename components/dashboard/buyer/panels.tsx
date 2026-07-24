"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { price } from "@/lib/listings";
import { propertyHref } from "@/lib/slug";
import { useAuth } from "@/lib/auth/AuthContext";
import StatusBadge from "@/components/dashboard/StatusBadge";
import { RowSkeleton } from "@/components/Skeleton";
import {
  getShortlist,
  removeShortlist,
  getOffers,
  respondToCounter,
  getSiteVisits,
  cancelSiteVisit,
  getSavedSearches,
  deleteSavedSearch,
  setSavedSearchAlerts,
  getDeals,
} from "@/lib/api/buyer";
import type {
  Deal,
  Offer,
  SavedSearch,
  SavedSearchFilters,
  SiteVisit,
  ShortlistedProperty,
} from "@/types/buyer";

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

function Panel({
  loading,
  error,
  empty,
  emptyText,
  children,
}: {
  loading: boolean;
  error: string | null;
  empty: boolean;
  emptyText: string;
  children: React.ReactNode;
}) {
  if (loading)
    return (
      <div className="flex flex-col gap-3">
        <RowSkeleton />
        <RowSkeleton />
        <RowSkeleton />
      </div>
    );
  if (error) return <p className="py-8 text-sm text-red-700">{error}</p>;
  if (empty)
    return (
      <p className="rounded-2xl bg-white p-6 text-sm text-body ring-1 ring-ink/5">{emptyText}</p>
    );
  return <div className="flex flex-col gap-3">{children}</div>;
}

// ── Saved properties ──────────────────────────────────────────
export function SavedPanel() {
  const { token } = useAuth();
  const [items, setItems] = useState<ShortlistedProperty[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    getShortlist(token)
      .then((r) => setItems(r.items))
      .catch((e) => setError(e.message));
  }, [token]);

  async function remove(id: string) {
    if (!token) return;
    setBusy(id);
    try {
      await removeShortlist(token, id);
      setItems((prev) => prev?.filter((p) => p.id !== id) ?? null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to remove");
    } finally {
      setBusy(null);
    }
  }

  return (
    <Panel
      loading={items === null && !error}
      error={error}
      empty={items?.length === 0}
      emptyText="No saved properties yet. Browse listings and tap the heart to save the ones you like."
    >
      {items?.map((p) => (
        <div key={p.id} className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-ink/5">
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
      ))}
    </Panel>
  );
}

// ── Offers & negotiation ──────────────────────────────────────
export function OffersPanel() {
  const { token } = useAuth();
  const [items, setItems] = useState<Offer[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  function load() {
    if (!token) return;
    getOffers(token)
      .then((r) => setItems(r.items))
      .catch((e) => setError(e.message));
  }
  useEffect(load, [token]);

  async function respond(offerId: string, accept: boolean) {
    if (!token) return;
    setBusy(offerId);
    try {
      await respondToCounter(token, offerId, accept);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Action failed");
    } finally {
      setBusy(null);
    }
  }

  return (
    <Panel
      loading={items === null && !error}
      error={error}
      empty={items?.length === 0}
      emptyText="No offers yet. Open a listing and submit an offer to start negotiating."
    >
      {items?.map((o) => {
        const countered = o.displayStatus === "COUNTERED" && o.counterAmount != null;
        return (
          <div key={o.id} className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-ink/5">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <Link href={`/listings/x--${o.propertyId}`} className="block truncate text-sm font-medium text-ink hover:underline">
                  {o.propertyTitle ?? "Property"}
                </Link>
                <p className="truncate text-xs text-body">{o.propertyLocation}</p>
              </div>
              <StatusBadge status={o.displayStatus} />
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-1 text-sm">
              <span className="text-body">
                Your offer: <span className="font-semibold text-ink">{price(o.amount)}</span>
              </span>
              {o.counterAmount != null && (
                <span className="text-body">
                  Counter: <span className="font-semibold text-ink">{price(o.counterAmount)}</span>
                </span>
              )}
            </div>
            {o.message && <p className="mt-2 text-xs text-body">“{o.message}”</p>}
            {countered && (
              <div className="mt-4 flex flex-col gap-3 border-t border-ink/5 pt-4 sm:flex-row sm:items-center">
                <p className="text-xs text-body sm:mr-auto">
                  The seller countered at {price(o.counterAmount!)}. Accept to start the deal, or decline.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => respond(o.id, false)}
                    disabled={busy === o.id}
                    className="flex-1 rounded-full bg-ink/5 px-4 py-2 text-xs font-medium text-ink/70 hover:bg-ink/10 disabled:opacity-50 sm:flex-none"
                  >
                    Decline
                  </button>
                  <button
                    onClick={() => respond(o.id, true)}
                    disabled={busy === o.id}
                    className="flex-1 rounded-full bg-panel px-4 py-2 text-xs font-medium text-white disabled:opacity-50 sm:flex-none"
                  >
                    {busy === o.id ? "Working…" : "Accept counter"}
                  </button>
                </div>
              </div>
            )}
            <p className="mt-3 text-[11px] text-ink/40">Submitted {fmtDate(o.createdAt)}</p>
          </div>
        );
      })}
    </Panel>
  );
}

// ── Site visits ───────────────────────────────────────────────
export function VisitsPanel() {
  const { token } = useAuth();
  const [items, setItems] = useState<SiteVisit[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  function load() {
    if (!token) return;
    getSiteVisits(token)
      .then((r) => setItems(r.items))
      .catch((e) => setError(e.message));
  }
  useEffect(load, [token]);

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
function filtersToQuery(f: SavedSearchFilters): string {
  const p = new URLSearchParams();
  if (f.q) p.set("q", f.q);
  if (f.type) p.set("type", f.type);
  if (f.city) p.set("city", f.city);
  return p.toString();
}
function filtersSummary(f: SavedSearchFilters): string {
  const parts: string[] = [];
  if (f.q) parts.push(`“${f.q}”`);
  if (f.type) parts.push(f.type.charAt(0) + f.type.slice(1).toLowerCase());
  if (f.city) parts.push(f.city);
  if (f.minBhk) parts.push(`${f.minBhk}+ BHK`);
  if (f.minPrice || f.maxPrice) {
    parts.push(
      f.minPrice && f.maxPrice
        ? `${price(f.minPrice)}–${price(f.maxPrice)}`
        : f.minPrice
        ? `from ${price(f.minPrice)}`
        : `up to ${price(f.maxPrice!)}`
    );
  }
  return parts.length ? parts.join(" · ") : "All properties";
}

export function SearchesPanel() {
  const { token } = useAuth();
  const [items, setItems] = useState<SavedSearch[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    getSavedSearches(token)
      .then(setItems)
      .catch((e) => setError(e.message));
  }, [token]);

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
              href={`/listings${filtersToQuery(s.filters) ? `?${filtersToQuery(s.filters)}` : ""}`}
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
function Step({ done, label, detail }: { done: boolean; label: string; detail?: string }) {
  return (
    <div className="flex items-start gap-3">
      <span
        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] ${
          done ? "bg-lime text-ink" : "bg-ink/10 text-ink/40"
        }`}
      >
        {done ? "✓" : ""}
      </span>
      <div>
        <p className={`text-sm ${done ? "text-ink" : "text-ink/50"}`}>{label}</p>
        {detail && <p className="text-xs text-body">{detail}</p>}
      </div>
    </div>
  );
}

export function ClosingPanel() {
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
      emptyText="No active deals. Once an offer is accepted, your closing paperwork and payment progress appear here."
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

          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            <div className="rounded-xl bg-cream px-3 py-2.5">
              <p className="text-[11px] text-body">Agreed price</p>
              <p className="text-sm font-semibold text-ink">{price(d.agreedPrice)}</p>
            </div>
            <div className="rounded-xl bg-cream px-3 py-2.5">
              <p className="text-[11px] text-body">Token paid</p>
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
              label="Token payment recorded"
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
            Questions about your paperwork or documentation?{" "}
            <Link href="/contact" className="font-medium text-ink underline underline-offset-2">
              Contact your Diggaj coordinator →
            </Link>
          </div>
        </div>
      ))}
    </Panel>
  );
}
