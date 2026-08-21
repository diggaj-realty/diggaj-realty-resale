"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Nav from "@/components/Nav";
import EliteStripSection from "@/components/listings/EliteStripSection";
import { getProperties } from "@/lib/api/properties";
import { propertyHref } from "@/lib/slug";
import { supabaseThumb, isSupabasePublic } from "@/lib/image";
import { buildFilterQueryString } from "@/lib/filters";
import { CANONICAL_CITIES } from "@/lib/cities";
import type { Property } from "@/types/api";

const rise = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: 0.12 * i, ease: [0.25, 0.1, 0.25, 1] as const },
  }),
};

// Compact quick-filters for the hero — a subset of the full listings filters,
// enough to pre-narrow before landing on /listings (where the rest live).
const HERO_BEDS = [
  { label: "Any beds", minBhk: undefined as number | undefined },
  { label: "3+", minBhk: 3 },
  { label: "4+", minBhk: 4 },
  { label: "5+", minBhk: 5 },
];
const HERO_PRICE = [
  { label: "Any price", min: undefined as number | undefined, max: undefined as number | undefined },
  { label: "Under ₹3 Cr", min: undefined, max: 30000000 },
  { label: "₹3 – 6 Cr", min: 30000000, max: 60000000 },
  { label: "₹6 Cr+", min: 60000000, max: undefined },
];

