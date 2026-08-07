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
  StoveIcon,
  DropletIcon,
  DoorIcon,
  BoltIcon,
  LiftIcon,
  CompassIcon,
} from "../brigade-granada/icons";

// Content for the Sobha One World Hoskote project microsite, sourced from
// sobhaproject.co.in/bangalore/sobha-one-world-hoskote — a Karnataka
// RERA-registered channel partner of Sobha Limited (agent
// PRM/KA/RERA/1251/446/PR/130723/006056), not Sobha's own domain. Unlike
// Brigade Granada, this project already has RERA numbers issued (May 2026);
// treat prices/dates as the developer's stated figures, not invented ones.
// See the DISCLAIMER block in page.tsx before changing how any of it renders.
// Icons are reused from the Brigade Granada microsite's icon set — generic,
// server-safe SVGs with no project-specific content.

type Icon = ComponentType<{ className?: string }>;

export const PROJECT = {
  name: "Sobha One World",
  developer: "Sobha Limited",
  alsoKnownAs: "Sobha Hoskote · Sobha Codename Trinity",
  address: "Amanidoddakere Village, Old Madras Road (NH-75), Hoskote, East Bangalore, Karnataka 562114",
  locality: "Hoskote",
  city: "Bangalore",
  rera: "Phase 1 registered: PRM/KA/RERA/1250/304/PR/080526/008634 to 008639",
  status: "Launched · Booking open",
};

export const FACTS: { label: string; value: string; note?: string; Icon: Icon }[] = [
  { label: "Township area", value: "300 acres", note: "Phase 1: 48 acres", Icon: AcreIcon },
  { label: "Structure", value: "45–46", note: "Storeys, 14 towers", Icon: LayersIcon },
  { label: "Total units", value: "~3,484", note: "Phase 1 apartments", Icon: GridIcon },
  { label: "Configurations", value: "1–4 BHK", note: "734 – 2,415 sqft", Icon: BedIcon },
  { label: "Possession", value: "2032–33", note: "Phase-wise", Icon: KeyIcon },
  { label: "Launched", value: "May 2026", note: "Booking open now", Icon: FlagIcon },
];

// Rupee amounts, not display strings — `price()` renders them, and the ₹/sqft
// figure plus the size bars are derived from these two numbers rather than
// stated separately. Labels are the developer's own layout names ("Luxe" vs
// "Grande" at the same bedroom count), same reasoning as Brigade Granada's
// "+ 2T" / "+ 3T" labels: a bare "3 BHK" on both would duplicate headings.
export const CONFIGS: { label: string; sqft: number; from: number }[] = [
  { label: "1 Bed Luxe", sqft: 734, from: 11_000_000 },
  { label: "2 Bed Luxe", sqft: 1_063, from: 15_900_000 },
  { label: "2 Bed Grande", sqft: 1_205, from: 18_000_000 },
  { label: "3 Bed Luxe", sqft: 1_511, from: 22_600_000 },
  { label: "3 Bed Grande", sqft: 1_820, from: 27_200_000 },
  { label: "4 Bed Luxe", sqft: 2_096, from: 31_400_000 },
  { label: "4 Bed Grande", sqft: 2_415, from: 37_300_000 },
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
  { value: "300", label: "Acres" },
  { value: "45–46", label: "Storeys" },
  { value: "~3,484", label: "Homes (Ph. 1)" },
  { value: price(FROM_PRICE), label: "Starting price" },
];

export const MIXED_USE: { title: string; body: string; Icon: Icon }[] = [
  {
    title: "One Club, 120,000 sqft",
    body: "A three-tier clubhouse rather than a single amenity block — the scale that lets a pool, a gym and a banquet hall all exist without competing for the same room.",
    Icon: TrophyIcon,
  },
  {
    title: "One Emporium retail boulevard",
    body: "65,000 sqft of retail frontage inside the township, so daily errands and a coffee run don't require leaving the gate.",
    Icon: ShopIcon,
  },
  {
    title: "80% open, landscaped",
    body: "Six themed green zones across the township. On a 300-acre parcel that's a meaningful amount of land deliberately left unbuilt, not a rounding error.",
    Icon: LeafIcon,
  },
];

