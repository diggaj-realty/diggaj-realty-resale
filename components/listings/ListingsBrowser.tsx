"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { getProperties } from "@/lib/api/properties";
import { createSavedSearch } from "@/lib/api/buyer";
import { buildFilterQueryString, parseFilterSearchParams } from "@/lib/filters";
import { CANONICAL_CITIES } from "@/lib/cities";
import { FURNISHING, FACING, FACING_LABEL, POSSESSION_STATUS, OWNERSHIP_TYPE } from "@/lib/propertyEnums";
import { price } from "@/lib/listings";
import { useAuth } from "@/lib/auth/AuthContext";
import { hasRole } from "@/lib/auth/roles";
import { ApiError } from "@/lib/api/client";
import type {
  Facing,
  Furnishing,
  GetPropertiesParams,
  OwnershipType,
  Paginated,
  PossessionStatus,
  Property,
  SortOrder,
} from "@/types/api";
import ListingCard from "@/components/listings/ListingCard";
import { ListingGridSkeleton } from "@/components/Skeleton";

const PRICE_PRESETS = [
  { label: "Any price", min: undefined, max: undefined },
  { label: "Under ₹3 Cr", min: undefined, max: 30000000 },
  { label: "₹3 – 6 Cr", min: 30000000, max: 60000000 },
  { label: "₹6 Cr+", min: 60000000, max: undefined },
] as const;

const BED_OPTIONS = [
  { label: "Any beds", minBhk: undefined },
  { label: "3+", minBhk: 3 },
  { label: "4+", minBhk: 4 },
  { label: "5+", minBhk: 5 },
] as const;

const BATH_OPTIONS = [
  { label: "Any", value: undefined },
  { label: "1+", value: 1 },
  { label: "2+", value: 2 },
  { label: "3+", value: 3 },
  { label: "4+", value: 4 },
] as const;

const AGE_OPTIONS = [
  { label: "Any age", value: undefined },
  { label: "New construction", value: 0 },
  { label: "Under 5 yrs", value: 5 },
  { label: "Under 10 yrs", value: 10 },
] as const;

