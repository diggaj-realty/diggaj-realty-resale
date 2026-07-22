"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { getProperties } from "@/lib/api/properties";
import type { Property } from "@/types/api";
import ListingCard from "@/components/listings/ListingCard";

const PRICE_BANDS = [
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

const chip = (active: boolean) =>
  `rounded-full px-4 py-2 text-xs font-medium transition-colors ${
    active ? "bg-panel text-white" : "bg-ink/5 text-ink/70 hover:bg-ink/10"
  }`;

export default function ListingsBrowser() {
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");
  const [debouncedQ, setDebouncedQ] = useState(q);
  const [band, setBand] = useState(0);
  const [beds, setBeds] = useState(0);

  const [items, setItems] = useState<Property[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // debounce the free-text search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q), 350);
    return () => clearTimeout(t);
  }, [q]);

  // reset to a loading state as soon as the effective filters change, during
  // render rather than inside the effect (see react.dev "adjusting state
  // when a prop changes") — the effect below only ever calls setState from
  // inside the async fetch's own callbacks.
  const filterKey = `${debouncedQ}|${band}|${beds}`;
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
      minPrice: PRICE_BANDS[band].min,
      maxPrice: PRICE_BANDS[band].max,
      minBhk: BED_OPTIONS[beds].minBhk,
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
  }, [debouncedQ, band, beds]);

  async function loadMore() {
    setLoadingMore(true);
    try {
      const res = await getProperties({
        q: debouncedQ.trim() || undefined,
        minPrice: PRICE_BANDS[band].min,
        maxPrice: PRICE_BANDS[band].max,
        minBhk: BED_OPTIONS[beds].minBhk,
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
          {PRICE_BANDS.map((b, i) => (
            <button key={b.label} onClick={() => setBand(i)} className={chip(band === i)}>
              {b.label}
            </button>
          ))}
          <span className="mx-2 h-5 w-px bg-ink/10" />
          {BED_OPTIONS.map((b, i) => (
            <button key={b.label} onClick={() => setBeds(i)} className={chip(beds === i)}>
              {b.label}
            </button>
          ))}
        </div>

        <p className="text-xs text-body">
          {loading ? "Searching…" : `${total} ${total === 1 ? "home" : "homes"} found`}
        </p>
      </div>

      {error && (
        <p className="mt-8 rounded-2xl bg-red-50 px-5 py-4 text-sm text-red-700">{error}</p>
      )}

      {/* results */}
      <AnimatePresence mode="popLayout">
        {!loading && items.length > 0 ? (
          <motion.div
            key="grid"
            layout
            className="mt-10 grid gap-x-7 gap-y-14 sm:grid-cols-2 lg:grid-cols-3"
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
              onClick={() => {
                setQ("");
                setBand(0);
                setBeds(0);
              }}
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
