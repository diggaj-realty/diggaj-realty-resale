"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Nav from "@/components/Nav";
import { price } from "@/lib/listings";
import { getProperties } from "@/lib/api/properties";
import { propertyHref } from "@/lib/slug";
import { badgeFor, isElite } from "@/lib/badge";
import GatedPrice from "@/components/listings/GatedPrice";
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

function ListingPin({
  property,
  pos,
  delay,
}: {
  property: Property;
  pos: string;
  delay: string;
}) {
  const cover = property.photos[0]?.url;
  const badge = badgeFor(property);

  return (
    <div className={`absolute z-20 hidden md:block ${pos}`}>
      <div className="drift" style={{ animationDelay: delay }}>
        <div className="flex justify-center">
          <div
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <GatedPrice property={property} variant="chip" className="text-sm font-medium text-ink shadow-lg" />
          </div>
        </div>
        <div className="mx-auto h-3 w-px bg-white/90" />

        {/* peek card — always visible */}
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, delay: 1.1, ease: [0.25, 0.1, 0.25, 1] }}
          className="mt-2 w-60"
        >
          <Link
            href={propertyHref(property)}
            className="block overflow-hidden rounded-2xl bg-white p-2 shadow-2xl transition-transform hover:-translate-y-1"
          >
            <div className="relative h-28 overflow-hidden rounded-xl bg-cream">
              {cover ? (
                <Image src={cover} alt={property.title} fill sizes="240px" className="object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs text-body">
                  No photo yet
                </div>
              )}
              <div className="absolute left-2 top-2 flex items-center gap-1.5">
                {isElite(property) && (
                  <span className="rounded-full bg-panel px-2.5 py-1 text-[10px] font-semibold text-lime ring-1 ring-lime/30">
                    ✦ Elite
                  </span>
                )}
                <span className="rounded-full bg-lime px-2.5 py-1 text-[10px] font-semibold text-ink">
                  {badge}
                </span>
              </div>
            </div>
            <div className="px-2 pb-1.5 pt-2">
              <p className="truncate text-sm font-semibold text-ink">{property.title}</p>
              <p className="mt-0.5 text-xs text-body">
                {property.bhk ?? "—"} bed · {property.bathrooms ?? "—"} bath · {property.location}
              </p>
              <p className="mt-1.5 text-xs font-semibold text-ink">View home →</p>
            </div>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

type Pin = { property: Property; pos: string; delay: string };

export default function HeroSection({
  popularCities,
  pins,
}: {
  popularCities: string[];
  pins: Pin[];
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
    <section className="relative h-svh min-h-[560px] overflow-clip sm:min-h-[640px]">
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
      <div className="relative z-20 px-8 pt-10 text-white md:px-14 md:pt-16">
        <motion.h1
          variants={rise}
          initial="hidden"
          animate="show"
          custom={1}
          className="max-w-4xl text-5xl font-medium tracking-[-0.03em] md:text-7xl"
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
          className="mt-6 max-w-md text-[15px] leading-relaxed text-white/85"
        >
          One platform from search to closing — with cash back for every
          Diggaj Realty service you use.
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
              className="min-w-0 flex-1 bg-transparent px-4 text-sm text-ink placeholder:text-ink/40 focus:outline-none"
            />
            <button type="submit" className="shrink-0 rounded-full bg-panel px-6 py-3 text-sm text-white">
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
            <span className="text-xs text-white/60">Popular:</span>
            {popularCities.map((c) => (
              <Link
                key={c}
                href={`/listings?city=${encodeURIComponent(c)}`}
                className="rounded-full bg-white/15 px-3.5 py-1.5 text-xs font-medium text-white ring-1 ring-white/20 backdrop-blur transition-colors hover:bg-lime hover:text-ink hover:ring-lime"
              >
                {c}
              </Link>
            ))}
          </motion.div>
        )}
      </div>

      {/* interactive listing pins */}
      {pins.map((p) => (
        <ListingPin key={p.property.id} property={p.property} pos={p.pos} delay={p.delay} />
      ))}

      {/* bottom bar: stats (centered) + scroll cue */}
      <div className="absolute inset-x-0 bottom-0 z-20 flex items-end px-8 pb-7 text-white md:px-14">
        <motion.div
          variants={rise}
          initial="hidden"
          animate="show"
          custom={5}
          className="absolute inset-x-0 bottom-7 flex justify-center divide-x divide-white/25"
        >
          {[
            { n: "₹5L", l: "avg. cash back" },
            { n: "10L+", l: "listings" },
            { n: "4.9★", l: "rating" },
          ].map((s) => (
            <div key={s.l} className="px-5 text-center first:pl-0">
              <p className="text-xl font-medium tracking-[-0.02em] md:text-2xl">{s.n}</p>
              <p className="mt-0.5 text-[11px] text-white/65">{s.l}</p>
            </div>
          ))}
        </motion.div>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6, duration: 0.6 }}
          onClick={() => window.scrollTo({ top: window.innerHeight, behavior: "smooth" })}
          aria-label="Scroll down"
          className="relative z-10 ml-auto hidden md:block"
        >
          <motion.span
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-ink shadow-lg backdrop-blur"
          >
            ↓
          </motion.span>
        </motion.button>
      </div>
    </section>
  );
}
