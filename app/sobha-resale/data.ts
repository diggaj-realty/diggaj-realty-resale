import type { ComponentType } from "react";
import { price } from "@/lib/listings";
import {
  GridIcon,
  KeyIcon,
  ShieldIcon,
  TrainIcon,
  BriefcaseIcon,
  CapIcon,
  CompassIcon,
  FrameIcon,
  DropletIcon,
  CoffeeIcon,
} from "../brigade-granada/icons";

// Content for the Sobha resale portfolio microsite.
//
// This one differs in kind from the other three microsites: Brigade Granada,
// Myhna Vistara and Sobha One World are each ONE project with one price list.
// This is a *portfolio* page across Sobha's Bengaluru communities on the
// secondary market, so the primary unit of content is COMMUNITIES below, not
// a single PROJECT + CONFIGS pair.
//
// Figures are indicative resale asking bands compiled from secondary-market
// listing material (sobharesale.in and comparable resale channels), NOT from
// Sobha Limited's own price lists — no builder issues a price list for resale
// stock, because the seller is a private owner. Read the DISCLAIMER block in
// page.tsx before changing how any of it is presented.
//
// Icons are reused from the Brigade Granada microsite's icon set — generic,
// server-safe SVGs with no project-specific content.

type Icon = ComponentType<{ className?: string }>;

export const PAGE = {
  title: "Sobha resale apartments in Bangalore",
  city: "Bangalore",
  builder: "Sobha Limited",
  /** Communities set out in full below. The wider Sobha footprint on the
   *  secondary market runs to roughly fourteen across the three corridors;
   *  only the ones with a published resale indication are detailed here. */
  portfolioNote: "~14 Sobha communities across three corridors",
  status: "Resale · Secondary market",
};

/* ── Imagery ──────────────────────────────────────────────────────────────
 * Every render on this page is sourced from sobharesale.in, an independent
 * secondary-market consultancy, NOT from Sobha Limited's own domain — the same
 * provenance situation as the Brigade Granada and Sobha One World microsites,
 * and captioned as such wherever it appears. Authenticity and rights are
 * unverified; see the DISCLAIMER block in page.tsx.
 *
 * The files are 416–1000px wide at source, which is why there is no full-bleed
 * hero photograph: stretching a 1000px render across a 1440px+ viewport is
 * visibly soft. The hero uses a mosaic sized to stay within native resolution
 * instead, and the cards render at ~420px where these files are comfortable. */
export const IMAGE_CREDIT = "Renders via sobharesale.in, not Sobha's own site";

const IMG = "/img/sobha-resale";

/** One Sobha community available on the secondary market.
 *
 *  `from` is a rupee integer, not a display string — `price()` renders it and
 *  the entry-price ladder derives its bar widths from it, so a number is the
 *  only representation that both uses can share. `from: null` means the
 *  community is tracked but has no published resale indication; those render
 *  as "On request" rather than being silently dropped. */
export type Community = {
  name: string;
  locality: string;
  /** Project render. One per community — no community borrows another's. */
  image: string;
  imageAlt: string;
  sector: "East" | "North" | "South";
  status: "Ready to move" | "Under construction";
  configs: string;
  sqft?: [number, number];
  from: number | null;
  /** Second price line, where a community sells two very different products. */
  alsoFrom?: { label: string; amount: number };
  acres?: number;
  units?: string;
  theme?: string;
  highlights: string[];
};