export const AMENITIES: { group: string; items: string[]; Icon: Icon }[] = [
  {
    group: "Sport",
    Icon: TrophyIcon,
    items: [
      "Tennis courts (2)",
      "Basketball court",
      "Badminton court",
      "Pickleball courts (3)",
      "Cricket ground, 90 m diameter",
      "Football field",
      "Running track, 350 m",
      "Cycling & jogging track, 750 m",
    ],
  },
  {
    group: "Wellness",
    Icon: LeafIcon,
    items: [
      "Olympic-length lap pool",
      "Temperature-controlled pool",
      "Kids' splash pad",
      "Landscaped garden zones",
      "Pet park",
    ],
  },
  {
    group: "Recreation",
    Icon: DiceIcon,
    items: [
      "One Club clubhouse",
      "Gymnasium",
      "Skating rink",
      "Amphitheatre",
      "Multipurpose hall",
    ],
  },
  {
    group: "Everyday",
    Icon: CoffeeIcon,
    items: [
      "Co-working lounge with Wi-Fi",
      "One Emporium retail boulevard",
      "Basement parking, 3 levels",
    ],
  },
  {
    group: "Safety & utilities",
    Icon: ShieldIcon,
    items: [
      "24/7 CCTV surveillance",
      "Rainwater harvesting",
      "Energy-efficient systems",
    ],
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
      { name: "Kadugodi Metro Station", away: "17–20 min" },
      { name: "Satellite Town Ring Road", away: "Close proximity" },
      { name: "KR Puram", away: "20 min" },
      { name: "Kempegowda Airport", away: "45 min" },
    ],
  },
  {
    group: "Workplaces",
    Icon: BriefcaseIcon,
    items: [
      { name: "Whitefield / ITPL", away: "20–25 min" },
      { name: "Marathahalli", away: "40 min" },
    ],
  },
  {
    group: "Schools",
    Icon: CapIcon,
    items: [{ name: "Whitefield/Hoskote corridor schools", away: "15–25 min" }],
  },
  {
    group: "Hospitals",
    Icon: CrossIcon,
    items: [{ name: "Whitefield corridor hospitals", away: "20–25 min" }],
  },
  {
    group: "Retail",
    Icon: ShopIcon,
    items: [{ name: "Whitefield malls (Phoenix, Forum)", away: "20–30 min" }],
  },
];

// Not stated on the source site at this level of detail — kept generic and
// consistent with Sobha's standard build quality across its other Bangalore
// projects, and flagged as such in the DISCLAIMER rather than presented as
// confirmed spec for this specific project.
export const SPECS: { label: string; value: string; Icon: Icon }[] = [
  {
    label: "Structure",
    Icon: FrameIcon,
    value: "RCC framed high-rise structure, built to applicable seismic zone requirements.",
  },
  {
    label: "Flooring",
    Icon: FloorIcon,
    value: "Premium vitrified tiles in living, dining and bedrooms; anti-skid tiles in wet areas.",
  },
  {
    label: "Kitchen",
    Icon: StoveIcon,
    value: "Modular-ready layout with counter and sink provisions for a water purifier and chimney.",
  },
  {
    label: "Bathrooms",
    Icon: DropletIcon,
    value: "Branded sanitaryware and CP fittings, with geyser and exhaust provisions.",
  },
  {
    label: "Doors & windows",
    Icon: DoorIcon,
    value: "Engineered main door, laminated internal doors, UPVC or anodised aluminium windows.",
  },
  {
    label: "Electrical",
    Icon: BoltIcon,
    value: "Concealed copper wiring with MCB protection and AC provisions in bedrooms and living areas.",
  },
  {
    label: "Lifts & lobbies",
    Icon: LiftIcon,
    value: "High-speed passenger and service lifts per tower, with finished lobbies.",
  },
  {
    label: "Planning",
    Icon: CompassIcon,
    value: "Layouts oriented for natural light and cross-ventilation.",
  },
];

// Three states rather than a percentage: RERA is issued for Phase 1, but
// construction itself is still at site-works stage as of the source update
// (July 2026) — flattening that into one progress number would overstate it.
export const TRACKER: { label: string; state: "done" | "active" | "pending" }[] = [
  { label: "RERA registration (Phase 1)", state: "done" },
  { label: "Site clearing & soil testing", state: "done" },
  { label: "Model apartments & experience centre", state: "done" },
  { label: "Foundation works", state: "active" },
  { label: "Tower construction", state: "pending" },
  { label: "Possession (phase-wise, 2032–33)", state: "pending" },
];

