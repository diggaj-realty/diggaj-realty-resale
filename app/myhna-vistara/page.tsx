import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Footer from "@/components/Footer";
import LeadForm from "@/components/LeadForm";
import { price } from "@/lib/listings";
import {
  PROJECT,
  FACTS,
  HERO_STATS,
  HERO_POINTS,
  FROM_PRICE,
  TOP_PRICE,
  CONFIGS,
  MAX_SQFT,
  BHK_SUMMARY,
  perSqft,
  MIXED_USE,
  AMENITIES,
  CONNECTIVITY,
  SPECS,
  TRACKER,
  PAYMENT,
  MAX_PCT,
  EOI_STEPS,
  FAQS,
  GALLERY,
  FLOOR_PLANS,
  CONSTRUCTION_IMAGE,
} from "./data";
import { CheckIcon, PinIcon } from "../brigade-granada/icons";
import { TowerElevation, LocalityMap } from "./visuals";
import LeadPopup from "./LeadPopup";

// Fully static: no fetch, no `revalidate` — same pattern as the Brigade
// Granada and Sobha One World microsites. Content lives in ./data.ts,
// diagrams in ./visuals.tsx; this file is layout only. Read the DISCLAIMER
// at the foot of this file before changing how any of it renders — the
// source is a channel partner's marketing site, not necessarily Myhna
// Properties' own primary domain, and it has a much thinner image set than
// the other two microsites (no interior or amenity photography exists on
// the source at all).

const JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "ApartmentComplex",
      name: PROJECT.name,
      description:
        "14-acre integrated township on the 150-ft CDP Road, Gunjur, East Bangalore, with 3–4 BHK apartments across 6 towers. RERA registered.",
      url: "https://diggajrealty.com/myhna-vistara",
      numberOfAccommodationUnits: 1120,
      address: {
        "@type": "PostalAddress",
        streetAddress: "150-ft CDP Road, Gunjur",
        addressLocality: "Gunjur, Bangalore",
        addressRegion: "Karnataka",
        addressCountry: "IN",
      },
      amenityFeature: AMENITIES.flatMap((g) =>
        g.items.map((name) => ({ "@type": "LocationFeatureSpecification", name, value: true }))
      ),
    },
    {
      "@type": "FAQPage",
      mainEntity: FAQS.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ],
};

export const metadata: Metadata = {
  title: "Myhna Vistara, Gunjur: Price, Plans & Booking",
  description:
    "Myhna Vistara: a 14-acre township on the CDP Road, Gunjur, East Bangalore. 3–4 BHK from ₹1.80 Cr, 1,120 units, G+31 floors. RERA registered, booking open.",
  alternates: { canonical: "/myhna-vistara" },
  openGraph: {
    title: "Myhna Vistara, Gunjur: Price, Plans & Booking",
    description:
      "14-acre township in Gunjur, East Bangalore. 3–4 BHK from ₹1.80 Cr. Configurations, amenities, connectivity and payment plan.",
    url: "https://diggajrealty.com/myhna-vistara",
    type: "website",
  },
};

/** Section heading + optional standfirst, at the shared measure and rhythm.
 *  Same component as the other two microsites' page.tsx — duplicated rather
 *  than shared since each microsite owns its full layout independently. */
function SectionHead({
  eyebrow,
  title,
  lead,
  dark,
}: {
  eyebrow: string;
  title: string;
  lead?: string;
  dark?: boolean;
}) {
  return (
    <div className="max-w-[34em]">
      <span
        className={`text-[11px] font-semibold uppercase tracking-[0.14em] ${
          dark ? "text-lime" : "text-ink/40"
        }`}
      >
        {eyebrow}
      </span>
      <h2
        className={`mt-3 text-section font-medium tracking-[-0.02em] ${
          dark ? "text-white" : "text-ink"
        }`}
      >
        {title}
      </h2>
      {lead && (
        <p className={`mt-4 text-lead ${dark ? "text-white/60" : "text-body"}`}>{lead}</p>
      )}
    </div>
  );
}

