import { cache } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import LeadForm from "@/components/LeadForm";
import ListingCard from "@/components/listings/ListingCard";
import Gallery from "@/components/listings/Gallery";
import GatedPrice, { PriceUnlocked, PriceLocked } from "@/components/listings/GatedPrice";
import ShortlistButton from "@/components/listings/ShortlistButton";
import EmiCalculator from "@/components/listings/EmiCalculator";
import ProjectInfo from "@/components/listings/ProjectInfo";
import LocalityIntel from "@/components/listings/LocalityIntel";
import PropertyMap from "@/components/listings/PropertyMap";
import { getProperties, getProperty } from "@/lib/api/properties";
import { parsePropertyId, slugify } from "@/lib/slug";
import { price } from "@/lib/listings";
import { badgeFor, isElite } from "@/lib/badge";
import { buildSpecs, sqft } from "@/lib/property";
import { ApiError } from "@/lib/api/client";
import type { Property } from "@/types/api";

// Prerender all current listings as static HTML at build time; new ones still
// render on-demand (dynamicParams defaults to true) and are then ISR-cached.
export async function generateStaticParams() {
  try {
    const { items } = await getProperties({ pageSize: 100 }, { revalidate: 120 });
    return items.map((p) => ({ slug: `${slugify(p.title)}--${p.id}` }));
  } catch {
    return [];
  }
}

// Wrapped in cache() so generateMetadata + the page component share one fetch.
const loadProperty = cache(async (slug: string): Promise<Property | null> => {
  const id = parsePropertyId(slug);
  if (!id) return null;
  try {
    return await getProperty(id, { revalidate: 120 });
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  }
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const l = await loadProperty((await params).slug);
  if (!l) return {};
  return {
    title: `${l.title} — ${price(l.askingPrice)} | Diggaj Realty`,
    description: l.description,
  };
}

const BedIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M2 11V5a1 1 0 0 1 1-1h18a1 1 0 0 1 1 1v6" /><path d="M2 11h20v7" /><path d="M2 11v7" /><path d="M6 8h5v3" />
  </svg>
);
const BathIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M4 12h16a1 1 0 0 1 1 1 6 6 0 0 1-6 6H9a6 6 0 0 1-6-6 1 1 0 0 1 1-1Z" /><path d="M5 12V5a2 2 0 0 1 4 0" />
  </svg>
);
const AreaIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M3 3h18v18H3z" /><path d="M9 3v18" /><path d="M3 9h18" />
  </svg>
);
const TagIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M20.59 13.41 12 22l-9-9V3h10l7.59 7.59a2 2 0 0 1 0 2.82Z" /><circle cx="7.5" cy="7.5" r="1.5" />
  </svg>
);