export const COMMUNITIES: Community[] = [
  {
    name: "Sobha Dream Acres",
    image: `${IMG}/sobha-dream-acres.webp`,
    imageAlt: "Sobha Dream Acres towers above landscaped lawns and the retail plaza",
    locality: "Balagere, Panathur Main Road (off ORR)",
    sector: "East",
    status: "Ready to move",
    configs: "1 · 2 BHK",
    sqft: [656, 1_210],
    from: 8_200_000,
    theme: "Large-format township",
    highlights: ["Phase 1 clubhouse", "Cycling track", "Gated entry plaza"],
  },
  {
    name: "Sobha Windsor",
    image: `${IMG}/sobha-windsor-1.webp`,
    imageAlt: "Sobha Windsor's English-manor facades around the pool courtyard",
    locality: "Whitefield",
    sector: "East",
    status: "Ready to move",
    configs: "3 · 4 BHK",
    sqft: [1_550, 2_292],
    from: 21_500_000,
    theme: "English manor",
    highlights: ["Amphitheatre", "Swimming pool", "Putting green"],
  },
  {
    name: "Sobha Lake Garden",
    image: `${IMG}/sobha-lake-gardens.webp`,
    imageAlt: "Sobha Lake Garden towers seen across the water",
    locality: "Bharathi Nagar, KR Puram",
    sector: "East",
    status: "Ready to move",
    configs: "2 · 3 BHK",
    from: 10_200_000,
    acres: 8.89,
    units: "597 units",
    theme: "Lakeside",
    highlights: ["Lake-facing tiers", "KR Puram rail hub nearby"],
  },
  {
    name: "Sobha Neopolis",
    image: `${IMG}/sobha-neopolis.webp`,
    imageAlt: "Sobha Neopolis, Greek-island themed towers and clubhouse",
    locality: "Panathur Main Road, off Marathahalli–ORR",
    sector: "East",
    status: "Under construction",
    configs: "1 · 3 · 4 BHK",
    sqft: [660, 2_481],
    from: 11_000_000,
    theme: "Greek islands",
    highlights: ["Club Athinios", "Olympus Plaza", "BBQ and picnic park"],
  },
  {
    name: "Sobha Sentosa",
    image: `${IMG}/sobha-sentosa.webp`,
    imageAlt: "Sobha Sentosa's Singapore-themed towers",
    locality: "Panathur Main Road",
    sector: "East",
    status: "Under construction",
    configs: "3 BHK",
    sqft: [1_507, 1_804],
    from: 15_000_000,
    theme: "Singapore",
    highlights: ["Merlion pool", "Supertree garden", "Clubhouse"],
  },
  {
    name: "Sobha Ayana",
    image: `${IMG}/sobha-ayana.webp`,
    imageAlt: "Sobha Ayana, modern tropical elevation inside Dream Acres",
    locality: "Panathur Road, within Sobha Dream Acres",
    sector: "East",
    status: "Under construction",
    configs: "3 BHK",
    from: 23_000_000,
    acres: 6.28,
    units: "683 units",
    theme: "Modern tropical",
    highlights: ["Inside the Dream Acres township", "Shared township amenities"],
  },
  {
    name: "Sobha Royal Pavilion",
    image: `${IMG}/sobha-royal-pavilion.webp`,
    imageAlt: "Sobha Royal Pavilion's Rajasthani-palace styling",
    locality: "Hadosiddapura, Marathahalli–Sarjapur Road",
    sector: "East",
    status: "Under construction",
    configs: "2 · 3 · 4 BHK",
    from: 17_000_000,
    acres: 23.6,
    units: "1,284 units",
    theme: "Rajasthani palace",
    highlights: ["Largest of the east-corridor sites", "Sarjapur Road access"],
  },
  {
    name: "Sobha HRC Pristine",
    image: `${IMG}/sobha-hrc-pristine.webp`,
    imageAlt: "Sobha HRC Pristine, low-density towers in the Jakkur green belt",
    locality: "Jakkur",
    sector: "North",
    status: "Ready to move",
    configs: "2 · 3 · 4 BHK",
    from: 16_400_000,
    acres: 8.49,
    units: "~381 units",
    theme: "Nature sanctuary",
    highlights: ["Low-density plan", "Jakkur lake and aerodrome belt"],
  },
  {
    name: "Sobha Victoria Park",
    image: `${IMG}/sobha-victoria-park.webp`,
    imageAlt: "Sobha Victoria Park's Victorian-styled apartments and row houses",
    locality: "Off Hennur Main Road",
    sector: "North",
    status: "Under construction",
    configs: "2 · 3 BHK · Row houses",
    from: 16_000_000,
    alsoFrom: { label: "Row houses from", amount: 38_500_000 },
    acres: 6.5,
    units: "300 apartments + 19 row houses",
    theme: "Victorian",
    highlights: ["Apartments and row houses on one site", "Airport corridor"],
  },
  {
    name: "Sobha Dream Gardens",
    image: `${IMG}/sobha-dream-gardens.webp`,
    imageAlt: "Sobha Dream Gardens, Zen-themed compact-format towers",
    locality: "Mitganahalli, off Thanisandra Main Road",
    sector: "North",
    status: "Under construction",
    configs: "1 · 2 BHK",
    from: null,
    acres: 17,
    units: "1,780 units",
    theme: "Zen / Ikigai",
    highlights: ["Compact-format inventory", "Thanisandra growth belt"],
  },
];

