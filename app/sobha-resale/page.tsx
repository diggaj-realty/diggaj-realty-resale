import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Footer from "@/components/Footer";
import LeadForm from "@/components/LeadForm";
import { price } from "@/lib/listings";
import {
  PAGE,
  COMMUNITIES,
  HERO_MOSAIC,
  SOUTH_IMAGE,
  IMAGE_CREDIT,
  READY,
  UNDER_CONSTRUCTION,
  FROM_PRICE,
  PRICE_SUMMARY,
  HERO_POINTS,
  HERO_STATS,
  WHY,
  SECTORS,
  SECTOR_COUNTS,
  PROCESS,
  PITFALLS,
  LOCALITIES,
  FAQS,
  type Community,
} from "./data";
import { CheckIcon, PinIcon } from "../brigade-granada/icons";
import { CorridorDiagram, PriceLadder } from "./visuals";
import LeadPopup from "./LeadPopup";

// Fully static: no fetch, no `revalidate` — prerendered at build time and
// served from the edge, same as the three project microsites. This one is a
// *portfolio* page rather than a single project, so its content unit is
// COMMUNITIES in ./data.ts; diagrams are in ./visuals.tsx and this file is
// layout only.
//
// Imagery: one render per community, never shared between them — a page
// covering ten projects must not head itself with a render of one of them, so
// the hero is a three-community mosaic rather than a single full-bleed plate.
// That is also the resolution-honest choice: the source files top out at
// 1000px wide, and a full-bleed hero would visibly soften past ~1200px. All
// renders come from sobharesale.in rather than Sobha's own domain, credited
// wherever they appear. Read the DISCLAIMER at the foot of this file before
// changing how any figure or image renders.

const JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      // A resale advisory offering, not a development — so RealEstateAgent,
      // not ApartmentComplex. The three project microsites are the reverse.
      "@type": "RealEstateAgent",
      name: "Diggaj Realty — Sobha resale, Bengaluru",
      description:
        "Independent resale advisory for Sobha communities in Bengaluru: verified units across the east, north and south corridors, with title, RERA and builder-NOC checks carried through to registration.",
      url: "https://diggajrealty.com/sobha-resale",
      areaServed: { "@type": "City", name: "Bengaluru", addressCountry: "IN" },
      knowsAbout: COMMUNITIES.map((c) => c.name),
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
  title: "Sobha Resale Apartments in Bangalore: Prices & Availability",
  description:
    "Sobha resale apartments in Bangalore across ten communities in Whitefield, Panathur, Hennur and Jakkur. Indicative resale prices from ₹82 L, ready-to-move and under-construction, with title and RERA checks.",
  alternates: { canonical: "/sobha-resale" },
  openGraph: {
    title: "Sobha Resale Apartments in Bangalore: Prices & Availability",
    description:
      "Ten Sobha communities on the Bengaluru secondary market, with indicative resale prices, corridor guidance and the full buying process.",
    url: "https://diggajrealty.com/sobha-resale",
    type: "website",
  },
};

/** Section heading + optional standfirst, at the shared measure and rhythm.
 *  Same component as the three project microsites. */
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

/** Card track sized to the number of cards in it.
 *
 *  A lone card trailing a three-column row reads as a broken layout — the same
 *  problem components/ExploreProjects.tsx solves with GRID_BY_COUNT. Four
 *  communities go to a 2×2 rather than 3 + 1; everything else takes the
 *  default ladder. */
const TRACK_BY_COUNT: Record<number, string> = {
  1: "md:grid-cols-1 max-w-xl",
  2: "md:grid-cols-2",
  4: "md:grid-cols-2",
};
const track = (n: number) => TRACK_BY_COUNT[n] ?? "md:grid-cols-2 xl:grid-cols-3";

/** One community card.
 *
 *  Price is the loudest thing on the card because it is what a scanner is
 *  here for, but it carries the "from" qualifier inline rather than in a
 *  footnote — an unqualified figure on a resale card reads as the price of
 *  the unit on offer, which it is not. Communities with no published
 *  indication say so instead of showing a blank. */