export default async function ListingDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const l = await loadProperty((await params).slug);
  if (!l) notFound();

  const badge = badgeFor(l);
  const photos = [...l.photos].sort((a, b) => a.order - b.order);
  const amenities = l.amenities ?? [];
  const specs = buildSpecs(l);

  const cashBack = Math.round((l.askingPrice * 0.03 * 0.75) / 100) * 100;
  const perSqft = Math.round(l.askingPrice / l.areaSqft);

  const { items: othersRaw } = await getProperties({ pageSize: 4 }, { revalidate: 120 });
  const others = othersRaw.filter((x) => x.id !== l.id).slice(0, 3);

  const stats = [
    { icon: <BedIcon />, label: "Bedrooms", value: l.bhk != null ? `${l.bhk} BHK` : "—" },
    {
      icon: <BathIcon />,
      label: "Bathrooms",
      value: l.bathrooms != null ? `${l.bathrooms} bath` : "—",
    },
    { icon: <AreaIcon />, label: "Area", value: sqft(l.areaSqft) },
    { icon: <TagIcon />, label: "Per sq. ft.", value: `${price(perSqft)}/sq ft` },
  ];

  return (
    <main className="min-h-screen overflow-x-clip bg-white">
      <div className="bg-cream pb-8">
        <Nav />
        <div className="px-8 pt-10 md:px-14">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs font-medium text-ink/40">
            <Link href="/" className="hover:text-ink">Home</Link>
            <span aria-hidden>/</span>
            <Link href="/listings" className="hover:text-ink">Listings</Link>
            <span aria-hidden>/</span>
            <span className="max-w-[45vw] truncate text-ink/70 md:max-w-xs">{l.title}</span>
          </nav>
          <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                {isElite(l) && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-panel px-4 py-1.5 text-xs font-semibold text-lime shadow-sm ring-1 ring-lime/30">
                    ✦ Elite
                  </span>
                )}
                <span
                  className={`inline-block rounded-full px-4 py-1.5 text-xs font-medium shadow-sm ${
                    badge === "New" ? "bg-lime text-ink" : "bg-white text-ink"
                  }`}
                >
                  {badge}
                </span>
                {l.verifiedAt && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-white px-3.5 py-1.5 text-xs font-medium text-ink shadow-sm">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                      <path d="M12 2 4 5v6c0 5 3.4 8.5 8 11 4.6-2.5 8-6 8-11V5l-8-3Z" /><path d="m9 12 2 2 4-4" />
                    </svg>
                    Verified
                  </span>
                )}
              </div>
              <h1 className="mt-4 max-w-2xl text-4xl font-medium tracking-[-0.03em] text-ink md:text-6xl">
                {l.title}
              </h1>
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-ink/60">
                <span className="flex items-center gap-1.5">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" />
                  </svg>
                  {l.location}
                </span>
                {l.viewCount > 0 && (
                  <span className="flex items-center gap-1.5">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
                      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" />
                    </svg>
                    {l.viewCount.toLocaleString("en-IN")} views
                  </span>
                )}
                {l.unitsAvailable != null && l.unitsAvailable > 1 && (
                  <span className="flex items-center gap-1.5">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
                      <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
                    </svg>
                    {l.unitsAvailable} units available
                  </span>
                )}
              </div>
            </div>
            <div className="flex flex-col items-start md:items-end">
              <GatedPrice
                property={l}
                variant="hero"
                className="text-4xl font-medium tracking-[-0.02em] text-ink md:text-5xl"
              />
              <PriceUnlocked property={l}>
                <p className="mt-2 inline-block rounded-full bg-lime px-4 py-1.5 text-xs font-semibold text-ink">
                  ⌂ Est. {price(cashBack)} cash back
                </p>
              </PriceUnlocked>
              <div className="mt-4">
                <ShortlistButton propertyId={l.id} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* gallery */}
      <Gallery photos={photos} title={l.title} />

      {/* video tour */}
      {l.videoUrl && (
        <div className="px-3 pt-3">
          <div className="relative overflow-hidden rounded-[24px] bg-black">
            <span className="absolute left-4 top-4 z-10 rounded-full bg-black/55 px-3.5 py-1.5 text-xs font-medium text-white backdrop-blur">
              ▶ Video tour
            </span>
            <video
              controls
              poster={photos[0]?.url}
              className="aspect-video w-full"
            >
              <source src={l.videoUrl} />
            </video>
          </div>
        </div>
      )}

      {/* stat strip */}
      <div className="px-3 pt-3">
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-[24px] bg-ink/10 md:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="flex items-center gap-3 bg-white px-6 py-6">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-limepale text-ink">
                {s.icon}
              </span>
              <div>
                <p className="text-lg font-medium tracking-[-0.01em] text-ink">{s.value}</p>
                <p className="text-xs text-body">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* body */}
      <div className="grid gap-14 px-8 py-16 md:grid-cols-[1.4fr_1fr] md:px-14">
        <div>
          <h2 className="text-2xl font-medium tracking-[-0.02em] text-ink">About this home</h2>
          <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-body">{l.description}</p>

          {specs.length > 0 && (
            <>
              <h2 className="mt-12 text-2xl font-medium tracking-[-0.02em] text-ink">Specifications</h2>
              <dl className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                {specs.map((s) => (
                  <div key={s.label} className="rounded-2xl bg-cream px-4 py-3.5">
                    <dt className="text-xs text-body">{s.label}</dt>
                    <dd className="mt-1 text-sm font-medium leading-snug text-ink [overflow-wrap:anywhere]">{s.value}</dd>
                  </div>
                ))}
              </dl>
            </>
          )}

          {l.floorPlanUrl && (
            <>
              <h2 className="mt-12 text-2xl font-medium tracking-[-0.02em] text-ink">Floor plan</h2>
              <div className="mt-5 overflow-hidden rounded-[24px] border border-ink/10 bg-white p-3">
                <Image
                  src={l.floorPlanUrl}
                  alt={`${l.title} floor plan`}
                  width={1200}
                  height={900}
                  sizes="(max-width: 768px) 100vw, 55vw"
                  className="h-auto w-full rounded-[14px] object-contain"
                />
              </div>
            </>
          )}

          {amenities.length > 0 && (
            <>
              <h2 className="mt-12 text-2xl font-medium tracking-[-0.02em] text-ink">Amenities</h2>
              <ul className="mt-5 grid max-w-xl gap-3 sm:grid-cols-2">
                {amenities.map((a) => (
                  <li key={a} className="flex items-center gap-3 rounded-2xl bg-cream px-4 py-3 text-sm text-ink/80">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-lime text-[10px] text-ink">✓</span>
                    {a}
                  </li>
                ))}
              </ul>
            </>
          )}

          {/* project & builder */}
          <ProjectInfo property={l} />

          {/* locality & connectivity */}
          <LocalityIntel property={l} />

          {/* cash-back explainer */}
          <div className="mt-12 overflow-hidden rounded-[24px] bg-panel p-8 text-white">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-white/60">Your estimated cash back</p>
                <PriceUnlocked property={l}>
                  <p className="mt-1 text-4xl font-medium tracking-[-0.02em] text-lime">{price(cashBack)}</p>
                </PriceUnlocked>
                <PriceLocked property={l}>
                  <p className="mt-1 text-4xl font-medium tracking-[-0.02em] text-lime/40">₹ •• •••</p>
                </PriceLocked>
                <p className="mt-2 max-w-xs text-xs leading-relaxed text-white/50">
                  Up to 75% of the buyer&apos;s agent commission, returned at closing when you buy this home with Diggaj Realty.
                </p>
              </div>
              <Link href="/#buy-sell" className="w-fit shrink-0 rounded-full bg-lime px-6 py-3 text-sm font-semibold text-ink">
                How it works →
              </Link>
            </div>
          </div>
        </div>

        {/* sticky sidebar */}
        <div className="h-fit md:sticky md:top-8">
          {/* EMI calculator */}
          <PriceUnlocked property={l}>
            <EmiCalculator askingPrice={l.askingPrice} maintenanceMonthly={l.maintenanceMonthly} />
          </PriceUnlocked>
          <PriceLocked property={l}>
            <div className="rounded-[24px] bg-cream p-6 text-center">
              <p className="text-sm font-medium text-ink">Pricing is exclusive</p>
              <p className="mt-1 text-xs text-body">
                This is an Elite listing. Log in as a buyer to see the price, payment estimate, and cash back.
              </p>
              <div className="mt-4 flex justify-center">
                <GatedPrice property={l} variant="hero" />
              </div>
            </div>
          </PriceLocked>

          {/* tour request */}
          <div className="mt-4 rounded-[28px] bg-panel p-8 text-white">
            <div className="flex items-center gap-3">
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full ring-1 ring-white/15">
                <Image src="/img/agent-avatar.jpg" alt="Listing agent" fill sizes="48px" className="object-cover" />
              </div>
              <div>
                <p className="text-sm font-medium">Request a tour</p>
                <p className="text-xs text-white/50">Free · no obligation</p>
              </div>
            </div>
            <div className="mt-6">
              <LeadForm dark subject={`Tour request: ${l.title}`} cta="Request a tour" />
            </div>
          </div>
        </div>
      </div>

      {/* location */}
      {l.latitude != null && l.longitude != null && (
        <div className="px-3 pb-4">
          <div className="overflow-hidden rounded-[24px] border border-ink/10 bg-white">
            <div className="flex items-center justify-between gap-4 px-6 py-4">
              <div>
                <h2 className="text-lg font-medium tracking-[-0.01em] text-ink">Location</h2>
                <p className="text-xs text-body">{l.location}</p>
              </div>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${l.latitude}%2C${l.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 rounded-full bg-ink px-4 py-2 text-xs font-medium text-white"
              >
                Open in Maps →
              </a>
            </div>
            {process.env.GOOGLE_PLACES_API_KEY ? (
              <PropertyMap
                lat={l.latitude}
                lng={l.longitude}
                title={l.title}
                apiKey={process.env.GOOGLE_PLACES_API_KEY}
              />
            ) : (
              <iframe
                title={`Map of ${l.title}`}
                loading="lazy"
                className="h-[40vh] w-full border-0"
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${l.longitude - 0.012}%2C${l.latitude - 0.008}%2C${l.longitude + 0.012}%2C${l.latitude + 0.008}&layer=mapnik&marker=${l.latitude}%2C${l.longitude}`}
              />
            )}
          </div>
        </div>
      )}

      {/* more homes */}
      {others.length > 0 && (
        <div className="px-8 pb-24 md:px-14">
          <h2 className="text-2xl font-medium tracking-[-0.02em] text-ink">More homes</h2>
          <div className="mt-8 grid gap-x-7 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((o, i) => (
              <ListingCard key={o.id} property={o} i={i} />
            ))}
          </div>
        </div>
      )}

      <Footer />
    </main>
  );
}
