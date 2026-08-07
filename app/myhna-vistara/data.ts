import type { ComponentType } from "react";
import { price } from "@/lib/listings";
import {
  AcreIcon,
  LayersIcon,
  GridIcon,
  BedIcon,
  KeyIcon,
  FlagIcon,
  ShopIcon,
  TrophyIcon,
  LeafIcon,
  DiceIcon,
  CoffeeIcon,
  ShieldIcon,
  TrainIcon,
  BriefcaseIcon,
  CapIcon,
  CrossIcon,
  FrameIcon,
  FloorIcon,
  DoorIcon,
  CompassIcon,
} from "../brigade-granada/icons";

// Content for the Myhna Vistara project microsite, sourced from
// myhnaproperties.in/myhna-vistara — a page run by "an authorized channel
// partner of Myhna Properties" per its own disclaimer, not necessarily
// Myhna's own primary domain. RERA-approved (PRM/KA/RERA/1251/446/PR/040226/
// 008447); as of the source's July 2026 update the project is in early
// foundation works, having just moved past pre-launch. See the DISCLAIMER
// block in page.tsx before changing how any of it renders. Icons reused from
// the Brigade Granada microsite's generic icon set.

type Icon = ComponentType<{ className?: string }>;

export const PROJECT = {
  name: "Myhna Vistara",
  developer: "Myhna Properties",
  alsoKnownAs: "Codename: Unbounded Living",
  address: "150-ft CDP Road, Gunjur, East Bangalore, Karnataka",
  locality: "Gunjur",
  city: "Bangalore",
  rera: "PRM/KA/RERA/1251/446/PR/040226/008447",
  status: "Booking open · First 51 units on offer",
};

export const FACTS: { label: string; value: string; note?: string; Icon: Icon }[] = [
  { label: "Land area", value: "14 acres", note: "9 residential + 5 commercial", Icon: AcreIcon },
  { label: "Structure", value: "G+31", note: "6 towers, A–F", Icon: LayersIcon },
  { label: "Total units", value: "1,120", note: "Luxury apartments", Icon: GridIcon },
  { label: "Configurations", value: "3–4 BHK", note: "1,670 – 2,485 sqft", Icon: BedIcon },
  { label: "Possession", value: "Jun 2029", note: "RERA deadline Dec 2030", Icon: KeyIcon },
  { label: "Status", value: "Booking open", note: "First 51 units offer", Icon: FlagIcon },
];

// Rupee amounts, not display strings — `price()` renders them, and the ₹/sqft
// figure plus the size bars are derived from these two numbers rather than
// stated separately. Labels ("Luxury" / "Premium" / "Elite") are the
// developer's own tier names for its three published configurations. The
// source site's intro paragraph also mentions "1,180 sq ft" in passing, but
// its own configuration table — the more specific, itemized source — only
// lists these three, so that smaller figure isn't reproduced here.
export const CONFIGS: { label: string; sqft: number; from: number }[] = [
  { label: "Luxury 3 BHK", sqft: 1_700, from: 18_000_000 },
  { label: "Premium 3 BHK", sqft: 1_870, from: 19_700_000 },
  { label: "Elite 4 BHK", sqft: 2_485, from: 25_600_000 },
];

export const MAX_SQFT = Math.max(...CONFIGS.map((c) => c.sqft));

/** Cheapest layout — drives the hero stat and the sticky CTA's "from" price. */
export const FROM_PRICE = Math.min(...CONFIGS.map((c) => c.from));
/** Dearest layout. Derived rather than read off the last row, so reordering
 *  CONFIGS can't silently produce a wrong price range. */
export const TOP_PRICE = Math.max(...CONFIGS.map((c) => c.from));

export const perSqft = (from: number, sqft: number) =>
  `₹${Math.round(from / sqft).toLocaleString("en-IN")}`;

/** The four numbers that carry the hero. Kept short — they sit in a row of
 *  glass tiles over the image, where a full sentence would not read. */
export const HERO_STATS: { value: string; label: string }[] = [
  { value: "14", label: "Acres" },
  { value: "G+31", label: "Floors" },
  { value: "1,120", label: "Homes" },
  { value: price(FROM_PRICE), label: "Starting price" },
];