function CommunityCard({ c }: { c: Community }) {
  return (
    <article className="flex flex-col overflow-hidden rounded-[24px] bg-ink/[0.03] transition-transform duration-300 hover:-translate-y-0.5">
      {/* Cover sits inside the card's own radius rather than floating above it,
          and the sector chip moves onto the image — on a card this dense the
          chip was competing with the community name for the same corner. */}
      <div className="relative aspect-[16/10] overflow-hidden bg-ink/10">
        <Image
          src={c.image}
          alt={c.imageAlt}
          fill
          sizes="(max-width: 768px) 92vw, (max-width: 1280px) 46vw, 30vw"
          className="object-cover transition-transform duration-500 ease-out hover:scale-[1.03]"
        />
        <span className="absolute right-3 top-3 rounded-full bg-white/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-ink/70 backdrop-blur">
          {c.sector}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-7">
      <h3 className="text-subhead font-medium tracking-[-0.01em] text-ink">{c.name}</h3>

      <p className="mt-2.5 flex items-start gap-1.5 text-xs text-body">
        <PinIcon className="mt-px h-3.5 w-3.5 shrink-0" />
        {c.locality}
      </p>

      <dl className="mt-6 grid grid-cols-2 gap-x-4 gap-y-4">
        <div>
          <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-ink/40">
            Configurations
          </dt>
          <dd className="mt-1 text-sm font-medium text-ink">{c.configs}</dd>
        </div>
        <div>
          <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-ink/40">
            {c.sqft ? "Sizes" : c.acres ? "Site" : "Theme"}
          </dt>
          <dd className="mt-1 text-sm font-medium text-ink">
            {c.sqft
              ? `${c.sqft[0].toLocaleString("en-IN")} – ${c.sqft[1].toLocaleString("en-IN")} sqft`
              : c.acres
                ? `${c.acres} acres`
                : (c.theme ?? "—")}
          </dd>
        </div>
        {c.units && (
          <div>
            <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-ink/40">
              Scale
            </dt>
            <dd className="mt-1 text-sm font-medium text-ink">{c.units}</dd>
          </div>
        )}
        {c.theme && (c.sqft || c.acres) && (
          <div>
            <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-ink/40">
              Theme
            </dt>
            <dd className="mt-1 text-sm font-medium text-ink">{c.theme}</dd>
          </div>
        )}
      </dl>

      <ul className="mt-6 flex flex-wrap gap-1.5">
        {c.highlights.map((h) => (
          <li key={h} className="rounded-full bg-white px-3 py-1.5 text-[11px] text-ink/70 shadow-sm">
            {h}
          </li>
        ))}
      </ul>

      <div className="mt-auto pt-7">
        <div className="border-t border-ink/10 pt-5">
          {c.from === null ? (
            <p className="text-sm font-medium text-ink/60">Resale price on request</p>
          ) : (
            <p className="text-card-title font-medium tracking-[-0.02em] text-ink">
              {price(c.from)}{" "}
              <span className="text-xs font-normal text-body">indicative, from</span>
            </p>
          )}
          {c.alsoFrom && (
            <p className="mt-1 text-xs text-body">
              {c.alsoFrom.label} {price(c.alsoFrom.amount)}
            </p>
          )}
          <a
            href="#enquire"
            className="mt-4 inline-block rounded-full bg-panel px-5 py-2.5 text-xs font-medium text-white transition-transform hover:-translate-y-px"
          >
            Check availability →
          </a>
        </div>
      </div>
      </div>
    </article>
  );
}

