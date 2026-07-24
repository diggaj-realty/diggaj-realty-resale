"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { getProperties } from "@/lib/api/properties";
import { CANONICAL_CITIES } from "@/lib/cities";
import { price } from "@/lib/listings";
import type { Property, PropertyType } from "@/types/api";
import ListingCard from "@/components/listings/ListingCard";
import { ListingGridSkeleton } from "@/components/Skeleton";

const TYPE_OPTIONS: { label: string; value: "" | PropertyType }[] = [
  { label: "All types", value: "" },
  { label: "Residential", value: "RESIDENTIAL" },
  { label: "Plot", value: "PLOT" },
  { label: "Commercial", value: "COMMERCIAL" },
];

// Property types that never carry a BHK — the beds filter is meaningless here.
const TYPES_WITHOUT_BHK: PropertyType[] = ["PLOT", "COMMERCIAL"];

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

const PAGE_SIZE = 9;
const CR = 10000000; // one crore in rupees — custom range inputs are entered in ₹ Cr

const chip = (active: boolean) =>
  `rounded-full px-4 py-2 text-xs font-medium transition-colors ${
    active ? "bg-panel text-white" : "bg-ink/5 text-ink/70 hover:bg-ink/10"
  }`;

function priceLabel(min?: number, max?: number): string {
  if (min == null && max == null) return "Any price";
  if (min != null && max != null) return `${price(min)} – ${price(max)}`;
  if (min != null) return `From ${price(min)}`;
  return `Up to ${price(max!)}`;
}

export default function ListingsBrowser() {
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");
  const [debouncedQ, setDebouncedQ] = useState(q);
  const [type, setType] = useState<"" | PropertyType>("");
  const [minPrice, setMinPrice] = useState<number | undefined>(undefined);
  const [maxPrice, setMaxPrice] = useState<number | undefined>(undefined);
  const [beds, setBeds] = useState(0);
  const [city, setCity] = useState(params.get("city") ?? "");

  const [priceOpen, setPriceOpen] = useState(false);
  const [minInput, setMinInput] = useState("");
  const [maxInput, setMaxInput] = useState("");

  const [items, setItems] = useState<Property[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const bedsDisabled = type !== "" && TYPES_WITHOUT_BHK.includes(type);
  const effectiveBeds = bedsDisabled ? 0 : beds;

  // debounce the free-text search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q), 350);
    return () => clearTimeout(t);
  }, [q]);

  // reset to a loading state as soon as the effective filters change, during
  // render rather than inside the effect (see react.dev "adjusting state
  // when a prop changes").
  const filterKey = `${debouncedQ}|${type}|${minPrice}|${maxPrice}|${effectiveBeds}|${city}`;
  const [lastFilterKey, setLastFilterKey] = useState(filterKey);
  if (lastFilterKey !== filterKey) {
    setLastFilterKey(filterKey);
    setLoading(true);
    setError(null);
  }

  // refetch page 1 whenever the effective filters change
  useEffect(() => {
    const controller = new AbortController();
    getProperties({
      q: debouncedQ.trim() || undefined,
      type: type || undefined,
      city: city || undefined,
      minPrice,
      maxPrice,
      minBhk: BED_OPTIONS[effectiveBeds].minBhk,
      page: 1,
      pageSize: PAGE_SIZE,
    })
      .then((res) => {
        if (controller.signal.aborted) return;
        setItems(res.items);
        setTotal(res.total);
        setPage(res.page);
        setTotalPages(res.totalPages);
        setLoading(false);
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        setError(err instanceof Error ? err.message : "Failed to load listings");
        setLoading(false);
      });
    return () => controller.abort();
  }, [debouncedQ, type, minPrice, maxPrice, effectiveBeds, city]);

  async function loadMore() {
    setLoadingMore(true);
    try {
      const res = await getProperties({
        q: debouncedQ.trim() || undefined,
        type: type || undefined,
        city: city || undefined,
        minPrice,
        maxPrice,
        minBhk: BED_OPTIONS[effectiveBeds].minBhk,
        page: page + 1,
        pageSize: PAGE_SIZE,
      });
      setItems((prev) => [...prev, ...res.items]);
      setPage(res.page);
      setTotalPages(res.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load more listings");
    } finally {
      setLoadingMore(false);
    }
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

  const priceActive = minPrice != null || maxPrice != null;
  const anyFilterActive =
    q.trim() !== "" || type !== "" || priceActive || beds !== 0 || city !== "";

  function clearAll() {
    setQ("");
    setType("");
    applyPreset(undefined, undefined);
    setBeds(0);
    setCity("");
  }

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

        <div className="flex flex-wrap items-center gap-2">
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

          {/* property type */}
          {TYPE_OPTIONS.map((t) => (
            <button
              key={t.value}
              onClick={() => setType(t.value)}
              className={chip(type === t.value)}
            >
              {t.label}
            </button>
          ))}

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

          {/* beds — hidden for Plot / Commercial */}
          {!bedsDisabled && (
            <>
              <span className="mx-1 h-5 w-px bg-ink/10" />
              {BED_OPTIONS.map((b, i) => (
                <button key={b.label} onClick={() => setBeds(i)} className={chip(beds === i)}>
                  {b.label}
                </button>
              ))}
            </>
          )}

          {anyFilterActive && (
            <button
              onClick={clearAll}
              className="ml-1 rounded-full px-3 py-2 text-xs font-medium text-ink/50 underline underline-offset-4 hover:text-ink"
            >
              Clear all
            </button>
          )}
        </div>

        <p className="text-xs text-body">
          {loading ? "Searching…" : `${total} ${total === 1 ? "home" : "homes"} found`}
        </p>
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
              <ListingCard key={p.id} property={p} i={i} />
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
