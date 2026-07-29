"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Nav from "@/components/Nav";
import EliteStripSection from "@/components/listings/EliteStripSection";
import { price } from "@/lib/listings";
import { getProperties } from "@/lib/api/properties";
import { propertyHref } from "@/lib/slug";
import { isElite } from "@/lib/badge";
import { useAuth } from "@/lib/auth/AuthContext";
import type { Property } from "@/types/api";

const rise = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: 0.12 * i, ease: [0.25, 0.1, 0.25, 1] as const },
  }),
};

export default function HeroSection({
  popularCities,
  eliteHomes,
}: {
  popularCities: string[];
  eliteHomes: Property[];
}) {
  const router = useRouter();
  const { user } = useAuth();
  const [q, setQ] = useState("");
  const [focused, setFocused] = useState(false);

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

      {/* click-away layer for suggestions */}
      {focused && hasSuggestions && (
        <button
          aria-label="Close suggestions"
          onClick={() => setFocused(false)}
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
          One platform from search to closing, with a dedicated agent for every
          home you buy through Diggaj Realty.
        </motion.p>

        {/* working search with live autocomplete */}
        <motion.div variants={rise} initial="hidden" animate="show" custom={3} className="relative mt-7 max-w-md">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              router.push(q.trim() ? `/listings?q=${encodeURIComponent(q.trim())}` : "/listings");
            }}
            className="flex w-full items-center rounded-full bg-white/95 p-1.5 shadow-2xl backdrop-blur transition-shadow focus-within:ring-2 focus-within:ring-lime"
          >
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onFocus={() => setFocused(true)}
              placeholder="Search city, address, or home…"
              className="min-w-0 flex-1 bg-transparent px-4 text-base text-ink placeholder:text-ink/40 focus:outline-none"
            />
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
                        <Image src={p.photos[0].url} alt="" fill sizes="64px" className="object-cover" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-ink">{p.title}</p>
                      <p className="truncate text-xs text-body">
                        {p.location} ·{" "}
                        {isElite(p) && !user ? (
                          <span className="select-none tracking-widest" aria-hidden>
                            ₹ •• •• •••
                          </span>
                        ) : (
                          price(p.askingPrice)
                        )}
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