export const MIXED_USE: { title: string; body: string; Icon: Icon }[] = [
  {
    title: "1 lakh sqft commercial block",
    body: "A dedicated 5-acre commercial component alongside the 9 residential acres — daily conveniences without leaving the township.",
    Icon: ShopIcon,
  },
  {
    title: "45,000 sqft clubhouse",
    body: "Large enough to hold the 70-plus listed amenities without them competing for the same shared spaces.",
    Icon: TrophyIcon,
  },
  {
    title: "Zero common walls",
    body: "Every unit is independent on all sides with 7-foot-wide balconies — the developer's stated reason for the villa-like privacy claim.",
    Icon: LeafIcon,
  },
];

export const AMENITIES: { group: string; items: string[]; Icon: Icon }[] = [
  {
    group: "Sport",
    Icon: TrophyIcon,
    items: [
      "Tennis court",
      "Squash court",
      "Basketball court",
      "Cricket pitch",
      "Jogging track",
    ],
  },
  {
    group: "Wellness",
    Icon: LeafIcon,
    items: [
      "Temperature-controlled infinity pool",
      "Yoga & meditation deck",
      "Zen garden",
      "Butterfly garden",
      "Senior citizen lounge",
    ],
  },
  {
    group: "Recreation",
    Icon: DiceIcon,
    items: ["45,000 sqft clubhouse", "Gymnasium", "Children's play area"],
  },
  {
    group: "Everyday",
    Icon: CoffeeIcon,
    items: ["EV charging points", "Commercial block on-site"],
  },
  {
    group: "Safety & utilities",
    Icon: ShieldIcon,
    items: ["24/7 security", "Water treatment plant", "Power backup"],
  },
];

export const CONNECTIVITY: {
  group: string;
  Icon: Icon;
  items: { name: string; away: string }[];
}[] = [
  {
    group: "Transit",
    Icon: TrainIcon,
    items: [
      { name: "150-ft CDP Road", away: "Frontage" },
      { name: "Bellandur / Karmelram Rail", away: "3 km" },
      { name: "Outer Ring Road", away: "7–8 km" },
      { name: "Whitefield", away: "8–10 km" },
    ],
  },
  {
    group: "Workplaces",
    Icon: BriefcaseIcon,
    items: [
      { name: "Wipro SEZ / RGA Tech Park", away: "4–5 km" },
      { name: "Sigma Soft Tech Park", away: "5 km" },
      { name: "Embassy Tech Village", away: "7–8 km" },
      { name: "RMZ Eco World / ITPL", away: "8–9 km" },
    ],
  },
  {
    group: "Schools",
    Icon: CapIcon,
    items: [
      { name: "Chrysalis High", away: "500 m" },
      { name: "Cambridge International School", away: "800 m–1 km" },
      { name: "Delhi Public School East", away: "4 km" },
    ],
  },
  {
    group: "Hospitals",
    Icon: CrossIcon,
    items: [
      { name: "Manipal Hospital, Varthur Road", away: "4.3–6 km" },
      { name: "Apollo Medical Centre", away: "4.4–4.6 km" },
      { name: "Columbia Asia, Whitefield", away: "5 km" },
    ],
  },
  {
    group: "Retail",
    Icon: ShopIcon,
    items: [
      { name: "Apple City Market", away: "1 km" },
      { name: "Star Bazaar", away: "2 km" },
      { name: "Nexus Whitefield", away: "10–15 min" },
    ],
  },
];

// Not itemized at this level of detail on the source site beyond the
// headline claims (zero common walls, MIVAN construction, 7-ft balconies) —
// kept to what's actually stated rather than filled in with invented
// generic specs, and flagged as such in the DISCLAIMER.
export const SPECS: { label: string; value: string; Icon: Icon }[] = [
  {
    label: "Construction",
    Icon: FrameIcon,
    value: "MIVAN formwork technology, stated by the developer to be already in use on site.",
  },
  {
    label: "Layout",
    Icon: FloorIcon,
    value: "Zero common walls between units, for privacy and three-side ventilation.",
  },
  {
    label: "Balconies",
    Icon: DoorIcon,
    value: "7-foot-wide balconies per unit, wider than the typical 3–4 ft found in comparable projects.",
  },
  {
    label: "Tower spacing",
    Icon: CompassIcon,
    value: "A minimum of 115 feet between towers, keeping sightlines and light open.",
  },
  {
    label: "Open space",
    Icon: LeafIcon,
    value: "86% of the 14-acre site left as green, landscaped area rather than built footprint.",
  },
];

// Not stated in percentage-of-price terms beyond the headline "10% now,
// balance on possession" — the source doesn't publish a milestone-by-
// milestone construction-linked schedule for this project, so only the two
// stated stages are shown rather than an invented breakdown.
export const PAYMENT: { stage: string; pct: number }[] = [
  { stage: "Booking (pre-launch offer)", pct: 10 },
  { stage: "Balance on possession", pct: 90 },
];