export default function SobhaResalePage() {
  return (
    <main className="w-full overflow-clip bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
      />
      <LeadPopup />

      {/* ── Hero ─────────────────────────────────────────────────────────
          Text left, three-community mosaic right — see the note at the head of
          this file for why it is a mosaic and not a full-bleed plate. The lime
          wash behind it is a gradient, not an image, so the only hero download
          is the mosaic itself. No site Nav, same as the other microsites —
          this is a standalone lead-capture surface, not a way back into the
          main site. */}
      <section className="relative flex min-h-[640px] flex-col overflow-clip bg-panel md:min-h-[max(620px,92svh)]">
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(120%_90%_at_15%_0%,rgba(205,234,111,0.22),transparent_55%),radial-gradient(80%_70%_at_100%_100%,rgba(205,234,111,0.10),transparent_60%)]"
        />
        {/* Faint grid, to give the empty dark field some structure without
            pretending to be a photograph of anything. */}
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.18] [background-image:linear-gradient(to_right,rgba(255,255,255,0.16)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.16)_1px,transparent_1px)] [background-size:72px_72px]"
        />

        <div className="relative z-20 flex flex-1 flex-col justify-end px-8 pb-28 pt-20 md:px-14 lg:pb-14">
          <div className="grid items-end gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
          <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-lime px-4 py-2 text-xs font-semibold text-ink">
              {PAGE.status}
            </span>
            <span className="flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-semibold text-ink shadow-sm">
              <PinIcon className="h-3.5 w-3.5" />
              Bengaluru · East · North · South
            </span>
            {/* Stated in the hero, not buried in the disclaimer: the single
                most consequential fact about who is selling this to you. */}
            <span className="rounded-full bg-white/10 px-4 py-2 text-xs font-medium text-white/80 ring-1 ring-white/15 backdrop-blur">
              Independent advisory · not {PAGE.builder}
            </span>
          </div>

          <h1 className="mt-7 max-w-[14em] text-display font-medium tracking-[-0.03em] text-white">
            Sobha resale apartments in Bangalore
          </h1>

          <ul className="mt-6 flex max-w-[46em] flex-wrap gap-x-6 gap-y-2.5">
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
              Talk to an advisor
            </a>
            <a
              href="#portfolio"
              className="rounded-full bg-white/10 px-6 py-3 text-sm font-medium text-white ring-1 ring-white/20 backdrop-blur transition-transform hover:-translate-y-px"
            >
              See the communities
            </a>
          </div>
          </div>

            {/* Mosaic: one wide plate, two squares. Each is captioned with the
                community it actually shows, so no single render can read as
                standing for the whole portfolio. */}
            <figure className="min-w-0">
              <div className="grid grid-cols-2 gap-3">
                <div className="relative col-span-2 aspect-[16/9] overflow-hidden rounded-[24px] ring-1 ring-white/15">
                  <Image
                    src={HERO_MOSAIC[0].src}
                    alt={HERO_MOSAIC[0].alt}
                    fill
                    priority
                    sizes="(max-width: 1024px) 92vw, 44vw"
                    className="object-cover"
                  />
                  <span className="absolute bottom-3 left-3 rounded-full bg-ink/70 px-3 py-1.5 text-[10px] font-medium text-white/85 backdrop-blur">
                    {HERO_MOSAIC[0].label}
                  </span>
                </div>
                {HERO_MOSAIC.slice(1).map((m) => (
                  <div
                    key={m.src}
                    className="relative aspect-[4/3] overflow-hidden rounded-[20px] ring-1 ring-white/15"
                  >
                    <Image
                      src={m.src}
                      alt={m.alt}
                      fill
                      sizes="(max-width: 1024px) 46vw, 22vw"
                      className="object-cover"
                    />
                    <span className="absolute bottom-2.5 left-2.5 rounded-full bg-ink/70 px-2.5 py-1 text-[10px] font-medium text-white/85 backdrop-blur">
                      {m.label}
                    </span>
                  </div>
                ))}
              </div>
              <figcaption className="mt-3 text-[10px] tracking-wide text-white/35">
                {IMAGE_CREDIT}
              </figcaption>
            </figure>
          </div>

          {/* Stats sit below the two-column block, not inside the text column.
              On a phone that puts the mosaic directly after the CTAs, so the
              first thing below the fold is the projects themselves rather than
              four number tiles. */}
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

          <p className="mt-8 max-w-[44em] text-xs text-white/45">
            Indicative resale range {PRICE_SUMMARY}. Resale prices are set by individual owners, not
            by {PAGE.builder} — every figure here is a starting indication, not a quote.
          </p>
        </div>
      </section>

      {/* ── At a glance: corridors + price spread ──────────────────────── */}
      <div className="px-3 py-3">
        <div className="rounded-[28px] bg-panel px-8 py-14 md:px-14">
          <SectionHead
            dark
            eyebrow="At a glance"
            title="Where they are, and what they open at"
            lead="Both diagrams are derived from the community list below — nothing here is a separately maintained figure that can drift out of step with it."
          />

          <div className="mt-12 grid gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:items-start">
            <CorridorDiagram />
            <div>
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-lime">
                Entry price by community
              </h3>
              <div className="mt-7">
                <PriceLadder />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Portfolio ──────────────────────────────────────────────────────
          Split by possession status rather than presented as one list. A
          ready-to-move resale and an under-construction allotment transfer
          are different transactions — different inspection, different loan
          mechanics, different risk — so blending them into one grid sorted by
          price would hide the distinction that matters most. */}
      <section id="portfolio" className="scroll-mt-8 px-8 py-24 md:px-14">
        <SectionHead
          eyebrow="The portfolio"
          title={`${COMMUNITIES.length} Sobha communities on the secondary market`}
          lead={`Grouped by what you would actually be buying. Around fourteen Sobha communities trade on the Bengaluru secondary market; these are the ones carrying a published resale indication.`}
        />

        <div className="mt-14">
          <div className="flex items-center gap-4">
            <h3 className="text-subhead font-medium tracking-[-0.01em] text-ink">Ready to move</h3>
            <span className="rounded-full bg-limepale px-3 py-1 text-xs font-semibold text-ink">
              {READY.length}
            </span>
            <span className="hidden h-px flex-1 bg-ink/10 sm:block" />
          </div>
          <p className="mt-3 max-w-[38em] text-lead text-body">
            Inspectable today, valued on what is actually built, and the loan disburses in one
            tranche. What you see is what you are buying.
          </p>
          <div className={`mt-8 grid gap-4 ${track(READY.length)}`}>
            {READY.map((c) => (
              <CommunityCard key={c.name} c={c} />
            ))}
          </div>
        </div>

        <div className="mt-20">
          <div className="flex items-center gap-4">
            <h3 className="text-subhead font-medium tracking-[-0.01em] text-ink">
              Under construction
            </h3>
            <span className="rounded-full bg-limepale px-3 py-1 text-xs font-semibold text-ink">
              {UNDER_CONSTRUCTION.length}
            </span>
            <span className="hidden h-px flex-1 bg-ink/10 sm:block" />
          </div>
          <p className="mt-3 max-w-[38em] text-lead text-body">
            You are taking over the original buyer&apos;s allotment. The builder has to consent to
            the transfer, the remaining payments follow the developer&apos;s milestones, and the
            possession date that counts is your wing&apos;s, not the project&apos;s.
          </p>
          <div className={`mt-8 grid gap-4 ${track(UNDER_CONSTRUCTION.length)}`}>
            {UNDER_CONSTRUCTION.map((c) => (
              <CommunityCard key={c.name} c={c} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Corridors ──────────────────────────────────────────────────── */}
      <section className="bg-cream px-8 py-24 md:px-14">
        <SectionHead
          eyebrow="Corridors"
          title="Location decides the resale price"
          lead="On the secondary market the corridor does more work than the community. Two Sobha towers of the same vintage can sit a lakh per unit apart on nothing but which side of the ORR they are on."
        />

        <div className="mt-14 grid gap-4 lg:grid-cols-3">
          {SECTORS.map((s) => (
            <div key={s.key} className="flex flex-col rounded-[24px] bg-white p-8 shadow-sm">
              <div className="flex items-baseline justify-between gap-4">
                <h3 className="text-subhead font-medium tracking-[-0.01em] text-ink">{s.label}</h3>
                {/* "detailed", not "available" — a zero here means we have no
                    published resale indication to show for that corridor, not
                    that nothing in it trades. */}
                <span className="shrink-0 text-xs font-semibold text-ink/50">
                  {SECTOR_COUNTS[s.key]} detailed
                </span>
              </div>
              <p className="mt-4 text-lead text-body">{s.blurb}</p>
              {SECTOR_COUNTS[s.key] === 0 && (
                <>
                  <figure className="mt-6">
                    <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-ink/10">
                      <Image
                        src={SOUTH_IMAGE.src}
                        alt={SOUTH_IMAGE.alt}
                        fill
                        sizes="(max-width: 1024px) 92vw, 30vw"
                        className="object-cover"
                      />
                    </div>
                    <figcaption className="mt-2.5 text-[11px] text-ink/50">
                      {SOUTH_IMAGE.caption}
                    </figcaption>
                  </figure>
                  <p className="mt-4 text-xs font-medium text-ink/50">
                    Nothing with a published resale indication in this corridor right now — ask and
                    we&apos;ll check what is actually trading.
                  </p>
                </>
              )}

              <ul className="mt-7 flex flex-col gap-3">
                {s.connectivity.map((c) => (
                  <li key={c.text} className="flex items-start gap-3 text-sm text-ink/75">
                    <span className="mt-px flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-limepale text-ink">
                      <c.Icon className="h-[16px] w-[16px]" />
                    </span>
                    {c.text}
                  </li>
                ))}
              </ul>

              <div className="mt-auto pt-7">
                <ul className="flex flex-wrap gap-1.5">
                  {s.localities.map((l) => (
                    <li
                      key={l}
                      className="rounded-full bg-ink/5 px-3 py-1.5 text-[11px] font-medium text-ink/70"
                    >
                      {l}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-8 max-w-[44em] text-xs text-body">
          Drive times and metro references are approximate and depend entirely on the hour you
          travel. Test your own commute at the time you would actually be making it — step two of
          the process below exists for this reason.
        </p>
      </section>

      {/* ── Why us ─────────────────────────────────────────────────────── */}
      <section className="px-8 py-24 md:px-14">
        <SectionHead
          eyebrow="Why through us"
          title="What an advisor is actually for"
          lead="Resale has no builder desk to sit at. The work is verification and coordination, and it is all done before you pay a token."
        />
        <div className="mt-12 grid gap-3 sm:grid-cols-2">
          {WHY.map((w) => (
            <div key={w.title} className="rounded-[24px] bg-ink/[0.03] px-7 py-8">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-limepale text-ink">
                <w.Icon className="h-[18px] w-[18px]" />
              </span>
              <h3 className="mt-5 text-subhead font-medium tracking-[-0.01em] text-ink">
                {w.title}
              </h3>
              <p className="mt-3 text-lead text-body">{w.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Process ────────────────────────────────────────────────────── */}
      <section id="process" className="scroll-mt-8 bg-cream px-8 py-24 md:px-14">
        <SectionHead
          eyebrow="Step by step"
          title="How a Sobha resale purchase actually runs"
          lead="Seven steps, in the order they have to happen. The ones people skip are three and four, and they are the two that collapse deals."
        />
        <ol className="mt-14 grid gap-4 md:grid-cols-2">
          {PROCESS.map((s, i) => (
            <li key={s.title} className="flex gap-5 rounded-[24px] bg-white p-7 shadow-sm">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-panel text-xs font-bold text-lime">
                {i + 1}
              </span>
              <div>
                <h3 className="text-base font-medium tracking-[-0.01em] text-ink">{s.title}</h3>
                <p className="mt-2 text-lead text-body">{s.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* ── Pitfalls ───────────────────────────────────────────────────── */}
      <section className="px-8 py-24 md:px-14">
        <SectionHead
          eyebrow="Before you commit"
          title="Three things collapse most resale deals"
          lead="None of them are exotic. All three are cheap to check early and expensive to discover late."
        />
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {PITFALLS.map((p) => (
            <div key={p.title} className="rounded-[24px] bg-limepale px-7 py-8">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-panel text-lime">
                <CheckIcon className="h-[16px] w-[16px]" />
              </span>
              <h3 className="mt-5 text-base font-medium tracking-[-0.01em] text-ink">{p.title}</h3>
              <p className="mt-2.5 text-sm leading-relaxed text-ink/70">{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Enquire + form ────────────────────────────────────────────────
          Form hoisted above the copy on mobile, same as the other three
          microsites — on a page whose one job is the enquiry, the form should
          not be below three paragraphs on a phone. */}
      <section id="enquire" className="scroll-mt-8 px-3 py-3">
        <div className="rounded-[28px] bg-panel px-8 py-16 md:px-14">
          <div className="grid gap-14 lg:grid-cols-2">
            <div className="order-2 lg:order-1">
              <SectionHead
                dark
                eyebrow="Enquiry"
                title="Tell us the corridor and the budget"
                lead="Resale inventory turns over weekly and the good units never reach a portal. Send us what you are after and an advisor will come back with what is genuinely available, by unit — floor, facing, dues position and all."
              />

              <ul className="mt-11 flex flex-col gap-3">
                {[
                  "A real advisor reads every message",
                  "Typical reply within 2 hours",
                  "Verification before you see a price, not after",
                  "No obligation and no call-centre scripts",
                ].map((p) => (
                  <li key={p} className="flex items-start gap-3 text-sm text-white/70">
                    <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-lime" />
                    {p}
                  </li>
                ))}
              </ul>

              <div className="mt-11">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/40">
                  Localities we cover
                </p>
                <ul className="mt-4 flex flex-wrap gap-1.5">
                  {LOCALITIES.map((l) => (
                    <li key={l}>
                      <Link
                        href={`/listings?q=${encodeURIComponent(l)}`}
                        className="inline-block rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-medium text-white/70 ring-1 ring-white/10 transition-colors hover:bg-white/20 hover:text-white"
                      >
                        {l}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <p className="mt-10 text-xs text-white/40">
                Not set on Sobha?{" "}
                <Link href="/listings" className="text-lime underline underline-offset-4">
                  Browse every verified resale home
                </Link>{" "}
                or{" "}
                <Link href="/contact" className="text-lime underline underline-offset-4">
                  talk to an agent
                </Link>{" "}
                about what else fits the same budget.
              </p>
            </div>

            <div className="order-1 lg:order-2">
              <div className="mb-8 lg:hidden">
                <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-lime">
                  Enquiry
                </span>
                <h2 className="mt-3 text-section font-medium tracking-[-0.02em] text-white">
                  Tell us the corridor and the budget
                </h2>
                <p className="mt-3 text-sm text-white/60">
                  An advisor will come back with what is actually available, unit by unit.
                </p>
              </div>
              <LeadForm
                dark
                subject="Sobha resale: portfolio enquiry"
                cta="Request availability"
                endpoint="/api/leads/sobha-resale"
                source="sobha-resale-inline"
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
                <span className="text-subhead font-medium tracking-[-0.01em] text-ink">{f.q}</span>
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
            Diggaj Realty is an independent resale advisory and is not the builder, developer or
            promoter of any project named on this page, nor an agent of Sobha Limited. Sobha, and
            each project name used here, are the property of their respective owners and are
            referenced for identification only. Every figure on this page — indicative resale
            prices, unit sizes, land areas, unit counts, configurations, possession status,
            amenity names, drive times and metro references — is compiled from secondary-market
            listing material and comparable public sources, not from Sobha Limited&apos;s own
            price lists or approvals, and is subject to change without notice. No builder issues a
            price list for resale stock: prices are set by individual owners and the figure shown
            is a starting indication only, exclusive of stamp duty, registration charges, builder
            transfer and NOC charges, association corpus or maintenance dues, parking, and legal
            and loan processing costs. Possession dates on phased projects vary by tower and wing,
            and a project-level date does not apply to every unit within it. The corridor diagram
            is a schematic drawn for orientation, not a map, a survey or a planning document. All
            project images on this page are marketing renders and photographs sourced from
            sobharesale.in, an independent secondary-market consultancy, rather than from Sobha
            Limited&apos;s own website; their authenticity and rights have not been verified, they
            show the community as a whole rather than any unit offered for sale, and no image here
            depicts the specific flat you would be buying.
            Nothing on this page is an offer, an invitation to offer, or a contract, and none of
            it is investment advice. Verify the RERA registration number, phase, title chain,
            encumbrance position and all approvals directly with the seller, the developer and the
            Karnataka RERA portal before paying any amount, including a token advance.
          </p>
        </div>
      </section>

      <Footer />

      {/* Sticky conversion bar, small screens only. Pure CSS, no scroll
          listener, so the page stays a zero-JS server component. The spacer
          below keeps it off the last of the footer. */}
      <div className="fixed inset-x-3 bottom-3 z-40 flex items-center justify-between gap-4 rounded-full bg-panel/95 px-5 py-3 shadow-2xl ring-1 ring-white/10 backdrop-blur lg:hidden">
        <span className="min-w-0 flex-1 text-xs leading-tight text-white/60">
          <span className="block truncate font-semibold text-white">
            {COMMUNITIES.length} Sobha communities
          </span>
          <span className="block">
            From <span className="font-semibold text-white/90">{price(FROM_PRICE)}</span> indicative
          </span>
        </span>
        <a
          href="#enquire"
          className="shrink-0 rounded-full bg-lime px-5 py-2 text-xs font-semibold text-ink"
        >
          Enquire
        </a>
      </div>
      <div className="h-20 lg:hidden" aria-hidden />
    </main>
  );
}