export const READY = COMMUNITIES.filter((c) => c.status === "Ready to move");
export const UNDER_CONSTRUCTION = COMMUNITIES.filter((c) => c.status === "Under construction");

/** Communities carrying a published resale indication, cheapest first — the
 *  entry-price ladder's source. Sorting here rather than in the page keeps
 *  the page layout-only. */
export const PRICED = COMMUNITIES.filter(
  (c): c is Community & { from: number } => c.from !== null
).sort((a, b) => a.from - b.from);

export const FROM_PRICE = Math.min(...PRICED.map((c) => c.from));
export const TOP_PRICE = Math.max(...PRICED.map((c) => c.from));

/** e.g. "From ₹82 L to ₹2.3 Cr" — one string, two derived numbers, so the
 *  hero and the sticky bar can never drift apart from the table. */
export const PRICE_SUMMARY = `${price(FROM_PRICE)} – ${price(TOP_PRICE)}`;

/** Hero mosaic — one wide plate plus two squares, chosen so each renders at or
 *  below its native width (the sources top out at 1000px, which is why there is
 *  no single full-bleed hero image). Deliberately three *different* communities
 *  and all three ready or nearly so: the hero should not imply that one
 *  project's render represents the whole portfolio. */
export const HERO_MOSAIC: { src: string; alt: string; label: string }[] = [
  {
    src: `${IMG}/sobha-dream-acres-1.webp`,
    alt: "Completed Sobha Dream Acres towers above the landscaped podium and retail plaza",
    label: "Dream Acres · Balagere",
  },
  {
    src: `${IMG}/sobha-neopolis-1.webp`,
    alt: "Sobha Neopolis towers, Greek-island themed elevation",
    label: "Neopolis · Panathur",
  },
  {
    src: `${IMG}/sobha-sentosa-1.webp`,
    alt: "Sobha Sentosa towers and pool deck",
    label: "Sentosa · Panathur",
  },
];

/** The south corridor has no community with a published resale indication, so
 *  its card would otherwise be the only one with nothing to show. Sobha Town
 *  Park is the project that trades there; the render is captioned to say
 *  exactly that, rather than implying a listing we do not have. */
export const SOUTH_IMAGE = {
  src: `${IMG}/sobha-townpark.webp`,
  alt: "Sobha Town Park, the south-corridor Sobha community",
  caption: "Sobha Town Park — the south-corridor community, no resale indication published yet",
};

export const HERO_POINTS: string[] = [
  "Ten Sobha communities with live resale indications, across east and north Bengaluru",
  "Ready-to-move and under-construction stock, separated rather than blended",
  "Title, khata, encumbrance and builder-NOC checks before you pay a token",
  "One advisor from shortlist through registration",
];

export const HERO_STATS: { value: string; label: string }[] = [
  { value: `${COMMUNITIES.length}`, label: "Communities detailed" },
  { value: "3", label: "City corridors" },
  { value: price(FROM_PRICE), label: "Entry price" },
  { value: `${READY.length}`, label: "Ready to move" },
];

/* ── Why buy resale through us ──────────────────────────────────────────── */

export const WHY: { title: string; body: string; Icon: Icon }[] = [
  {
    title: "RERA cross-checked, unit by unit",
    body: "Every community here is matched against its Karnataka RERA entry before it goes on a shortlist, and the specific tower and phase your unit sits in is confirmed — not just the project name.",
    Icon: ShieldIcon,
  },
  {
    title: "Possession read by wing, not by brochure",
    body: "Large Sobha sites hand over in phases, and wings inside one phase can be years apart. We tell you the date attached to your unit, which is often not the date being quoted to you.",
    Icon: KeyIcon,
  },
  {
    title: "Like-for-like comparison",
    body: "Built-up area, carpet area, floor, facing and entry price lined up across communities, so a ₹1.6 Cr unit in Jakkur can actually be weighed against a ₹1.5 Cr one on Panathur Road.",
    Icon: GridIcon,
  },
  {
    title: "Paperwork carried to registration",
    body: "Loan balance transfers, seller no-dues, builder NOC and transfer charges, and the sub-registrar appointment — coordinated by one person rather than handed back to you at each step.",
    Icon: FrameIcon,
  },
];

