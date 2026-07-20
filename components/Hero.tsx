"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Nav from "@/components/Nav";
import { LISTINGS, price } from "@/lib/listings";

const rise = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: 0.12 * i, ease: [0.25, 0.1, 0.25, 1] as const },
  }),
};

// real listings pinned onto the scene — click to peek, click through to the page
const PINS = [
  { slug: "meadow-longhouse", pos: "left-[18%] top-[58%]", delay: "0s" },
  { slug: "pinnacle-highland-park", pos: "left-[44%] top-[42%]", delay: "1.6s" },
  { slug: "gable-house", pos: "right-[22%] top-[64%]", delay: "3s" },
];

const CITIES = ["Mumbai", "Bengaluru", "Gurugram", "Pune", "Hyderabad"];

function ListingPin({
  slug,
  pos,
  delay,
}: {
  slug: string;
  pos: string;
  delay: string;
}) {
  const l = LISTINGS.find((x) => x.slug === slug)!;
  return (
    <div className={`absolute z-20 hidden md:block ${pos}`}>
      <div className="drift" style={{ animationDelay: delay }}>
        <div className="flex justify-center">
          <span className="rounded-full bg-lime px-4 py-1.5 text-sm font-medium text-ink shadow-lg">
            {price(l.price)}
          </span>
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
            href={`/listings/${l.slug}`}
            className="block overflow-hidden rounded-2xl bg-white p-2 shadow-2xl transition-transform hover:-translate-y-1"
          >
            <div className="relative h-28 overflow-hidden rounded-xl">
              <Image src={l.img} alt={l.title} fill sizes="240px" className="object-cover" />
              <span className="absolute left-2 top-2 rounded-full bg-lime px-2.5 py-1 text-[10px] font-semibold text-ink">
                {l.badge}
              </span>
            </div>
            <div className="px-2 pb-1.5 pt-2">
              <p className="truncate text-sm font-semibold text-ink">{l.title}</p>
              <p className="mt-0.5 text-xs text-body">
                {l.beds} bed · {l.baths} bath · {l.city}
              </p>
              <p className="mt-1.5 text-xs font-semibold text-ink">View home →</p>
            </div>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

export default function Hero() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [focused, setFocused] = useState(false);

  // live autocomplete over listings + cities
  const suggestions = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (query.length < 2) return { homes: [], cities: [] };
    return {
      homes: LISTINGS.filter((l) =>
        `${l.title} ${l.address} ${l.city}`.toLowerCase().includes(query)
      ).slice(0, 3),
      cities: CITIES.filter((c) => c.toLowerCase().includes(query)),
    };
  }, [q]);
  const hasSuggestions = suggestions.homes.length > 0 || suggestions.cities.length > 0;

  return (
    <section className="relative h-svh min-h-[640px] overflow-clip">
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
                {suggestions.homes.map((l) => (
                  <Link
                    key={l.slug}
                    href={`/listings/${l.slug}`}
                    className="flex items-center gap-3 rounded-2xl p-2 transition-colors hover:bg-limepale"
                  >
                    <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-xl">
                      <Image src={l.img} alt="" fill sizes="64px" className="object-cover" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-ink">{l.title}</p>
                      <p className="truncate text-xs text-body">
                        {l.city} · {price(l.price)}
                      </p>
                    </div>
                    <span className="ml-auto pr-2 text-ink/40">↗</span>
                  </Link>
                ))}
                {suggestions.cities.map((c) => (
                  <Link
                    key={c}
                    href={`/listings?q=${c}`}
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

        {/* quick city chips — instant playable searches */}
        <motion.div
          variants={rise}
          initial="hidden"
          animate="show"
          custom={4}
          className="mt-4 flex flex-wrap items-center gap-2"
        >
          <span className="text-xs text-white/60">Popular:</span>
          {CITIES.map((c) => (
            <Link
              key={c}
              href={`/listings?q=${c}`}
              className="rounded-full bg-white/15 px-3.5 py-1.5 text-xs font-medium text-white ring-1 ring-white/20 backdrop-blur transition-colors hover:bg-lime hover:text-ink hover:ring-lime"
            >
              {c}
            </Link>
          ))}
        </motion.div>
      </div>

      {/* interactive listing pins */}
      {PINS.map((p) => (
        <ListingPin key={p.slug} {...p} />
      ))}

      {/* bottom bar: stats + scroll cue */}
      <div className="absolute inset-x-0 bottom-0 z-20 flex items-end justify-between px-8 pb-7 text-white md:px-14">
        <motion.div
          variants={rise}
          initial="hidden"
          animate="show"
          custom={5}
          className="flex divide-x divide-white/25"
        >
          {[
            { n: "₹5L", l: "avg. cash back" },
            { n: "10L+", l: "listings" },
            { n: "4.9★", l: "rating" },
          ].map((s) => (
            <div key={s.l} className="px-5 first:pl-0">
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
          className="hidden md:block"
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
