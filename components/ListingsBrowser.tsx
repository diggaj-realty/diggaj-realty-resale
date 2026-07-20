"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { LISTINGS } from "@/lib/listings";
import ListingCard from "@/components/ListingCard";

const PRICE_BANDS = [
  { label: "Any price", min: 0, max: Infinity },
  { label: "Under ₹3 Cr", min: 0, max: 30000000 },
  { label: "₹3 – 6 Cr", min: 30000000, max: 60000000 },
  { label: "₹6 Cr+", min: 60000000, max: Infinity },
];

const BED_OPTIONS = ["Any beds", "3+", "4+", "5+"];

const chip = (active: boolean) =>
  `rounded-full px-4 py-2 text-xs font-medium transition-colors ${
    active ? "bg-panel text-white" : "bg-ink/5 text-ink/70 hover:bg-ink/10"
  }`;

export default function ListingsBrowser() {
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");
  const [band, setBand] = useState(0);
  const [beds, setBeds] = useState(0);

  const results = useMemo(() => {
    const query = q.trim().toLowerCase();
    const { min, max } = PRICE_BANDS[band];
    const minBeds = beds === 0 ? 0 : beds + 2;
    return LISTINGS.filter(
      (l) =>
        l.price >= min &&
        l.price < max &&
        l.beds >= minBeds &&
        (query === "" ||
          `${l.title} ${l.address} ${l.city}`.toLowerCase().includes(query))
    );
  }, [q, band, beds]);

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
          {BED_OPTIONS.map((label, i) => (
            <button key={label} onClick={() => setBeds(i)} className={chip(beds === i)}>
              {label}
            </button>
          ))}
        </div>

        <p className="text-xs text-body">
          {results.length} {results.length === 1 ? "home" : "homes"} found
        </p>
      </div>

      {/* results */}
      <AnimatePresence mode="popLayout">
        {results.length > 0 ? (
          <motion.div
            key="grid"
            layout
            className="mt-10 grid gap-x-7 gap-y-14 sm:grid-cols-2 lg:grid-cols-3"
          >
            {results.map((l, i) => (
              <ListingCard key={l.slug} listing={l} i={i} />
            ))}
          </motion.div>
        ) : (
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
        )}
      </AnimatePresence>
    </section>
  );
}
