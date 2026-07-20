import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import LeadForm from "@/components/LeadForm";
import ListingCard from "@/components/ListingCard";
import { LISTINGS, getListing, price } from "@/lib/listings";

export function generateStaticParams() {
  return LISTINGS.map((l) => ({ slug: l.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const l = getListing((await params).slug);
  if (!l) return {};
  return {
    title: `${l.title} — ${price(l.price)} | Diggaj Realty`,
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
  const l = getListing((await params).slug);
  if (!l) notFound();

  const cashBack = Math.round((l.price * 0.03 * 0.75) / 100) * 100;
  const perSqft = Math.round(l.price / l.sqft);
  // rough 30-yr est: 20% down, ~6.5% → 0.00632 monthly factor on financed amount
  const monthly = Math.round((l.price * 0.8 * 0.00632) / 10) * 10;
  const others = LISTINGS.filter((x) => x.slug !== l.slug).slice(0, 3);

  const stats = [
    { icon: <BedIcon />, label: "Bedrooms", value: l.beds },
    { icon: <BathIcon />, label: "Bathrooms", value: l.baths },
    { icon: <AreaIcon />, label: "Sq. ft.", value: l.sqft.toLocaleString() },
    { icon: <TagIcon />, label: "Per sq. ft.", value: price(perSqft) },
  ];

  return (
    <main className="min-h-screen bg-white">
      <div className="bg-cream pb-8">
        <Nav />
        <div className="px-8 pt-10 md:px-14">
          <Link href="/listings" className="text-xs font-medium text-ink/50 hover:text-ink">
            ← All homes
          </Link>
          <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <span
                className={`inline-block rounded-full px-4 py-1.5 text-xs font-medium shadow-sm ${
                  l.badge === "New" ? "bg-lime text-ink" : "bg-white text-ink"
                }`}
              >
                {l.badge}
              </span>
              <h1 className="mt-4 max-w-2xl text-4xl font-medium tracking-[-0.03em] text-ink md:text-6xl">
                {l.title}
              </h1>
              <p className="mt-3 flex items-center gap-1.5 text-sm text-ink/60">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" />
                </svg>
                {l.address}, {l.city}
              </p>
            </div>
            <div className="md:text-right">
              <p className="text-4xl font-medium tracking-[-0.02em] text-ink md:text-5xl">
                {price(l.price)}
              </p>
              <p className="mt-2 inline-block rounded-full bg-lime px-4 py-1.5 text-xs font-semibold text-ink">
                ⌂ Est. {price(cashBack)} cash back
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* gallery */}
      <div className="grid gap-3 px-3 pt-3 md:grid-cols-[2fr_1fr]">
        <div className="relative h-[46vh] overflow-hidden rounded-[24px] md:h-[64vh]">
          <Image src={l.gallery[0]} alt={l.title} fill priority sizes="66vw" className="object-cover" />
          <span className="absolute bottom-4 left-4 rounded-full bg-black/55 px-3.5 py-1.5 text-xs font-medium text-white backdrop-blur">
            {l.gallery.length} photos
          </span>
        </div>
        <div className="grid grid-rows-2 gap-3">
          {l.gallery.slice(1, 3).map((src, i) => (
            <div key={i} className="relative h-[22vh] overflow-hidden rounded-[24px] md:h-auto">
              <Image src={src} alt={`${l.title} interior ${i + 1}`} fill sizes="33vw" className="object-cover" />
            </div>
          ))}
        </div>
      </div>

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

          <h2 className="mt-12 text-2xl font-medium tracking-[-0.02em] text-ink">Features</h2>
          <ul className="mt-5 grid max-w-xl gap-3 sm:grid-cols-2">
            {l.features.map((f) => (
              <li key={f} className="flex items-center gap-3 rounded-2xl bg-cream px-4 py-3 text-sm text-ink/80">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-lime text-[10px] text-ink">✓</span>
                {f}
              </li>
            ))}
          </ul>

          {/* cash-back explainer */}
          <div className="mt-12 overflow-hidden rounded-[24px] bg-panel p-8 text-white">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-white/60">Your estimated cash back</p>
                <p className="mt-1 text-4xl font-medium tracking-[-0.02em] text-lime">{price(cashBack)}</p>
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
          {/* payment estimate */}
          <div className="rounded-[24px] bg-cream p-6">
            <p className="text-sm font-medium text-ink">Estimated monthly payment</p>
            <p className="mt-1 text-3xl font-medium tracking-[-0.02em] text-ink">
              {price(monthly)}<span className="text-base text-body">/mo</span>
            </p>
            <div className="mt-4 space-y-2 text-xs text-body">
              <div className="flex justify-between"><span>List price</span><span className="font-medium text-ink">{price(l.price)}</span></div>
              <div className="flex justify-between"><span>Down payment (20%)</span><span className="font-medium text-ink">{price(Math.round(l.price * 0.2))}</span></div>
              <div className="flex justify-between"><span>Est. rate</span><span className="font-medium text-ink">6.5% / 30yr</span></div>
            </div>
            <p className="mt-4 text-[11px] leading-relaxed text-ink/40">
              Estimate only. Actual terms vary — talk to a Diggaj lender for a real quote.
            </p>
          </div>

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

      {/* more homes */}
      <div className="px-8 pb-24 md:px-14">
        <h2 className="text-2xl font-medium tracking-[-0.02em] text-ink">More homes</h2>
        <div className="mt-8 grid gap-x-7 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {others.map((o, i) => (
            <ListingCard key={o.slug} listing={o} i={i} />
          ))}
        </div>
      </div>

      <Footer />
    </main>
  );
}
