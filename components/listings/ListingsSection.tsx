"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import ListingCard from "@/components/listings/ListingCard";
import type { Property } from "@/types/api";

const rise = {
  hidden: { opacity: 0, y: 28 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay: 0.08 * i, ease: [0.25, 0.1, 0.25, 1] as const },
  }),
};

export default function ListingsSection({
  items,
  title = "Featured Listings",
  subtitle = "Hand-picked homes on the market right now, every one verified and agent-supported.",
}: {
  items: Property[];
  title?: string;
  subtitle?: string;
}) {
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
            className="text-section font-medium tracking-[-0.02em]"
          >
            {title}
          </motion.h2>
          <motion.p
            variants={rise}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.6 }}
            custom={1}
            className="mt-3 max-w-sm text-lead text-body"
          >
            {subtitle}
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
      <div className="mt-14 grid gap-x-7 gap-y-14 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((p, i) => (
          <ListingCard key={p.id} property={p} i={i} />
        ))}
      </div>
    </section>
  );
}