const SORT_OPTIONS: { label: string; value: SortOrder }[] = [
  { label: "Newest first", value: "newest" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
  { label: "Area: Small to Large", value: "area_asc" },
  { label: "Area: Large to Small", value: "area_desc" },
  { label: "Most viewed", value: "most_viewed" },
];

export const PAGE_SIZE = 9;
const CR = 10000000; // one crore in rupees — custom range inputs are entered in ₹ Cr
// How many to pull per area when merging multiple localities client-side. The
// backend can't OR localities, so each is fetched separately; this caps each
// leg so a broad multi-area search can't fan out into huge requests.
const MULTI_FETCH_SIZE = 60;

// Client-side ordering for the merged multi-area result set — mirrors the
// backend's `sort` options so switching sort behaves the same whether one area
// (server-sorted) or several (merged here) are selected.
function sortProperties(list: Property[], sort: SortOrder): Property[] {
  const arr = [...list];
  switch (sort) {
    case "price_asc":
      return arr.sort((a, b) => a.askingPrice - b.askingPrice);
    case "price_desc":
      return arr.sort((a, b) => b.askingPrice - a.askingPrice);
    case "area_asc":
      return arr.sort((a, b) => a.areaSqft - b.areaSqft);
    case "area_desc":
      return arr.sort((a, b) => b.areaSqft - a.areaSqft);
    case "most_viewed":
      return arr.sort((a, b) => b.viewCount - a.viewCount);
    case "newest":
    default:
      return arr.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
}

const chip = (active: boolean) =>
  `rounded-full px-4 py-2 text-xs font-medium transition-colors ${
    active ? "bg-panel text-white" : "bg-ink/5 text-ink/70 hover:bg-ink/10"
  }`;

const humanize = (s: string) => s.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase());

function priceLabel(min?: number, max?: number): string {
  if (min == null && max == null) return "Any price";
  if (min != null && max != null) return `${price(min)} – ${price(max)}`;
  if (min != null) return `From ${price(min)}`;
  return `Up to ${price(max!)}`;
}

export default function ListingsBrowser({
  initialData,
}: {
  // Server-fetched page-1 results for the URL the page was requested with, so
  // the first paint already has real listings instead of a client-fetched
  // skeleton. Omitted (or stale relative to the URL) just falls back to the
  // normal client fetch on mount.
  initialData?: Paginated<Property>;
} = {}) {
  const params = useSearchParams();
  const router = useRouter();
  const { user, token } = useAuth();

  // Hydrate every filter from the URL on first render, so a shared/bookmarked
  // link or a saved search's "Apply search →" reproduces the exact same results.
  const [initial] = useState(() => parseFilterSearchParams(params));
  const initialBedsIndex = Math.max(
    0,
    BED_OPTIONS.findIndex((b) => b.minBhk === initial.minBhk)
  );

  // ── Tier 1 (always visible) ──
  const [q, setQ] = useState(initial.q ?? "");
  const [debouncedQ, setDebouncedQ] = useState(q);
  const [minPrice, setMinPrice] = useState<number | undefined>(initial.minPrice);
  const [maxPrice, setMaxPrice] = useState<number | undefined>(initial.maxPrice);
  const [beds, setBeds] = useState(initialBedsIndex);
  const [city, setCity] = useState(initial.city ?? "");
  const [sort, setSort] = useState<SortOrder>(initial.sort ?? "newest");

  const [priceOpen, setPriceOpen] = useState(false);
  const [minInput, setMinInput] = useState(initial.minPrice != null ? String(initial.minPrice / CR) : "");
  const [maxInput, setMaxInput] = useState(initial.maxPrice != null ? String(initial.maxPrice / CR) : "");
  const [sortOpen, setSortOpen] = useState(false);

  // ── Tier 2 (More filters drawer) ──
  const [moreOpen, setMoreOpen] = useState(false);
  // Multiple selectable areas (OR). The backend matches only one locality per
  // request, so 2+ areas are fanned out into one request each and merged
  // client-side (see the fetch effect). `localityInput` is the in-progress tag.
  const [localities, setLocalities] = useState<string[]>(initial.localities ?? []);
  const [localityInput, setLocalityInput] = useState("");
  const [minBathrooms, setMinBathrooms] = useState<number | undefined>(initial.minBathrooms);
  const [minAreaInput, setMinAreaInput] = useState(initial.minArea != null ? String(initial.minArea) : "");
  const [maxAreaInput, setMaxAreaInput] = useState(initial.maxArea != null ? String(initial.maxArea) : "");
  const [minArea, setMinArea] = useState<number | undefined>(initial.minArea);
  const [maxArea, setMaxArea] = useState<number | undefined>(initial.maxArea);
  const [furnishing, setFurnishing] = useState<Furnishing | "">(initial.furnishing ?? "");
  const [facing, setFacing] = useState<Facing | "">(initial.facing ?? "");
  const [possessionStatus, setPossessionStatus] = useState<PossessionStatus | "">(initial.possessionStatus ?? "");
  const [maxAgeYears, setMaxAgeYears] = useState<number | undefined>(initial.maxAgeYears);
  const [parking, setParking] = useState(!!initial.parking);
  const [ownershipType, setOwnershipType] = useState<OwnershipType | "">(initial.ownershipType ?? "");
  const [eliteOnly, setEliteOnly] = useState(!!initial.eliteOnly);

  // ── Save this search ──
  const [savingOpen, setSavingOpen] = useState(false);
  const [saveName, setSaveName] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const [items, setItems] = useState<Property[]>(initialData?.items ?? []);
  const [total, setTotal] = useState(initialData?.total ?? 0);
  const [page, setPage] = useState(initialData?.page ?? 1);
  const [totalPages, setTotalPages] = useState(initialData?.totalPages ?? 1);
  const [loading, setLoading] = useState(!initialData);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Skip exactly one client fetch — the one that would otherwise duplicate
  // the server-fetched initialData on first mount.
  const skipNextFetchRef = useRef(!!initialData);
  // Holds the full merged result set when 2+ areas are selected, so "Load more"
  // can paginate it in-memory without refetching. Null on the single/no-area
  // (server-paginated) path.
  const multiAllRef = useRef<Property[] | null>(null);

  const effectiveBeds = beds;

  // debounce the free-text search input
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q), 350);
    return () => clearTimeout(t);
  }, [q]);

  // Base filters WITHOUT locality — the locality dimension is applied
  // separately (single request, or fanned out per area and merged) since the
  // backend only accepts one locality at a time.
  function buildFilters(): GetPropertiesParams {
    return {
      q: debouncedQ.trim() || undefined,
      city: city || undefined,
      localities: localities.length ? localities : undefined,
      minPrice,
      maxPrice,
      minBhk: BED_OPTIONS[effectiveBeds].minBhk,
      minBathrooms,
      minArea,
      maxArea,
      furnishing: furnishing || undefined,
      facing: facing || undefined,
      possessionStatus: possessionStatus || undefined,
      maxAgeYears,
      parking: parking || undefined,
      ownershipType: ownershipType || undefined,
      eliteOnly: eliteOnly || undefined,
      sort,
    };
  }

  // reset to a loading state as soon as the effective filters change, during
  // render rather than inside the effect (see react.dev "adjusting state
  // when a prop changes").
  const filterKey = JSON.stringify(buildFilters());
  const [lastFilterKey, setLastFilterKey] = useState(filterKey);
  if (lastFilterKey !== filterKey) {
    setLastFilterKey(filterKey);
    setLoading(true);
    setError(null);
    setSaved(false);
  }

  // refetch page 1 whenever the effective filters change, and keep the address
  // bar in sync so the current search is always shareable/bookmarkable
  useEffect(() => {
    if (skipNextFetchRef.current) {
      skipNextFetchRef.current = false;
      return;
    }
    const controller = new AbortController();
    const filters = buildFilters();
    const qs = buildFilterQueryString(filters);
    router.replace(qs ? `/listings?${qs}` : "/listings", { scroll: false });

    // Base filters minus the locality dimension — applied per request below.
    const { localities: locs, ...base } = filters;

    const run = async () => {
      try {
        if (locs && locs.length > 1) {
          // OR across areas: one request per locality, then merge + dedupe +
          // sort + paginate client-side (the backend accepts only one at once).
          const pages = await Promise.all(
            locs.map((l) =>
              getProperties(
                { ...base, locality: l, pageSize: MULTI_FETCH_SIZE },
                { signal: controller.signal }
              )
            )
          );
          if (controller.signal.aborted) return;
          const byId = new Map<string, Property>();
          for (const pg of pages) for (const p of pg.items) byId.set(p.id, p);
          const merged = sortProperties([...byId.values()], sort);
          multiAllRef.current = merged;
          setItems(merged.slice(0, PAGE_SIZE));
          setTotal(merged.length);
          setPage(1);
          setTotalPages(Math.max(1, Math.ceil(merged.length / PAGE_SIZE)));
        } else {
          multiAllRef.current = null;
          const res = await getProperties(
            { ...base, locality: locs?.[0], page: 1, pageSize: PAGE_SIZE },
            { signal: controller.signal }
          );
          if (controller.signal.aborted) return;
          setItems(res.items);
          setTotal(res.total);
          setPage(res.page);
          setTotalPages(res.totalPages);
        }
        setLoading(false);
      } catch (err) {
        if (controller.signal.aborted) return;
        setError(err instanceof Error ? err.message : "Failed to load listings");
        setLoading(false);
      }
    };
    run();
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterKey]);

  async function loadMore() {
    // Multi-area path: the full result set is already in memory — just reveal
    // the next slice, no network call.
    if (multiAllRef.current) {
      const next = page + 1;
      setItems(multiAllRef.current.slice(0, next * PAGE_SIZE));
      setPage(next);
      return;
    }
    setLoadingMore(true);
    try {
      const { localities: locs, ...base } = buildFilters();
      const res = await getProperties({ ...base, locality: locs?.[0], page: page + 1, pageSize: PAGE_SIZE });
      setItems((prev) => [...prev, ...res.items]);
      setPage(res.page);
      setTotalPages(res.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load more listings");
    } finally {
      setLoadingMore(false);
    }
  }

  function addLocality(raw: string) {
    const name = raw.trim();
    if (!name) return;
    // case-insensitive dedupe so "Whitefield" and "whitefield" don't both stick
    if (localities.some((l) => l.toLowerCase() === name.toLowerCase())) {
      setLocalityInput("");
      return;
    }
    setLocalities((prev) => [...prev, name]);
    setLocalityInput("");
  }

  function removeLocality(name: string) {
    setLocalities((prev) => prev.filter((l) => l !== name));
  }

  function applyPreset(min?: number, max?: number) {
    setMinPrice(min);
    setMaxPrice(max);
    setMinInput(min != null ? String(min / CR) : "");
    setMaxInput(max != null ? String(max / CR) : "");
  }

  function applyCustomRange() {
    const min = minInput.trim() ? Math.round(parseFloat(minInput) * CR) : undefined;
    const max = maxInput.trim() ? Math.round(parseFloat(maxInput) * CR) : undefined;
    setMinPrice(Number.isFinite(min as number) ? min : undefined);
    setMaxPrice(Number.isFinite(max as number) ? max : undefined);
    setPriceOpen(false);
  }

  function applyAreaRange() {
    const min = minAreaInput.trim() ? Math.round(parseFloat(minAreaInput)) : undefined;
    const max = maxAreaInput.trim() ? Math.round(parseFloat(maxAreaInput)) : undefined;
    setMinArea(Number.isFinite(min as number) ? min : undefined);
    setMaxArea(Number.isFinite(max as number) ? max : undefined);
  }

  const priceActive = minPrice != null || maxPrice != null;
  const moreActiveCount = [
    localities.length > 0,
    minBathrooms != null,
    minArea != null,
    maxArea != null,
    !!furnishing,
    !!facing,
    !!possessionStatus,
    maxAgeYears != null,
    parking,
    !!ownershipType,
    eliteOnly,
  ].filter(Boolean).length;
  const anyFilterActive =
    q.trim() !== "" || priceActive || beds !== 0 || city !== "" || moreActiveCount > 0;
  // On mobile the Tier-1 pill row (city/price/beds) is folded into the
  // same drawer as "More filters", so its one "Filters" button needs the
  // combined count across both tiers.
  const tier1ActiveCount = [priceActive, beds !== 0, city !== ""].filter(Boolean).length;
  const totalActiveCount = tier1ActiveCount + moreActiveCount;

  function clearAll() {
    setQ("");
    applyPreset(undefined, undefined);
    setBeds(0);
    setCity("");
    setLocalities([]);
    setLocalityInput("");
    setMinBathrooms(undefined);
    setMinAreaInput("");
    setMaxAreaInput("");
    setMinArea(undefined);
    setMaxArea(undefined);
    setFurnishing("");
    setFacing("");
    setPossessionStatus("");
    setMaxAgeYears(undefined);
    setParking(false);
    setOwnershipType("");
    setEliteOnly(false);
  }

  async function saveSearch() {
    if (!hasRole(user, "BUYER") || !token) {
      router.push("/login/buyer");
      return;
    }
    setSaving(true);
    setSaveError(null);
    try {
      await createSavedSearch(token, {
        name: saveName.trim() || undefined,
        filters: buildFilters(),
        alertsEnabled: true,
      });
      setSaved(true);
      setSavingOpen(false);
      setSaveName("");
    } catch (e) {
      setSaveError(e instanceof ApiError ? e.message : "Failed to save search");
    } finally {
      setSaving(false);
    }
  }

  // Shared between the desktop pill row and the mobile compact bar — same
  // sortOpen/sort state either way, just rendered at two different spots.
  const sortControl = (
    <div className="relative">
      <button
        onClick={() => setSortOpen((o) => !o)}
        className="flex w-full items-center justify-center gap-1.5 rounded-full bg-ink/5 py-3 pl-4 pr-3 text-sm font-medium text-ink/70 hover:bg-ink/10 md:w-auto md:py-2 md:text-xs"
      >
        {SORT_OPTIONS.find((s) => s.value === sort)?.label}
        <svg
          className={sortOpen ? "rotate-180" : ""}
          width="12" height="12" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      {sortOpen && (
        <>
          <button
            aria-label="Close sort menu"
            onClick={() => setSortOpen(false)}
            className="fixed inset-0 z-30 cursor-default"
          />
          <div className="absolute right-0 top-full z-40 mt-2 w-52 rounded-2xl bg-white p-1.5 shadow-2xl ring-1 ring-ink/10">
            {SORT_OPTIONS.map((s) => (
              <button
                key={s.value}
                onClick={() => {
                  setSort(s.value);
                  setSortOpen(false);
                }}
                className={`block w-full rounded-xl px-3 py-2 text-left text-xs font-medium ${
                  sort === s.value ? "bg-panel text-white" : "text-ink/70 hover:bg-ink/5"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );

  return (
    <section className="px-8 py-12 md:px-14">
      {/* search + filters */}
      <div className="flex flex-col gap-5">
        <div className="relative max-w-xl">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by city, address, or name…"
            className="w-full rounded-full bg-ink/5 py-4 pl-12 pr-5 text-sm text-ink ring-1 ring-ink/10 placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-lime"
          />
          <svg
            className="absolute left-5 top-1/2 -translate-y-1/2 text-ink/40"
            width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" />
          </svg>
        </div>

        {/* Tier-1 filters — full pill row, desktop/tablet only. On mobile
            these fold into the same "Filters" drawer as Tier 2 (below). */}
        <div className="hidden flex-wrap items-center gap-2 md:flex">
          {/* city */}
          <div className="relative">
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              aria-label="Filter by city"
              className={`appearance-none rounded-full py-2 pl-4 pr-9 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-lime ${
                city ? "bg-panel text-white" : "bg-ink/5 text-ink/70 hover:bg-ink/10"
              }`}
            >
              <option value="">All cities</option>
              {city && !CANONICAL_CITIES.includes(city as (typeof CANONICAL_CITIES)[number]) && (
                <option value={city}>{city}</option>
              )}
              {CANONICAL_CITIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <svg
              className={`pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 ${
                city ? "text-white/70" : "text-ink/40"
              }`}
              width="12" height="12" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </div>

          <span className="mx-1 h-5 w-px bg-ink/10" />

          {/* price (presets + custom range) */}
          <div className="relative">
            <button
              onClick={() => setPriceOpen((o) => !o)}
              className={`flex items-center gap-1.5 rounded-full py-2 pl-4 pr-3 text-xs font-medium transition-colors ${
                priceActive ? "bg-panel text-white" : "bg-ink/5 text-ink/70 hover:bg-ink/10"
              }`}
            >
              {priceLabel(minPrice, maxPrice)}
              <svg
                className={priceOpen ? "rotate-180" : ""}
                width="12" height="12" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>

            {priceOpen && (
              <>
                <button
                  aria-label="Close price filter"
                  onClick={() => setPriceOpen(false)}
                  className="fixed inset-0 z-30 cursor-default"
                />
                <div className="absolute left-0 top-full z-40 mt-2 w-[calc(100vw-2.5rem)] max-w-xs rounded-2xl bg-white p-4 shadow-2xl ring-1 ring-ink/10 sm:w-72">
                  <div className="flex flex-wrap gap-2">
                    {PRICE_PRESETS.map((p) => {
                      const active = minPrice === p.min && maxPrice === p.max;
                      return (
                        <button
                          key={p.label}
                          onClick={() => applyPreset(p.min, p.max)}
                          className={chip(active)}
                        >
                          {p.label}
                        </button>
                      );
                    })}
                  </div>

                  <div className="my-4 flex items-center gap-3 text-[11px] uppercase tracking-wide text-ink/35">
                    <span className="h-px flex-1 bg-ink/10" /> or set a range <span className="h-px flex-1 bg-ink/10" />
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="flex-1">
                      <span className="mb-1 block text-[11px] text-body">Min (₹ Cr)</span>
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={minInput}
                        onChange={(e) => setMinInput(e.target.value)}
                        placeholder="0"
                        className="w-full rounded-xl border border-ink/10 bg-white px-3 py-2 text-sm outline-none focus:border-ink/30"
                      />
                    </label>
                    <span className="mt-5 text-ink/40">–</span>
                    <label className="flex-1">
                      <span className="mb-1 block text-[11px] text-body">Max (₹ Cr)</span>
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={maxInput}
                        onChange={(e) => setMaxInput(e.target.value)}
                        placeholder="Any"
                        className="w-full rounded-xl border border-ink/10 bg-white px-3 py-2 text-sm outline-none focus:border-ink/30"
                      />
                    </label>
                  </div>

                  <button
                    onClick={applyCustomRange}
                    className="mt-4 w-full rounded-full bg-panel px-4 py-2.5 text-xs font-medium text-white"
                  >
                    Apply range
                  </button>
                </div>
              </>
            )}
          </div>

          {/* beds */}
          <span className="mx-1 h-5 w-px bg-ink/10" />
          {BED_OPTIONS.map((b, i) => (
            <button key={b.label} onClick={() => setBeds(i)} className={chip(beds === i)}>
              {b.label}
            </button>
          ))}

          <span className="mx-1 h-5 w-px bg-ink/10" />

          {/* More filters toggle */}
          <button
            onClick={() => setMoreOpen((o) => !o)}
            className={`flex items-center gap-1.5 ${chip(moreActiveCount > 0 || moreOpen)}`}
          >
            More filters
            {moreActiveCount > 0 && (
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-lime text-[10px] font-semibold text-ink">
                {moreActiveCount}
              </span>
            )}
          </button>

          {/* Sort */}
          <div className="ml-auto">{sortControl}</div>

          {anyFilterActive && (
            <button
              onClick={clearAll}
              className="rounded-full px-3 py-2 text-xs font-medium text-ink/50 underline underline-offset-4 hover:text-ink"
            >
              Clear all
            </button>
          )}
        </div>

        {/* Compact filter bar — mobile only. City/type/price/beds fold into
            the same drawer as "More filters" below instead of a long row of
            wrapping pills. */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={() => setMoreOpen((o) => !o)}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-full py-3 text-sm font-medium ${
              totalActiveCount > 0 || moreOpen ? "bg-panel text-white" : "bg-ink/5 text-ink/70"
            }`}
          >
            Filters
            {totalActiveCount > 0 && (
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-lime text-[10px] font-semibold text-ink">
                {totalActiveCount}
              </span>
            )}
          </button>
          {sortControl}
          {anyFilterActive && (
            <button
              onClick={clearAll}
              aria-label="Clear all filters"
              className="shrink-0 rounded-full bg-ink/5 px-3 py-3 text-xs font-medium text-ink/50"
            >
              Clear
            </button>
          )}
        </div>

        {/* More filters drawer */}
        {moreOpen && (
          <div className="rounded-2xl bg-cream p-5">
            {/* Tier-1 filters — mobile only, since the pill row above already
                covers these on desktop/tablet. */}
            <div className="mb-5 grid grid-cols-1 gap-5 border-b border-ink/10 pb-5 sm:grid-cols-2 md:hidden">
              <div>
                <p className="text-xs font-medium text-ink">City</p>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="mt-2 w-full appearance-none rounded-xl border border-ink/10 bg-white px-3 py-2.5 text-sm outline-none focus:border-ink/30"
                >
                  <option value="">All cities</option>
                  {city && !CANONICAL_CITIES.includes(city as (typeof CANONICAL_CITIES)[number]) && (
                    <option value={city}>{city}</option>
                  )}
                  {CANONICAL_CITIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <p className="text-xs font-medium text-ink">Price range</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {PRICE_PRESETS.map((p) => {
                    const active = minPrice === p.min && maxPrice === p.max;
                    return (
                      <button key={p.label} onClick={() => applyPreset(p.min, p.max)} className={chip(active)}>
                        {p.label}
                      </button>
                    );
                  })}
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={minInput}
                    onChange={(e) => setMinInput(e.target.value)}
                    placeholder="Min ₹Cr"
                    className="w-full rounded-xl border border-ink/10 bg-white px-3 py-2 text-sm outline-none focus:border-ink/30"
                  />
                  <span className="text-ink/40">–</span>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={maxInput}
                    onChange={(e) => setMaxInput(e.target.value)}
                    placeholder="Max ₹Cr"
                    className="w-full rounded-xl border border-ink/10 bg-white px-3 py-2 text-sm outline-none focus:border-ink/30"
                  />
                  <button
                    onClick={applyCustomRange}
                    className="shrink-0 rounded-full bg-panel px-4 py-2 text-xs font-medium text-white"
                  >
                    Apply
                  </button>
                </div>
              </div>

              <div>
                <p className="text-xs font-medium text-ink">Bedrooms</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {BED_OPTIONS.map((b, i) => (
                    <button key={b.label} onClick={() => setBeds(i)} className={chip(beds === i)}>
                      {b.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <p className="text-xs font-medium text-ink">
                  Areas
                  <span className="ml-1 font-normal text-body">
                    {localities.length > 0 ? "(showing any of these)" : "(add one or more)"}
                  </span>
                </p>
                <input
                  type="text"
                  value={localityInput}
                  onChange={(e) => setLocalityInput(e.target.value)}
                  onKeyDown={(e) => {
                    // Enter or comma turns what's typed into an area chip.
                    if (e.key === "Enter" || e.key === ",") {
                      e.preventDefault();
                      addLocality(localityInput);
                    } else if (e.key === "Backspace" && !localityInput && localities.length) {
                      // Backspace on an empty box removes the last chip.
                      removeLocality(localities[localities.length - 1]);
                    }
                  }}
                  onBlur={() => addLocality(localityInput)}
                  placeholder="e.g. Whitefield, Varthur…"
                  className="mt-2 w-full rounded-xl border border-ink/10 bg-white px-3 py-2 text-sm outline-none focus:border-ink/30"
                />
                <p className="mt-1.5 text-[11px] text-body">
                  Type an area and press Enter. Add several to see homes across all of them.
                </p>
                {localities.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {localities.map((l) => (
                      <span
                        key={l}
                        className="inline-flex items-center gap-1 rounded-full bg-panel px-2.5 py-1 text-xs font-medium text-white"
                      >
                        {l}
                        <button
                          type="button"
                          onClick={() => removeLocality(l)}
                          aria-label={`Remove ${l}`}
                          className="text-white/60 hover:text-white"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <p className="text-xs font-medium text-ink">Bathrooms</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {BATH_OPTIONS.map((b) => (
                    <button
                      key={b.label}
                      onClick={() => setMinBathrooms(b.value)}
                      className={chip(minBathrooms === b.value)}
                    >
                      {b.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-medium text-ink">Area (sq ft)</p>
                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    value={minAreaInput}
                    onChange={(e) => setMinAreaInput(e.target.value)}
                    onBlur={applyAreaRange}
                    placeholder="Min"
                    className="w-full rounded-xl border border-ink/10 bg-white px-3 py-2 text-sm outline-none focus:border-ink/30"
                  />
                  <span className="text-ink/40">–</span>
                  <input
                    type="number"
                    min="0"
                    value={maxAreaInput}
                    onChange={(e) => setMaxAreaInput(e.target.value)}
                    onBlur={applyAreaRange}
                    placeholder="Max"
                    className="w-full rounded-xl border border-ink/10 bg-white px-3 py-2 text-sm outline-none focus:border-ink/30"
                  />
                </div>
              </div>

              <div>
                <p className="text-xs font-medium text-ink">Furnishing</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <button onClick={() => setFurnishing("")} className={chip(furnishing === "")}>
                    Any
                  </button>
                  {FURNISHING.map((f) => (
                    <button key={f} onClick={() => setFurnishing(f)} className={chip(furnishing === f)}>
                      {humanize(f)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-medium text-ink">Facing</p>
                <select
                  value={facing}
                  onChange={(e) => setFacing(e.target.value as Facing | "")}
                  className="mt-2 w-full appearance-none rounded-xl border border-ink/10 bg-white px-3 py-2.5 text-sm outline-none focus:border-ink/30"
                >
                  <option value="">Any</option>
                  {FACING.map((f) => (
                    <option key={f} value={f}>
                      {FACING_LABEL[f]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <p className="text-xs font-medium text-ink">Possession</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <button onClick={() => setPossessionStatus("")} className={chip(possessionStatus === "")}>
                    Any
                  </button>
                  {POSSESSION_STATUS.map((p) => (
                    <button
                      key={p}
                      onClick={() => setPossessionStatus(p)}
                      className={chip(possessionStatus === p)}
                    >
                      {humanize(p)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-medium text-ink">Age</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {AGE_OPTIONS.map((a) => (
                    <button
                      key={a.label}
                      onClick={() => setMaxAgeYears(a.value)}
                      className={chip(maxAgeYears === a.value)}
                    >
                      {a.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-medium text-ink">Ownership</p>
                <select
                  value={ownershipType}
                  onChange={(e) => setOwnershipType(e.target.value as OwnershipType | "")}
                  className="mt-2 w-full appearance-none rounded-xl border border-ink/10 bg-white px-3 py-2.5 text-sm outline-none focus:border-ink/30"
                >
                  <option value="">Any</option>
                  {OWNERSHIP_TYPE.map((o) => (
                    <option key={o} value={o}>
                      {humanize(o)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-3 pt-1">
                <label className="flex items-center gap-2.5 text-sm text-ink">
                  <input
                    type="checkbox"
                    checked={parking}
                    onChange={(e) => setParking(e.target.checked)}
                    className="h-4 w-4 accent-lime"
                  />
                  Has parking
                </label>
                <label className="flex items-center gap-2.5 text-sm text-ink">
                  <input
                    type="checkbox"
                    checked={eliteOnly}
                    onChange={(e) => setEliteOnly(e.target.checked)}
                    className="h-4 w-4 accent-lime"
                  />
                  ✦ Elite listings only
                </label>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-body">
            {loading ? "Searching…" : `${total} ${total === 1 ? "home" : "homes"} found`}
          </p>

          {/* Save this search */}
          <div className="relative">
            {saved ? (
              <span className="text-xs font-medium text-ink/60">✓ Search saved</span>
            ) : (
              <button
                onClick={() => setSavingOpen((o) => !o)}
                className="text-xs font-medium text-ink underline underline-offset-4 hover:text-ink/70"
              >
                ☆ Save this search
              </button>
            )}
            {savingOpen && (
              <>
                <button
                  aria-label="Close save search"
                  onClick={() => setSavingOpen(false)}
                  className="fixed inset-0 z-30 cursor-default"
                />
                <div className="absolute right-0 top-full z-40 mt-2 w-72 rounded-2xl bg-white p-4 shadow-2xl ring-1 ring-ink/10">
                  <p className="text-xs font-medium text-ink">Name this search</p>
                  <input
                    value={saveName}
                    onChange={(e) => setSaveName(e.target.value)}
                    placeholder="e.g. 3BHK in Whitefield"
                    className="mt-2 w-full rounded-xl border border-ink/10 bg-white px-3 py-2 text-sm outline-none focus:border-ink/30"
                  />
                  {saveError && <p className="mt-2 text-xs text-red-700">{saveError}</p>}
                  <button
                    onClick={saveSearch}
                    disabled={saving}
                    className="mt-3 w-full rounded-full bg-panel px-4 py-2.5 text-xs font-medium text-white disabled:opacity-60"
                  >
                    {saving ? "Saving…" : "Save & get alerts"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {error && (
        <p className="mt-8 rounded-2xl bg-red-50 px-5 py-4 text-sm text-red-700">{error}</p>
      )}

      {/* results */}
      {loading && (
        <div className="mt-10">
          <ListingGridSkeleton count={6} />
        </div>
      )}
      <AnimatePresence mode="popLayout">
        {!loading && items.length > 0 ? (
          <motion.div
            key="grid"
            layout
            className="mt-10 grid gap-x-7 gap-y-14 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
          >
            {items.map((p, i) => (
              <ListingCard key={p.id} property={p} i={i} priority={i < 3} />
            ))}
          </motion.div>
        ) : !loading && !error ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-16 flex flex-col items-center rounded-[24px] bg-cream px-8 py-16 text-center"
          >
            <span className="text-3xl">🏡</span>
            <p className="mt-4 text-lg font-medium text-ink">No homes match those filters</p>
            <p className="mt-2 max-w-xs text-sm text-body">
              Try widening the price range or clearing your search.
            </p>
            <button
              onClick={clearAll}
              className="mt-6 rounded-full bg-panel px-6 py-3 text-sm text-white"
            >
              Clear filters
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {!loading && page < totalPages && (
        <div className="mt-12 flex justify-center">
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className="rounded-full bg-panel px-6 py-3 text-sm text-white disabled:opacity-60"
          >
            {loadingMore ? "Loading…" : "Load more homes"}
          </button>
        </div>
      )}
    </section>
  );
}
