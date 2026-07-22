"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { price } from "@/lib/listings";
import { propertyHref } from "@/lib/slug";
import { badgeFor } from "@/lib/badge";
import type { Property } from "@/types/api";

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

function PlayIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M8 5v14l11-7Z" />
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

export default function ListingCard({ property, i = 0 }: { property: Property; i?: number }) {
  const cover = property.photos[0]?.url;
  const badge = badgeFor(property);

  return (
    <motion.article
      variants={rise}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.25 }}
      custom={i % 3}
      className="group"
    >
      <Link href={propertyHref(property)} className="block">
        <div className="relative aspect-[10/9] overflow-hidden rounded-[20px] bg-cream">
          {cover ? (
            <Image
              src={cover}
              alt={property.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-body">
              No photo yet
            </div>
          )}
          <span
            className={`absolute left-4 top-4 rounded-full px-4 py-1.5 text-xs font-medium shadow ${
              badge === "New" ? "bg-lime text-ink" : "bg-white text-ink"
            }`}
          >
            {badge}
          </span>
          {property.videoUrl && (
            <span className="absolute bottom-4 left-4 flex items-center gap-1.5 rounded-full bg-black/55 px-3 py-1.5 text-xs font-medium text-white backdrop-blur">
              <PlayIcon /> Video
            </span>
          )}
          <span className="absolute bottom-4 right-4 flex h-10 w-10 translate-y-3 items-center justify-center rounded-full bg-lime text-ink opacity-0 shadow-lg transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            ↗
          </span>
        </div>

        <div className="mt-4 flex items-center gap-2 text-xs text-body">
          <span className="flex items-center gap-1.5">
            <BedIcon /> {property.bhk ?? "—"} Bedrooms
          </span>
          <span className="text-ink/25">·</span>
          <span className="flex items-center gap-1.5">
            <BathIcon /> {property.bathrooms ?? "—"} Bathroom
          </span>
          <span className="text-ink/25">·</span>
          <span>{property.areaSqft.toLocaleString("en-IN")} sqft</span>
        </div>
        <div className="mt-2 flex items-baseline justify-between gap-4">
          <p className="text-lg font-medium tracking-[-0.01em] text-ink">{property.title}</p>
          <p className="shrink-0 text-lg font-semibold text-ink">{price(property.askingPrice)}</p>
        </div>
        <p className="mt-1 text-xs text-body">{property.location}</p>
      </Link>
    </motion.article>
  );
}
