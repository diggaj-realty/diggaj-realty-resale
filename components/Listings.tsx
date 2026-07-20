"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { LISTINGS } from "@/lib/listings";
import ListingCard from "@/components/ListingCard";

const rise = {
  hidden: { opacity: 0, y: 28 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay: 0.08 * i, ease: [0.25, 0.1, 0.25, 1] as const },
  }),
};

export default function Listings() {
  return (
    <section className="bg-white px-8 py-24 md:px-14">
      {/* header */}
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <motion.h2
            variants={rise}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.6 }}
            custom={0}
            className="text-4xl font-medium tracking-[-0.02em] md:text-5xl"
          >
            Featured Listings
          </motion.h2>
          <motion.p
            variants={rise}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.6 }}
            custom={1}
            className="mt-3 max-w-sm text-sm text-body"
          >
            Hand-picked homes on the market right now — every one eligible for
            commission cash back.
          </motion.p>
        </div>
        <motion.div
          variants={rise}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.6 }}
          custom={2}
        >
          <Link
            href="/listings"
            className="inline-block w-fit rounded-full bg-panel px-6 py-3 text-sm text-white"
          >
            View all homes →
          </Link>
        </motion.div>
      </div>

      {/* grid */}
      <div className="mt-14 grid gap-x-7 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
        {LISTINGS.map((l, i) => (
          <ListingCard key={l.slug} listing={l} i={i} />
        ))}
      </div>
    </section>
  );
}