/** Largest single instalment — the bars in the payment table scale to this. */
export const MAX_PCT = Math.max(...PAYMENT.map((p) => p.pct));

// Three states rather than a percentage: RERA is issued, but construction is
// still at early foundation/substructure stage as of the source's July 2026
// update — flattening that into one number would overstate progress.
export const TRACKER: { label: string; state: "done" | "active" | "pending" }[] = [
  { label: "RERA registration", state: "done" },
  { label: "CDP Road access", state: "done" },
  { label: "Foundation & substructure works", state: "active" },
  { label: "Tower construction", state: "pending" },
  { label: "Possession (target Jun 2029)", state: "pending" },
];

export const EOI_STEPS: string[] = [
  "Share your details and the configuration you are after.",
  "Ask whether the first-51-bookings offer (no floor rise, no PLC) is still open.",
  "Pay 10% to book; the balance is due on possession under the current offer.",
  "Get the brochure and floor plans, and arrange a site visit.",
  "Sign the Agreement of Sale and track construction against the RERA timeline.",
];

export const FAQS: { q: string; a: string }[] = [
  {
    q: "Where exactly is Myhna Vistara?",
    a: "On the 150-ft CDP Road in Gunjur, East Bangalore, near the Varthur/Sarjapur Road corridor, about 4 to 5 km from the Wipro SEZ / RGA Tech Park.",
  },
  {
    q: "Is the project RERA registered?",
    a: `Yes, under ${PROJECT.rera}. Target possession is June 2029, with a RERA deadline of December 2030 if that slips.`,
  },
  {
    q: "What does it cost?",
    a: `Starting prices run from ${price(FROM_PRICE)} for a Luxury 3 BHK (roughly 1,700 sqft) to ${price(TOP_PRICE)} for an Elite 4 BHK (roughly 2,485 sqft), at a stated base rate of ₹9,999 per sqft, all-inclusive.`,
  },
  {
    q: "What is the \"first 51 bookings\" offer?",
    a: "The developer's stated pre-launch incentive: no floor-rise charges and no premium location charges for the first 51 units booked. Once that allocation is used, pricing and terms may change — confirm current availability before relying on it.",
  },
  {
    q: "What is the payment plan?",
    a: "10% at booking, with the balance due on possession, per the developer's stated pre-launch offer. Get the exact schedule in writing in your Agreement of Sale.",
  },
  {
    q: "Who is the developer?",
    a: "Myhna Properties, which states 14-plus years in Bangalore and 1.2 million-plus sqft delivered across 1,000-plus homes, including Myhna Maple and Myhna Meadows. This microsite is run by an authorized channel partner, not necessarily Myhna's own primary site — verify final terms directly with Myhna Properties and on the Karnataka RERA portal.",
  },
];

// Sourced from myhnaproperties.in, a site whose own footer identifies it as
// run by "an authorized channel partner of Myhna Properties." Real assets
// (verified against the raw page HTML, not a hallucinated summary) — but
// this is a much smaller image set than Brigade Granada or Sobha One World
// had: one aerial/tower-map render, a master plan, two floor plans and one
// genuine on-site photo. No interior or amenity photography exists on the
// source at all; nothing has been invented to fill that gap.
export const GALLERY = [
  { src: "/img/myhna-vistara/hero.webp", alt: "Myhna Vistara, marketing render, aerial tower layout with labels" },
  { src: "/img/myhna-vistara/master-plan.webp", alt: "Myhna Vistara, marketing render, 14-acre master plan" },
];

export const FLOOR_PLANS = [
  { src: "/img/myhna-vistara/floorplan-3bhk-1670.webp", alt: "Myhna Vistara, floor plan, 3 BHK, 1,670 sqft", label: "Luxury 3 BHK, 1,670 sqft" },
  { src: "/img/myhna-vistara/floorplan-4bhk-2485.webp", alt: "Myhna Vistara, floor plan, 4 BHK, 2,485 sqft", label: "Elite 4 BHK, 2,485 sqft" },
];

/** A genuine on-site photo (marketing hoarding + site office signage), not a
 *  render — worth separating from GALLERY above since it's a materially
 *  different kind of evidence. Still from the same third-party site, so
 *  still captioned as unverified by Diggaj Realty directly. */
export const CONSTRUCTION_IMAGE = {
  src: "/img/myhna-vistara/construction.webp",
  alt: "Myhna Vistara, site photo, marketing hoarding and site office signage",
};