/* ── Corridors ──────────────────────────────────────────────────────────── */

export const SECTORS: {
  key: "East" | "North" | "South";
  label: string;
  blurb: string;
  localities: string[];
  connectivity: { text: string; Icon: Icon }[];
}[] = [
  {
    key: "East",
    label: "East Bengaluru",
    blurb:
      "The IT corridor along the Outer Ring Road and Whitefield. The deepest Sobha resale inventory in the city, and the tightest correlation between a ten-minute commute difference and price.",
    localities: ["Whitefield", "Panathur", "Balagere", "Marathahalli", "Sarjapur Road", "KR Puram"],
    connectivity: [
      { text: "ORR tech parks roughly 10 minutes from the Panathur cluster", Icon: BriefcaseIcon },
      { text: "Purple Line metro through Whitefield and KR Puram", Icon: TrainIcon },
      { text: "Schools and hospitals already built out, not promised", Icon: CapIcon },
    ],
  },
  {
    key: "North",
    label: "North Bengaluru",
    blurb:
      "The airport-led growth belt from Hennur through Thanisandra to Devanahalli. Newer stock, lower density, and the corridor where under-construction resale is most common.",
    localities: ["Hennur", "Thanisandra", "Jakkur", "Devanahalli"],
    connectivity: [
      { text: "Kempegowda airport 25–30 minutes from Hennur via NH44", Icon: CompassIcon },
      { text: "Hebbal and the Bellary Road employment spine", Icon: BriefcaseIcon },
      { text: "Jakkur and Hebbal lake belt", Icon: DropletIcon },
    ],
  },
  {
    key: "South",
    label: "South Bengaluru",
    blurb:
      "Electronic City, Banashankari and the Mysore Road axis — mature, fully-serviced neighbourhoods where resale is the main way in, because there is little new land left to launch on.",
    localities: ["Electronic City", "Banashankari", "Mysore Road"],
    connectivity: [
      { text: "Yellow Line metro to Electronic City", Icon: TrainIcon },
      { text: "Elevated expressway into the city core", Icon: CompassIcon },
      { text: "Established retail and schooling", Icon: CoffeeIcon },
    ],
  },
];

/** Communities per corridor, derived — the sector cards show a count and it
 *  must not be maintained separately from COMMUNITIES. */
export const SECTOR_COUNTS: Record<"East" | "North" | "South", number> = {
  East: COMMUNITIES.filter((c) => c.sector === "East").length,
  North: COMMUNITIES.filter((c) => c.sector === "North").length,
  South: COMMUNITIES.filter((c) => c.sector === "South").length,
};

/* ── Buying process ─────────────────────────────────────────────────────── */

export const PROCESS: { title: string; body: string }[] = [
  {
    title: "Fix the corridor before the community",
    body: "Decide where you need to be on a Tuesday morning first. Corridor narrows the list to a handful of communities; doing it the other way round produces a shortlist you will not want to live in.",
  },
  {
    title: "See the actual unit, twice",
    body: "Not the show flat and not a sister unit. Check seepage marks, flooring, water pressure and the ceiling under the bathroom above. Go once on a weekday morning to test the commute and once at the weekend to see how full the amenities really get.",
  },
  {
    title: "Trace the title all the way back",
    body: "Mother deed, every subsequent sale deed, khata and its extract, paid property tax receipts, and an encumbrance certificate covering the full period. Confirm the RERA number and, on a phased project, which phase your tower belongs to.",
  },
  {
    title: "Clear dues, loans and the builder NOC",
    body: "Any outstanding home loan on the flat, association no-dues, current-year property tax, and the builder's transfer NOC with its transfer charge. This is where most resale deals stall.",
  },
  {
    title: "Arrange financing and the valuation",
    body: "Get pre-approved before you commit. The lender runs its own valuation, and on a resale unit it often lands below the asking price — that gap is yours to fund, so find it early.",
  },
  {
    title: "Agreement to sell, then the token",
    body: "In writing, before money moves: price, what is included, token amount, the timeline to registration, who pays which cost, and what happens if either side walks away.",
  },
  {
    title: "Registration and handover",
    body: "Registration at the sub-registrar at the stamp duty and registration rates in force on the day, then khata transfer, association records and the utility accounts moved into your name.",
  },
];

