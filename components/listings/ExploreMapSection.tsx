"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { price } from "@/lib/listings";
import type { CityGroup } from "@/lib/cities";

const rise = {
  hidden: { opacity: 0, y: 28 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay: 0.07 * i, ease: [0.25, 0.1, 0.25, 1] as const },
  }),
};

// A fixed 3-column track leaves a lone card floating in two empty columns
// whenever the catalog only covers one or two cities, which reads as a broken
// layout rather than a sparse one. Match the track to what there is to show.
const GRID_BY_COUNT: Record<number, string> = {
  1: "grid-cols-1 max-w-xl",
  2: "grid-cols-1 sm:grid-cols-2 max-w-4xl",
};

export default function ExploreMapSection({ places }: { places: CityGroup[] }) {
  if (places.length === 0) return null;

  const gridCols =
    GRID_BY_COUNT[places.length] ?? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";

  return (
    <section className="bg-white px-8 py-24 md:px-14">
      {/* header */}
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.6 }}
            className="text-section font-medium tracking-[-0.02em]"
          >
            Explore homes by city
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.6, delay: 0.12 }}
            className="mt-3 max-w-sm text-lead text-body"
          >
            Browse active listings in the places buyers love most, every home
            verified and backed by a dedicated advisor.
          </motion.p>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Link
            href="/listings"
            className="inline-block rounded-full bg-panel px-6 py-3 text-sm text-white"
          >
            View all homes →
          </Link>
        </motion.div>
      </div>

      {/* city grid */}
      <div className={`mt-14 grid gap-5 ${gridCols}`}>
        {places.map((p, i) => (
          <motion.div
            key={p.city}
            variants={rise}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
            custom={i}
          >
            <Link
              href={`/listings?city=${encodeURIComponent(p.city)}`}
              className="group relative block h-72 overflow-hidden rounded-[24px]"
            >
              <Image
                src={p.img}
                alt={p.city}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.07]"
              />
              {/* readability gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />

              {/* count chip */}
              <span className="absolute right-4 top-4 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-ink backdrop-blur">
                {p.count} {p.count === 1 ? "home" : "homes"}
              </span>

              {/* label */}
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-5 text-white">
                <div>
                  <p className="text-xl font-medium tracking-[-0.01em]">{p.city}</p>
                  <p className="mt-1 text-xs text-white/75">
                    From {price(p.minPrice)}
                  </p>
                </div>
                <span className="flex h-10 w-10 shrink-0 translate-y-2 items-center justify-center rounded-full bg-lime text-ink opacity-0 shadow-lg transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                  →
                </span>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
