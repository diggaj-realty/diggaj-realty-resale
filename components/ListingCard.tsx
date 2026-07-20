"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { type Listing, price } from "@/lib/listings";

export function BedIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M2 11V5a1 1 0 0 1 1-1h18a1 1 0 0 1 1 1v6" />
      <path d="M2 11h20v7" />
      <path d="M2 11v7" />
      <path d="M6 8h5v3" />
    </svg>
  );
}

export function BathIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M4 12h16a1 1 0 0 1 1 1 6 6 0 0 1-6 6H9a6 6 0 0 1-6-6 1 1 0 0 1 1-1Z" />
      <path d="M5 12V5a2 2 0 0 1 4 0" />
    </svg>
  );
}

const rise = {
  hidden: { opacity: 0, y: 28 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay: 0.08 * i, ease: [0.25, 0.1, 0.25, 1] as const },
  }),
};

export default function ListingCard({ listing: l, i = 0 }: { listing: Listing; i?: number }) {
  return (
    <motion.article
      variants={rise}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.25 }}
      custom={i % 3}
      className="group"
    >
      <Link href={`/listings/${l.slug}`} className="block">
        <div className="relative aspect-[10/9] overflow-hidden rounded-[20px]">
          <Image
            src={l.img}
            alt={l.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
          />
          <span
            className={`absolute left-4 top-4 rounded-full px-4 py-1.5 text-xs font-medium shadow ${
              l.badge === "New" ? "bg-lime text-ink" : "bg-white text-ink"
            }`}
          >
            {l.badge}
          </span>
          <span className="absolute bottom-4 right-4 flex h-10 w-10 translate-y-3 items-center justify-center rounded-full bg-lime text-ink opacity-0 shadow-lg transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            ↗
          </span>
        </div>

        <div className="mt-4 flex items-center gap-2 text-xs text-body">
          <span className="flex items-center gap-1.5">
            <BedIcon /> {l.beds} Bedrooms
          </span>
          <span className="text-ink/25">·</span>
          <span className="flex items-center gap-1.5">
            <BathIcon /> {l.baths} Bathroom
          </span>
          <span className="text-ink/25">·</span>
          <span>{l.sqft.toLocaleString()} sqft</span>
        </div>
        <div className="mt-2 flex items-baseline justify-between gap-4">
          <p className="text-lg font-medium tracking-[-0.01em] text-ink">{l.title}</p>
          <p className="shrink-0 text-lg font-semibold text-ink">{price(l.price)}</p>
        </div>
        <p className="mt-1 text-xs text-body">
          {l.address}, {l.city}
        </p>
      </Link>
    </motion.article>
  );
}