export default function MyhnaVistaraPage() {
  return (
    <main className="w-full overflow-clip bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
      />
      <LeadPopup />

      {/* ── Hero ─────────────────────────────────────────────────────────
          The render is an annotated tower-layout image (tower letters, "1"/
          "2" clubhouse markers) rather than a clean photographic hero — it's
          the only aerial-scale image the source site has. Sourced from
          myhnaproperties.in, a channel partner site per its own footer, not
          confirmed as Myhna Properties' own asset. */}
      <section className="relative flex min-h-[640px] flex-col overflow-clip md:min-h-[max(640px,100svh)]">
        <div className="absolute inset-0">
          <Image
            src={GALLERY[0].src}
            alt={GALLERY[0].alt}
            fill
            priority
            sizes="100vw"
            quality={82}
            className="object-cover object-[center_35%]"
          />
          <div className="absolute inset-0 bg-panel/45" />
          <div className="absolute inset-x-0 top-0 h-2/5 bg-gradient-to-b from-black/70 via-black/25 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
        </div>

        <div className="relative z-20 flex flex-1 flex-col justify-end px-8 pb-28 pt-20 md:px-14 lg:pb-14">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-lime px-4 py-2 text-xs font-semibold text-ink">
              {PROJECT.status}
            </span>
            {/* Location is the chip that matters most to a buyer scanning the
                hero, so it gets the solid treatment while the developer chip
                stays glass. Lime is reserved for the status chip. */}
            <span className="flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-semibold text-ink shadow-sm">
              <PinIcon className="h-3.5 w-3.5" />
              {PROJECT.locality} · {PROJECT.city}
            </span>
            <span className="rounded-full bg-white/10 px-4 py-2 text-xs font-medium text-white/80 ring-1 ring-white/15 backdrop-blur">
              By {PROJECT.developer}
            </span>
          </div>

          <h1 className="mt-7 max-w-[12em] text-display font-medium tracking-[-0.03em] text-white">
            {PROJECT.name}
          </h1>
          {/* The project summary, as scannable points rather than a prose
              standfirst — HERO_POINTS in data.ts is the single source. */}
          <ul className="mt-6 flex max-w-[42em] flex-wrap gap-x-6 gap-y-2.5">
            {HERO_POINTS.map((p) => (
              <li key={p} className="flex items-start gap-2.5 text-sm text-white/70">
                <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-lime" />
                {p}
              </li>
            ))}
          </ul>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <a
              href="#enquire"
              className="rounded-full bg-lime px-6 py-3 text-sm font-semibold text-ink shadow-lg transition-transform hover:-translate-y-px"
            >
              Book a site visit
            </a>
            <a
              href="#pricing"
              className="rounded-full bg-white/10 px-6 py-3 text-sm font-medium text-white ring-1 ring-white/20 backdrop-blur transition-transform hover:-translate-y-px"
            >
              See configurations
            </a>
          </div>

          <div className="mt-12 grid max-w-4xl grid-cols-2 gap-3 sm:grid-cols-4">
            {HERO_STATS.map((s) => (
              <div
                key={s.label}
                className="rounded-2xl bg-white/10 px-5 py-4 ring-1 ring-white/15 backdrop-blur"
              >
                <p className="text-subhead font-medium text-white">{s.value}</p>
                <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/50">
                  {s.label}
                </p>
              </div>
            ))}
          </div>

          <p className="mt-8 text-xs text-white/45">
            RERA: {PROJECT.rera}. Also marketed as {PROJECT.alsoKnownAs}.
          </p>
        </div>

        <span className="absolute bottom-4 right-6 z-20 text-[10px] tracking-wide text-white/35">
          Marketing render via a channel partner site, not confirmed as Myhna&apos;s own asset
        </span>
      </section>

      {/* ── Tower elevation + facts ────────────────────────────────────── */}
      <div className="px-3 py-3">
        <div className="rounded-[28px] bg-panel px-8 py-14 md:px-14">
          <SectionHead
            dark
            eyebrow="At a glance"
            title="The shape of the project"
            lead="Drawn from the developer's stated floor count. As of the source's last update the project has just moved past pre-launch into early foundation works."
          />

          <div className="mt-12">
            <TowerElevation />
          </div>

          <div className="mt-14 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
            {FACTS.map((f) => (
              <div key={f.label} className="rounded-2xl bg-white/5 px-5 py-6 ring-1 ring-white/10">
                <f.Icon className="h-[18px] w-[18px] text-lime" />
                <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/40">
                  {f.label}
                </p>
                <p className="mt-2 text-subhead font-medium text-white">{f.value}</p>
                {f.note && <p className="mt-1 text-xs text-white/50">{f.note}</p>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Pricing ────────────────────────────────────────────────────── */}
      <section id="pricing" className="scroll-mt-8 px-8 py-24 md:px-14">
        <SectionHead
          eyebrow="Configurations"
          title="Sizes and starting prices"
          lead="Starting prices for each layout, stated by the developer as all-inclusive (GST and basic charges included). Each bar is that layout's size against the largest; the rate per square foot is derived from the size and price shown."
        />

        <ul className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {CONFIGS.map((c) => (
            <li key={c.label}>
              <a
                href="#enquire"
                aria-label={`Enquire about the ${c.label} layout`}
                className="group flex h-full flex-col rounded-[24px] bg-ink/[0.03] p-7 transition-colors hover:bg-limepale"
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-card-title font-medium tracking-[-0.02em] text-ink">
                    {c.label}
                  </h3>
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-ink/40 transition-all group-hover:bg-panel group-hover:text-white group-hover:translate-x-0.5">
                    <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5">
                      <path
                        d="M3.5 8h9m0 0L8.5 4m4 4-4 4"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </div>

                <p className="mt-6 text-sm text-body">{c.sqft.toLocaleString("en-IN")} sqft</p>
                <span className="mt-2 block h-1.5 overflow-hidden rounded-full bg-ink/10">
                  <span
                    className="block h-full rounded-full bg-lime"
                    style={{ width: `${(c.sqft / MAX_SQFT) * 100}%` }}
                  />
                </span>

                <div className="mt-6 flex items-end justify-between border-t border-ink/10 pt-5">
                  <span>
                    <span className="block text-[10px] font-semibold uppercase tracking-[0.12em] text-ink/40">
                      Starting
                    </span>
                    <span className="mt-1 block text-subhead font-medium text-ink">
                      {price(c.from)}
                    </span>
                  </span>
                  <span className="text-right">
                    <span className="block text-[10px] font-semibold uppercase tracking-[0.12em] text-ink/40">
                      Approx. ₹/sqft
                    </span>
                    <span className="mt-1 block text-sm font-medium text-body">
                      {perSqft(c.from, c.sqft)}
                    </span>
                  </span>
                </div>
              </a>
            </li>
          ))}
        </ul>

        <div className="mt-8 rounded-2xl bg-limepale px-6 py-5">
          <p className="text-sm text-ink/70">
            Range across all layouts:{" "}
            <span className="font-semibold text-ink">
              {price(FROM_PRICE)} – {price(TOP_PRICE)}
            </span>{" "}
            · No floor-rise or premium-location charges for the first 51 bookings, per the
            developer&apos;s stated pre-launch offer.
          </p>
        </div>
      </section>

      {/* ── Floor plans ────────────────────────────────────────────────────
          Real floor plan diagrams from the source site, not renders — worth
          its own section since these are a materially different (and more
          concrete) kind of asset than the marketing gallery below. */}
      <section className="bg-cream px-8 py-24 md:px-14">
        <SectionHead
          eyebrow="Floor plans"
          title="Two of the published layouts"
          lead="Developer-issued floor plan diagrams for two of the three configurations. Verify final dimensions against the RERA-filed plan before booking."
        />
        <div className="mt-12 grid gap-3 sm:grid-cols-2">
          {FLOOR_PLANS.map((f) => (
            <figure key={f.src} className="overflow-hidden rounded-[24px] bg-white">
              <div className="relative aspect-[4/3]">
                <Image
                  src={f.src}
                  alt={f.alt}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-contain"
                />
              </div>
              <figcaption className="px-5 py-3 text-xs text-body">{f.label}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* ── Mixed use ──────────────────────────────────────────────────── */}
      <section className="px-8 py-24 md:px-14">
        <SectionHead
          eyebrow="More than apartments"
          title="What else sits on the land"
          lead="A 14-acre parcel split between residential and commercial use, plus the design choices the developer is leading with."
        />
        <div className="mt-12 grid gap-3 md:grid-cols-3">
          {MIXED_USE.map((m, i) => (
            <div key={m.title} className="rounded-[24px] bg-ink/[0.03] px-8 py-10">
              <div className="flex items-center justify-between">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-lime text-ink">
                  <m.Icon className="h-5 w-5" />
                </span>
                <span className="text-xs font-bold text-ink/20">0{i + 1}</span>
              </div>
              <h3 className="mt-6 text-card-title font-medium tracking-[-0.02em] text-ink">
                {m.title}
              </h3>
              <p className="mt-4 text-sm leading-relaxed text-body">{m.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Site progress ──────────────────────────────────────────────────
          A genuine on-site photo (hoarding + marketing office signage), not
          a render — the only real photograph on the source site. Still from
          the same third-party channel partner, so still captioned. */}
      <section className="bg-cream px-8 py-24 md:px-14">
        <SectionHead
          eyebrow="On site"
          title="What's actually there"
          lead="A photo of the site hoarding and marketing office — evidence the site exists and is active, not a finished building."
        />
        <figure className="mt-12">
          <div className="relative aspect-[4/3] overflow-hidden rounded-[24px] bg-white sm:aspect-[16/9] md:aspect-[21/9]">
            <Image
              src={CONSTRUCTION_IMAGE.src}
              alt={CONSTRUCTION_IMAGE.alt}
              fill
              sizes="(max-width: 768px) 100vw, 90vw"
              className="object-cover"
            />
            <span className="absolute left-4 top-4 rounded-full bg-panel/80 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-white backdrop-blur">
              Site photo
            </span>
          </div>
          <figcaption className="mt-3 text-xs text-body">
            Sourced from the channel partner&apos;s site, not independently verified by Diggaj
            Realty. Ask for a current site-visit date before relying on it.
          </figcaption>
        </figure>
      </section>

      {/* ── Amenities ──────────────────────────────────────────────────── */}
      <section className="px-8 py-24 md:px-14">
        <SectionHead
          eyebrow="Amenities"
          title="What is inside the gates"
          lead="The developer's stated 70-plus amenity list, grouped by what you would actually use it for."
        />
        <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {AMENITIES.map((g) => (
            <div key={g.group} className="rounded-[24px] bg-ink/[0.03] px-7 py-8">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-limepale text-ink">
                  <g.Icon className="h-[18px] w-[18px]" />
                </span>
                <h3 className="text-subhead font-medium tracking-[-0.01em] text-ink">
                  {g.group}
                </h3>
              </div>
              <ul className="mt-6 flex flex-col gap-2.5">
                {g.items.map((item) => (
                  <li key={item} className="flex gap-3 text-sm text-body">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-lime" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* ── Location ───────────────────────────────────────────────────── */}
      <div className="px-3 py-3">
        <div className="rounded-[28px] bg-panel px-8 py-14 md:px-14">
          <SectionHead
            dark
            eyebrow="Location"
            title="What is within reach"
            lead="Gunjur sits between Varthur and Sarjapur Road, close to the tech-park corridor without Whitefield's traffic."
          />

          <div className="mt-10">
            <LocalityMap apiKey={process.env.GOOGLE_PLACES_API_KEY} />
          </div>

          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {CONNECTIVITY.map((g) => (
              <div key={g.group} className="rounded-2xl bg-white/5 px-5 py-6 ring-1 ring-white/10">
                <div className="flex items-center gap-2">
                  <span className="text-lime">
                    <g.Icon className="h-4 w-4" />
                  </span>
                  <h3 className="text-[10px] font-semibold uppercase tracking-[0.12em] text-lime">
                    {g.group}
                  </h3>
                </div>
                <ul className="mt-4 flex flex-col gap-3">
                  {g.items.map((item) => (
                    <li key={item.name}>
                      <span className="block text-sm text-white/80">{item.name}</span>
                      <span className="mt-0.5 block text-xs text-white/40">{item.away}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <p className="mt-8 flex items-center gap-2 text-xs text-white/40">
            <PinIcon className="h-3.5 w-3.5" />
            {PROJECT.address}
          </p>
        </div>
      </div>

      {/* ── Specifications ───────────────────────────────────────────────
          No dedicated interior photograph exists on the source at all, so
          this section leads with the master plan instead of a kitchen shot
          (unlike the other two microsites) — there is nothing else to show. */}
      <section className="px-8 py-24 md:px-14">
        <SectionHead
          eyebrow="Specifications"
          title="What the developer is claiming"
          lead="Only the headline construction and layout claims are published at this project level. Verify the full specification against the agreement schedule before you sign anything."
        />

        <figure className="mt-12">
          <div className="relative aspect-[4/3] overflow-hidden rounded-[24px] bg-cream sm:aspect-[16/9] md:aspect-[21/9]">
            <Image
              src={GALLERY[1].src}
              alt={GALLERY[1].alt}
              fill
              sizes="(max-width: 768px) 100vw, 90vw"
              className="object-contain"
            />
            <span className="absolute left-4 top-4 rounded-full bg-panel/80 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-white backdrop-blur">
              Marketing render
            </span>
          </div>
          <figcaption className="mt-3 text-xs text-body">
            The 14-acre master plan render from the channel partner&apos;s site, not confirmed as
            Myhna Properties&apos; own asset.
          </figcaption>
        </figure>

        <div className="mt-12 grid gap-3 md:grid-cols-2">
          {SPECS.map((s) => (
            <div key={s.label} className="flex gap-5 rounded-2xl bg-ink/[0.03] px-7 py-7">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-limepale text-ink">
                <s.Icon className="h-[18px] w-[18px]" />
              </span>
              <span>
                <h3 className="text-sm font-semibold text-ink">{s.label}</h3>
                <p className="mt-2 text-sm leading-relaxed text-body">{s.value}</p>
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Status + payment ───────────────────────────────────────────── */}
      <section className="bg-cream px-8 py-24 md:px-14">
        <div className="grid gap-16 lg:grid-cols-2">
          <div>
            <SectionHead
              eyebrow="Where it stands"
              title="Approvals, honestly"
              lead="RERA is issued, but construction itself is still at early foundation stage. This is the current state of it."
            />
            <ul className="mt-11 flex flex-col gap-4">
              {TRACKER.map((t) => (
                <li key={t.label} className="flex items-center gap-4">
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                      t.state === "done"
                        ? "bg-lime text-ink"
                        : t.state === "active"
                        ? "bg-ink/10 text-ink/60"
                        : "text-ink/30 ring-1 ring-ink/15"
                    }`}
                  >
                    {t.state === "done" ? (
                      <CheckIcon className="h-3.5 w-3.5" />
                    ) : t.state === "active" ? (
                      <span className="h-1.5 w-1.5 rounded-full bg-ink/50" />
                    ) : (
                      <span className="h-px w-2.5 bg-ink/30" />
                    )}
                  </span>
                  <span className="text-sm font-medium text-ink">{t.label}</span>
                  <span className="ml-auto text-xs text-ink/45">
                    {t.state === "done"
                      ? "Complete"
                      : t.state === "active"
                      ? "In progress"
                      : "Not started"}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <SectionHead
              eyebrow="Payment"
              title="The pre-launch offer"
              lead="The developer's stated pre-launch plan: 10% now, balance on possession. Verify the version in your agreement."
            />
            <div className="mt-11 overflow-hidden rounded-[24px] bg-white">
              {PAYMENT.map((p) => (
                <div
                  key={p.stage}
                  className="flex items-center gap-5 border-b border-ink/5 px-7 py-4 last:border-b-0"
                >
                  <span className="w-11 shrink-0 text-sm font-semibold text-ink">{p.pct}%</span>
                  <span className="flex-1 text-sm text-body">{p.stage}</span>
                  <span className="hidden w-28 shrink-0 sm:block">
                    <span
                      className="block h-1.5 rounded-full bg-lime"
                      style={{ width: `${(p.pct / MAX_PCT) * 100}%` }}
                    />
                  </span>
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs text-ink/45">
              No floor-rise or premium-location charges for the first 51 bookings, per the
              developer&apos;s stated offer.
            </p>
          </div>
        </div>
      </section>

      {/* ── Booking + form ─────────────────────────────────────────────── */}
      <section id="enquire" className="scroll-mt-8 px-3 py-3">
        <div className="rounded-[28px] bg-panel px-8 py-16 md:px-14">
          <div className="grid gap-14 lg:grid-cols-2">
            <div className="order-2 lg:order-1">
              <SectionHead
                dark
                eyebrow="Booking"
                title="Reserve your unit"
                lead="RERA is registered and booking is open. Confirm whether the first-51-bookings offer is still live before you commit."
              />
              <ol className="mt-11 flex flex-col gap-5">
                {EOI_STEPS.map((s, i) => (
                  <li key={s} className="flex gap-4">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-lime text-[11px] font-bold text-ink">
                      {i + 1}
                    </span>
                    <span className="text-sm leading-relaxed text-white/70">{s}</span>
                  </li>
                ))}
              </ol>
              <p className="mt-10 text-xs text-white/40">
                Prefer to talk it through?{" "}
                <Link href="/contact" className="text-lime underline underline-offset-4">
                  Contact an agent
                </Link>{" "}
                or browse{" "}
                <Link href="/listings" className="text-lime underline underline-offset-4">
                  ready-to-move resale homes
                </Link>{" "}
                if 2029 is too long to wait.
              </p>
            </div>

            <div className="order-1 lg:order-2">
              {/* On mobile the form is hoisted above the booking steps, so it
                  needs its own heading — the SectionHead in the other column
                  now renders below it. */}
              <div className="mb-8 lg:hidden">
                <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-lime">
                  Booking
                </span>
                <h2 className="mt-3 text-section font-medium tracking-[-0.02em] text-white">
                  Reserve your unit
                </h2>
                <p className="mt-3 text-sm text-white/60">
                  RERA registered and booking open. The steps are set out below.
                </p>
              </div>
              <LeadForm
                dark
                subject="Myhna Vistara: booking enquiry"
                cta="Request project details"
                endpoint="/api/leads/myhna-vistara"
                source="myhna-vistara-inline"
                requirePhone
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ────────────────────────────────────────────────────────── */}
      <section className="px-8 py-24 md:px-14">
        <SectionHead eyebrow="FAQ" title="The questions worth asking" />
        <div className="mt-12 max-w-[48em]">
          {FAQS.map((f) => (
            <details key={f.q} className="group border-b border-ink/10">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-6 text-left">
                <span className="text-subhead font-medium tracking-[-0.01em] text-ink">
                  {f.q}
                </span>
                <span className="shrink-0 text-xl text-ink/30 transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="pb-7 text-lead text-body">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ── Disclaimer ─────────────────────────────────────────────────── */}
      <section className="px-8 pb-24 md:px-14">
        <div className="max-w-[48em] rounded-[24px] bg-ink/[0.03] px-8 py-9">
          <h2 className="text-sm font-semibold text-ink">Disclaimer</h2>
          <p className="mt-3 text-xs leading-relaxed text-body">
            This page is compiled from myhnaproperties.in/myhna-vistara, a site whose own footer
            states it is &quot;run and maintained by an authorized channel partner of Myhna
            Properties,&quot; not confirmed as Myhna Properties&apos; own primary domain. Every
            figure on this page, including prices, unit sizes, tower and unit counts, amenities,
            the payment schedule and the June 2029 target possession date, is indicative
            information supplied by or about the developer, and is subject to change or
            withdrawal without notice — including the stated &quot;first 51 bookings&quot; offer,
            which the source itself says may be revised once that allocation is used. The tower
            elevation diagram is an illustration drawn from the stated floor count, not an
            architectural, survey or sanctioned planning document. The hero and master-plan
            images are marketing renders from the same channel partner site and have not been
            independently verified as Myhna Properties&apos; own assets. The floor plan images are
            the developer&apos;s own published diagrams for two of the three listed configurations;
            verify final dimensions against the RERA-filed plan. The site photograph shows
            hoarding and office signage, not a finished building, and is likewise unverified by
            Diggaj Realty directly. Specifications shown are limited to what the source
            explicitly states; nothing has been added to fill gaps the source leaves open. Prices
            exclude items not listed as included. Nothing here is an offer, an invitation to
            offer, or a contract, and it does not constitute investment advice. Diggaj Realty is
            not the developer, promoter or an appointed channel partner of this project. Verify
            all details, approvals and the RERA registration number directly with Myhna
            Properties and on the Karnataka RERA portal before paying any amount. Myhna and Myhna
            Vistara are the property of their respective owners and are referenced here for
            identification only.
          </p>
        </div>
      </section>

      <Footer />

      <div className="fixed inset-x-3 bottom-3 z-40 flex items-center justify-between gap-4 rounded-full bg-panel/95 px-5 py-3 shadow-2xl ring-1 ring-white/10 backdrop-blur lg:hidden">
        {/* Two lines: what's on sale, then what it starts at. The bar used to
            show only the price, which told a scanner the cost without ever
            saying what configurations that price bought. */}
        <span className="min-w-0 flex-1 text-xs leading-tight text-white/60">
          <span className="block truncate font-semibold text-white">{BHK_SUMMARY}</span>
          <span className="block">
            From <span className="font-semibold text-white/90">{price(FROM_PRICE)}</span>
          </span>
        </span>
        <a
          href="#enquire"
          className="shrink-0 rounded-full bg-lime px-5 py-2 text-xs font-semibold text-ink"
        >
          Book now
        </a>
      </div>
      <div className="h-20 lg:hidden" aria-hidden />
    </main>
  );
}
