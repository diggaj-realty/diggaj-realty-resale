"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { price } from "@/lib/listings";
import { propertyHref } from "@/lib/slug";
import { badgeFor, isElite } from "@/lib/badge";
import { useAuth } from "@/lib/auth/AuthContext";
import GatedPrice from "@/components/listings/GatedPrice";
import type { Furnishing, OwnershipType, PossessionStatus, Property } from "@/types/api";

const FURNISHING_LABEL: Record<Furnishing, string> = {
  UNFURNISHED: "Unfurnished",
  SEMI_FURNISHED: "Semi furnished",
  FULLY_FURNISHED: "Fully furnished",
};

const OWNERSHIP_LABEL: Record<OwnershipType, string> = {
  FREEHOLD: "Freehold",
  LEASEHOLD: "Leasehold",
  POWER_OF_ATTORNEY: "Power of attorney",
  CO_OPERATIVE: "Co-operative",
};

const POSSESSION_LABEL: Record<PossessionStatus, string> = {
  READY_TO_MOVE: "Ready to move",
  UNDER_CONSTRUCTION: "Under construction",
};

const POSSESSION_TONE: Record<PossessionStatus, string> = {
  READY_TO_MOVE: "bg-limepale text-ink ring-lime/40",
  UNDER_CONSTRUCTION: "bg-amber-100 text-amber-900 ring-amber-200",
};

function BedIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M2 11V5a1 1 0 0 1 1-1h18a1 1 0 0 1 1 1v6" />
      <path d="M2 11h20v7" />
      <path d="M2 11v7" />
      <path d="M6 8h5v3" />
    </svg>
  );
}

function BathIcon() {
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

export default function ListingCard({
  property,
  i = 0,
  priority = false,
}: {
  property: Property;
  i?: number;
  /** Only the primary above-the-fold browse grid's first row should set
   *  this — secondary/below-the-fold sections (similar properties, homepage
   *  showcases) should stay lazy so they don't compete with the real LCP image. */
  priority?: boolean;
}) {
  const { user } = useAuth();
  const cover = property.photos[0]?.url;
  const badge = badgeFor(property);
  const elite = isElite(property);
  const priceVisible = !elite || !!user;
  const perSqft = property.areaSqft > 0 ? Math.round(property.askingPrice / property.areaSqft) : 0;
  const chips = (property.amenities ?? []).slice(0, 2);
  const hasParking = (property.parkingCovered ?? 0) + (property.parkingOpen ?? 0) > 0;
  const ageLabel =
    property.ageYears == null
      ? null
      : property.ageYears === 0
        ? "New construction"
        : `${property.ageYears} yr${property.ageYears === 1 ? "" : "s"} old`;
  const factTags = [
    property.furnishing ? FURNISHING_LABEL[property.furnishing] : null,
    property.facing ? `Facing ${property.facing}` : null,
    ageLabel,
    hasParking ? "Parking" : null,
    property.ownershipType ? OWNERSHIP_LABEL[property.ownershipType] : null,
  ].filter((t): t is string => !!t);

  return (
    <motion.article
      variants={rise}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.25 }}
      custom={i % 3}
      className="group min-w-0"
    >
      <Link href={propertyHref(property)} className="block min-w-0">
        <div className="relative aspect-[10/9] overflow-hidden rounded-[20px] bg-cream">
          {cover ? (
            <Image
              src={cover}
              alt={property.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              priority={priority}
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-body">
              No photo yet
            </div>
          )}
          <div className="absolute left-4 right-4 top-4 flex flex-wrap items-center gap-2">
            {elite && (
              <span className="flex items-center gap-1 rounded-full bg-panel px-3 py-1.5 text-xs font-semibold text-lime shadow ring-1 ring-lime/30">
                ✦ Elite
              </span>
            )}
            {property.possessionStatus && (
              <span
                className={`rounded-full px-3 py-1.5 text-xs font-medium shadow ring-1 ${POSSESSION_TONE[property.possessionStatus]}`}
              >
                {POSSESSION_LABEL[property.possessionStatus]}
              </span>
            )}
            <span
              className={`rounded-full px-4 py-1.5 text-xs font-medium shadow ${
                badge === "New" ? "bg-lime text-ink" : "bg-white text-ink"
              }`}
            >
              {badge}
            </span>
          </div>
          {property.videoUrl && (
            <span className="absolute bottom-4 left-4 flex items-center gap-1.5 rounded-full bg-black/55 px-3 py-1.5 text-xs font-medium text-white backdrop-blur">
              <PlayIcon /> Video
            </span>
          )}
          <span className="absolute bottom-4 right-4 flex h-10 w-10 translate-y-3 items-center justify-center rounded-full bg-lime text-ink opacity-0 shadow-lg transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            ↗
          </span>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-body">
          <span className="flex items-center gap-1.5">
            <BedIcon /> {property.bhk ?? "—"} BHK
          </span>
          <span className="text-ink/25">·</span>
          <span className="flex items-center gap-1.5">
            <BathIcon /> {property.bathrooms ?? "—"} Bath
          </span>
          <span className="text-ink/25">·</span>
          <span>{property.areaSqft.toLocaleString("en-IN")} sqft</span>
          {priceVisible && perSqft > 0 && (
            <>
              <span className="text-ink/25">·</span>
              <span>{price(perSqft)}/sqft</span>
            </>
          )}
        </div>
        <div className="mt-2 flex items-baseline justify-between gap-4">
          <p className="min-w-0 truncate text-lg font-medium tracking-[-0.01em] text-ink">{property.title}</p>
          <div
            className="shrink-0 text-right"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <GatedPrice property={property} className="text-lg font-semibold text-ink" />
          </div>
        </div>
        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-body">{property.location}</p>

        {factTags.length > 0 && (
          <p className="mt-1.5 truncate text-xs text-body">{factTags.join(" · ")}</p>
        )}

        {/* trust + amenity chips */}
        {(property.reraId || property.verifiedAt || chips.length > 0) && (
          <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
            {property.verifiedAt && (
              <span className="rounded-full bg-limepale px-2.5 py-1 text-[11px] font-medium text-ink">
                ✓ Verified
              </span>
            )}
            {property.reraId && (
              <span className="rounded-full bg-ink/5 px-2.5 py-1 text-[11px] font-medium text-ink/70">
                ✓ RERA
              </span>
            )}
            {chips.map((a) => (
              <span key={a} className="rounded-full bg-ink/5 px-2.5 py-1 text-[11px] text-ink/70">
                {a}
              </span>
            ))}
          </div>
        )}

      </Link>
    </motion.article>
  );
}