export const PITFALLS: { title: string; body: string }[] = [
  {
    title: "An unclosed home loan",
    body: "The seller's bank still holds the original documents. Until that loan is closed and the originals are retrieved, there is nothing to register against.",
  },
  {
    title: "Dues that surface at the no-dues stage",
    body: "Unpaid maintenance or property tax turns up at the end, when the deposit is already paid and the timeline has no slack in it.",
  },
  {
    title: "A possession date from a different wing",
    body: "On a phased site, the date being quoted often belongs to a wing that is not the one being sold. It is the single most common misunderstanding in Bengaluru resale.",
  },
];

/* ── Neighbourhood chips ────────────────────────────────────────────────── */

export const LOCALITIES: string[] = [
  "Whitefield",
  "Panathur",
  "Balagere",
  "Sarjapur Road",
  "Marathahalli",
  "KR Puram",
  "Hennur",
  "Thanisandra",
  "Jakkur",
  "Devanahalli",
  "Electronic City",
  "Banashankari",
];

/* ── FAQ ────────────────────────────────────────────────────────────────── */

export const FAQS: { q: string; a: string }[] = [
  {
    q: "Is Diggaj Realty part of Sobha Limited?",
    a: "No. Diggaj Realty is an independent resale advisory. We are not the builder, developer or promoter of any Sobha project, and we do not sell inventory on Sobha's behalf. Sobha and the project names on this page belong to their respective owners and are used here to identify the communities we help buyers transact in.",
  },
  {
    q: "Where do the prices on this page come from?",
    a: "They are indicative entry-level asking prices compiled from secondary-market listing material, not a builder price list. No builder publishes a price list for resale stock, because the seller is a private owner. What a specific unit actually costs depends on its floor, facing, condition, parking, corpus contribution and how motivated the seller is — expect the real number to move in both directions from what is shown here.",
  },
  {
    q: "What is the difference between a ready-to-move and an under-construction resale unit?",
    a: "A ready unit can be inspected, valued and occupied immediately, and the loan disburses in one shot. An under-construction resale means you are taking over the original buyer's allotment: the builder has to consent to the transfer, the payment schedule continues on the developer's milestones, and the possession date attached to your specific wing matters far more than the project-level date.",
  },
  {
    q: "What do you check before showing me a unit?",
    a: "The Karnataka RERA entry and which phase the tower sits in, the title chain and mother deed, khata and its extract, an encumbrance certificate, paid property tax, association no-dues, and whether the builder will issue a transfer NOC and at what charge.",
  },
  {
    q: "Can I get a home loan on a resale flat?",
    a: "Yes, and most buyers do. If the seller has an outstanding loan it is handled as a balance transfer, with your lender paying off theirs and collecting the original documents directly. Budget for the lender's own valuation coming in below the asking price; the difference has to be funded by you.",
  },
  {
    q: "What costs sit on top of the price?",
    a: "Karnataka stamp duty and registration charges at the rates in force on your registration date, the builder's transfer fee and NOC charge, any corpus or maintenance deposit the association requires, and your own legal and loan processing costs. Ask for these in writing before the token, not after.",
  },
  {
    q: "How long does a resale purchase take?",
    a: "Once the title is clear and the seller's loan position is known, the timeline is driven by loan sanction and the builder's NOC turnaround rather than by anything either party controls. The deals that run long are almost always the ones where an outstanding loan or unpaid dues were discovered late.",
  },
  {
    q: "Do you cover Sobha projects that are not on this page?",
    a: "Yes. Around fourteen Sobha communities across the three corridors trade on the secondary market; the ones set out here are those with a published resale indication at the time of writing. Tell us the project you are after and we will find out what is genuinely available in it.",
  },
];