// The developer's stated split is 10% booking (a flat amount by
// configuration, not a percentage of price) + 10% on agreement + 80% linked
// to construction milestones. Only the aggregate 90% is broken out here —
// the source doesn't publish a milestone-by-milestone schedule for this
// project, and inventing one would misstate it. See BOOKING_AMOUNTS below
// for the flat booking figures.
export const PAYMENT: { stage: string; pct: number }[] = [
  { stage: "Agreement of Sale", pct: 10 },
  { stage: "Construction-linked milestones", pct: 80 },
];

/** Largest single instalment — the bars in the payment table scale to this. */
export const MAX_PCT = Math.max(...PAYMENT.map((p) => p.pct));

export const BOOKING_AMOUNTS = [
  { config: "1 & 2 Bed", amount: "₹4–5 Lakhs" },
  { config: "3 Bed", amount: "₹8 Lakhs" },
  { config: "4 Bed", amount: "₹10 Lakhs" },
];

export const LENDERS = ["SBI", "HDFC", "ICICI", "Axis", "Kotak", "Bank of Baroda", "LIC Housing"];

export const EOI_STEPS: string[] = [
  "Share your details and the configuration you are after.",
  "Note your preference on tower, floor and phase.",
  "Pay the flat booking amount for your configuration.",
  "Sign the Agreement of Sale within the standard window.",
  "Track construction against the phase-wise possession date.",
];

export const FAQS: { q: string; a: string }[] = [
  {
    q: "Where exactly is Sobha One World?",
    a: "Amanidoddakere Village on Old Madras Road (NH-75), Hoskote, East Bangalore 562114, with the Satellite Town Ring Road in close proximity and Kadugodi Metro Station 17 to 20 minutes away.",
  },
  {
    q: "Is the project RERA registered?",
    a: "Yes. Phase 1 (Wings 1 and 2) is registered under PRM/KA/RERA/1250/304/PR/080526/008634 to 008639, dated 8 May 2026. The remaining five phases carry their own separate RERA numbers as they release.",
  },
  {
    q: "What does it cost?",
    a: `Starting prices run from ${price(FROM_PRICE)} for a 734 sqft 1 Bed Luxe to ${price(TOP_PRICE)} for a 2,415 sqft 4 Bed Grande, at an all-in rate of roughly ₹14,745–₹16,095 per sqft. GST, stamp duty, registration and maintenance are extra.`,
  },
  {
    q: "When is possession?",
    a: "Phase-wise between August 2032 and September 2033, depending on which wing you book into. Each phase's registered RERA date is the one that actually binds the developer.",
  },
  {
    q: "What is the booking amount, and is it refundable?",
    a: "A flat amount by configuration (₹4–5 Lakhs for 1–2 Bed, ₹8 Lakhs for 3 Bed, ₹10 Lakhs for 4 Bed), followed by 10% on the Agreement of Sale and the remaining 80% linked to construction milestones. Get the refund terms in writing before paying anything.",
  },
  {
    q: "Who is the developer?",
    a: "Sobha Limited, one of Bangalore's largest listed developers, known for in-house construction rather than contracting it out. This microsite is run by an authorized RERA-registered channel partner, not Sobha's own site — verify final terms directly with Sobha or on the Karnataka RERA portal.",
  },
];

// Sourced from sobhaproject.co.in, a Karnataka RERA-registered channel
// partner of Sobha Limited (agent PRM/KA/RERA/1251/446/PR/130723/006056),
// not Sobha's own domain. These are marketing renders and site-progress
// photos, not confirmed as Sobha's own official imagery. Caption every use
// accordingly; see the DISCLAIMER block in page.tsx.
export const GALLERY = [
  { src: "/img/sobha-one-world/hero.webp", alt: "Sobha One World, marketing render, aerial elevation view" },
  { src: "/img/sobha-one-world/pool.jpg", alt: "Sobha One World, marketing render, swimming pool" },
  { src: "/img/sobha-one-world/gym.jpg", alt: "Sobha One World, marketing render, gymnasium" },
  { src: "/img/sobha-one-world/tennis.jpg", alt: "Sobha One World, marketing render, tennis court" },
  { src: "/img/sobha-one-world/dining.webp", alt: "Sobha One World, marketing render, dining area interior" },
  { src: "/img/sobha-one-world/bedroom.webp", alt: "Sobha One World, marketing render, master bedroom" },
];

export const KITCHEN_IMAGE = {
  src: "/img/sobha-one-world/kitchen.webp",
  alt: "Sobha One World, marketing render, modular kitchen",
};

export const CONSTRUCTION_IMAGE = {
  src: "/img/sobha-one-world/construction.webp",
  alt: "Sobha One World, site-progress photo, active construction work, February 2026",
};