export default function HeroSection({
  popularCities,
  eliteHomes,
}: {
  popularCities: string[];
  eliteHomes: Property[];
}) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [focused, setFocused] = useState(false);

  // Quick-filter popover (the circular button next to Search)
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [city, setCity] = useState("");
  const [bedsIdx, setBedsIdx] = useState(0);
  const [priceIdx, setPriceIdx] = useState(0);
  const activeFilterCount =
    (city ? 1 : 0) + (bedsIdx > 0 ? 1 : 0) + (priceIdx > 0 ? 1 : 0);

  // Everything the hero can set → the same /listings query the full browser
  // reads on load, so the landing page opens pre-filtered.
  function runSearch() {
    const price = HERO_PRICE[priceIdx];
    const qs = buildFilterQueryString({
      q: q.trim() || undefined,
      city: city || undefined,
      minBhk: HERO_BEDS[bedsIdx].minBhk,
      minPrice: price.min,
      maxPrice: price.max,
    });
    router.push(qs ? `/listings?${qs}` : "/listings");
  }

  const query = q.trim().toLowerCase();

  // city chips are real cities with live listings — instant, no network needed
  const cities = useMemo(
    () => (query.length < 2 ? [] : popularCities.filter((c) => c.toLowerCase().includes(query))),
    [query, popularCities]
  );

  // debounce the free-text query before hitting the real search API
  const [debouncedQ, setDebouncedQ] = useState(q);
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q), 300);
    return () => clearTimeout(t);
  }, [q]);

  const [homeResults, setHomeResults] = useState<Property[]>([]);
  useEffect(() => {
    const debouncedQuery = debouncedQ.trim();
    if (debouncedQuery.length < 2) return;
    const controller = new AbortController();
    getProperties({ q: debouncedQuery, pageSize: 3 }, { cache: "no-store" })
      .then((res) => {
        if (!controller.signal.aborted) setHomeResults(res.items);
      })
      .catch(() => {
        if (!controller.signal.aborted) setHomeResults([]);
      });
    return () => controller.abort();
  }, [debouncedQ]);

  // render-time guard so stale results from a longer query don't linger once
  // the box is cleared/shortened below the search threshold
  const homes = query.length < 2 ? [] : homeResults;
  const hasSuggestions = homes.length > 0 || cities.length > 0;

  return (
    // min-h only (not a fixed h-svh) so a section shorter than its content —
    // e.g. the elite strip pushing past a short/landscape viewport — grows to
    // fit instead of getting cropped by overflow-clip.
    <section className="relative min-h-[560px] overflow-clip md:min-h-[max(560px,100svh)]">
      {/* full-bleed house with slow Ken Burns drift */}
      <motion.div
        initial={{ scale: 1 }}
        animate={{ scale: 1.08 }}
        transition={{ duration: 24, ease: "linear", repeat: Infinity, repeatType: "reverse" }}
        className="absolute inset-0 will-change-transform motion-reduce:animate-none"
      >
        <Image
          src="/img/hero-house.jpg"
          alt="Modern black house on a meadow"
          fill
          priority
          sizes="100vw"
          quality={82}
          className="object-cover object-[center_70%]"
        />
      </motion.div>
      {/* legibility gradients */}
      <div className="absolute inset-x-0 top-0 h-2/5 bg-gradient-to-b from-black/60 via-black/25 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/55 to-transparent" />

      {/* nav (white text works over the dark gradient) */}
      <motion.div
        variants={rise}
        initial="hidden"
        animate="show"
        custom={0}
        className="relative z-30 [&_a:first-child]:text-white"
      >
        <Nav />
      </motion.div>

      {/* click-away layer for suggestions and the quick-filter popover */}
      {((focused && hasSuggestions) || filtersOpen) && (
        <button
          aria-label="Close"
          onClick={() => {
            setFocused(false);
            setFiltersOpen(false);
          }}
          className="absolute inset-0 z-10 cursor-default"
        />
      )}

      {/* copy */}
      <div className="relative z-30 px-8 pt-10 text-white md:px-14 md:pt-16 lg:px-16 2xl:px-24">
        <motion.h1
          variants={rise}
          initial="hidden"
          animate="show"
          custom={1}
          // em-based rather than a fixed 4xl/896px: the measure has to grow with
          // the now-fluid font size, or the headline starts wrapping on wide
          // screens purely because the cap stopped matching the type.
          className="max-w-[16em] text-hero font-medium tracking-[-0.03em]"
        >
          Your Home &amp;{" "}
          <span className="relative inline-block">
            Savings
            <motion.span
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.7, delay: 0.9, ease: [0.25, 0.1, 0.25, 1] }}
              className="absolute -bottom-1 left-0 h-[0.08em] w-full origin-left rounded-full bg-lime md:-bottom-2"
            />
          </span>
        </motion.h1>
        <motion.p
          variants={rise}
          initial="hidden"
          animate="show"
          custom={2}
          className="mt-6 max-w-lg text-lg text-white/85 md:text-xl"
        >
          One platform from search to closing, with a dedicated advisor for every
          home you buy through Diggaj Realty.
        </motion.p>

        {/* working search with live autocomplete */}
        <motion.div variants={rise} initial="hidden" animate="show" custom={3} className="relative mt-7 max-w-2xl">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              runSearch();
            }}
            className="flex w-full items-center gap-1.5 rounded-full bg-white/95 p-1.5 shadow-2xl backdrop-blur transition-shadow focus-within:ring-2 focus-within:ring-lime"
          >
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onFocus={() => setFocused(true)}
              placeholder="Search city, address, or home…"
              className="min-w-0 flex-1 bg-transparent px-4 text-base text-ink placeholder:text-ink/40 focus:outline-none"
            />
            {/* circular quick-filter toggle */}
            <button
              type="button"
              onClick={() => {
                setFiltersOpen((o) => !o);
                setFocused(false);
              }}
              aria-label="Filters"
              aria-expanded={filtersOpen}
              className={`relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-colors ${
                filtersOpen || activeFilterCount > 0
                  ? "bg-panel text-lime"
                  : "bg-ink/5 text-ink/70 hover:bg-ink/10"
              }`}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <line x1="4" y1="6" x2="20" y2="6" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="18" x2="20" y2="18" />
                <circle cx="9" cy="6" r="2" fill="currentColor" />
                <circle cx="15" cy="12" r="2" fill="currentColor" />
                <circle cx="9" cy="18" r="2" fill="currentColor" />
              </svg>
              {activeFilterCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-lime text-[10px] font-semibold text-ink ring-2 ring-white">
                  {activeFilterCount}
                </span>
              )}
            </button>
            <button type="submit" className="shrink-0 rounded-full bg-panel px-6 py-3.5 text-base text-white">
              Search
            </button>
          </form>

          {/* suggestions dropdown */}
          <AnimatePresence>
            {focused && hasSuggestions && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-x-0 top-full z-30 mt-2 overflow-hidden rounded-3xl bg-white p-2 shadow-2xl"
              >
                {homes.map((p) => (
                  <Link
                    key={p.id}
                    href={propertyHref(p)}
                    className="flex items-center gap-3 rounded-2xl p-2 transition-colors hover:bg-limepale"
                  >
                    <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-xl bg-cream">
                      {p.photos[0]?.url && (
                        // Serve a pre-sized ~3KB thumbnail directly from
                        // Supabase's CDN (unoptimized) instead of routing every
                        // keystroke-swapped image through Next's on-demand
                        // optimizer, which stalls the dropdown thumbnails in dev.
                        // Eager (not lazy) since it's already in view when shown.
                        <Image
                          src={supabaseThumb(p.photos[0].url, 128)}
                          alt=""
                          fill
                          sizes="64px"
                          loading="eager"
                          unoptimized={isSupabasePublic(p.photos[0].url)}
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-ink">{p.title}</p>
                      {/* Deliberately no price here — the hero suggestion shows
                          location + specs only; price is revealed on the detail
                          page (gated via GatedPrice for Elite/logged-out). */}
                      <p className="truncate text-xs text-body">
                        {[
                          p.location,
                          p.bhk != null ? `${p.bhk} BHK` : null,
                          p.areaSqft > 0 ? `${p.areaSqft.toLocaleString("en-IN")} sqft` : null,
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    </div>
                    <span className="ml-auto pr-2 text-ink/40">↗</span>
                  </Link>
                ))}
                {cities.map((c) => (
                  <Link
                    key={c}
                    href={`/listings?city=${encodeURIComponent(c)}`}
                    className="flex items-center gap-3 rounded-2xl p-2 px-3 transition-colors hover:bg-limepale"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ink/5 text-xs">📍</span>
                    <p className="text-sm text-ink">
                      Homes in <span className="font-medium">{c}</span>
                    </p>
                  </Link>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* quick-filter popover (from the circular filter button) */}
          <AnimatePresence>
            {filtersOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-x-0 top-full z-40 mt-2 rounded-3xl bg-white p-4 text-ink shadow-2xl"
              >
                <div className="flex flex-col gap-4">
                  <div>
                    <p className="text-xs font-medium text-ink">City</p>
                    <select
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="mt-2 w-full appearance-none rounded-xl border border-ink/10 bg-white px-3 py-2.5 text-sm outline-none focus:border-ink/30"
                    >
                      <option value="">Any city</option>
                      {CANONICAL_CITIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-ink">Bedrooms</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {HERO_BEDS.map((b, i) => (
                        <button
                          key={b.label}
                          type="button"
                          onClick={() => setBedsIdx(i)}
                          className={`rounded-full px-4 py-2 text-xs font-medium transition-colors ${
                            bedsIdx === i ? "bg-panel text-white" : "bg-ink/5 text-ink/70 hover:bg-ink/10"
                          }`}
                        >
                          {b.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-ink">Price</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {HERO_PRICE.map((p, i) => (
                        <button
                          key={p.label}
                          type="button"
                          onClick={() => setPriceIdx(i)}
                          className={`rounded-full px-4 py-2 text-xs font-medium transition-colors ${
                            priceIdx === i ? "bg-panel text-white" : "bg-ink/5 text-ink/70 hover:bg-ink/10"
                          }`}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setCity("");
                        setBedsIdx(0);
                        setPriceIdx(0);
                      }}
                      className="text-xs font-medium text-ink/50 hover:text-ink"
                    >
                      Clear
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setFiltersOpen(false);
                        runSearch();
                      }}
                      className="rounded-full bg-lime px-5 py-2.5 text-sm font-semibold text-ink transition-transform hover:-translate-y-px"
                    >
                      Show homes →
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* quick city chips — real cities with live listings right now */}
        {popularCities.length > 0 && (
          <motion.div
            variants={rise}
            initial="hidden"
            animate="show"
            custom={4}
            className="mt-4 flex flex-wrap items-center gap-2"
          >
            <span className="text-sm text-white/60">Popular:</span>
            {popularCities.map((c) => (
              <Link
                key={c}
                href={`/listings?city=${encodeURIComponent(c)}`}
                className="rounded-full bg-white/15 px-4 py-2 text-sm font-medium text-white ring-1 ring-white/20 backdrop-blur transition-colors hover:bg-lime hover:text-ink hover:ring-lime"
              >
                {c}
              </Link>
            ))}
          </motion.div>
        )}
      </div>

      {/* elite properties — stacked in the hero, full width, below the search/chips */}
      {eliteHomes.length > 0 && (
        <motion.div
          variants={rise}
          initial="hidden"
          animate="show"
          custom={5}
          className="relative z-20 mt-6 px-8 pb-8 md:px-14 md:pb-10 lg:px-16 2xl:px-24"
        >
          <EliteStripSection homes={eliteHomes} />
        </motion.div>
      )}
    </section>
  );
}
