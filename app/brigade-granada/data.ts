import type { ComponentType } from "react";
import { price } from "@/lib/listings";
import {
  AcreIcon,
  LayersIcon,
  GridIcon,
  BedIcon,
  KeyIcon,
  FlagIcon,
  HotelIcon,
  TowerIcon,
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
} from "./icons";

// Content for the Brigade Granada project microsite. Every figure here is a
// pre-launch indicative number from the developer's own material — see the
// DISCLAIMER block in page.tsx before changing how any of it is presented.
// Icons are attached to the data (same pattern as lib/dashboard/nav.ts) so the
// page body stays layout-only.

type Icon = ComponentType<{ className?: string }>;

export const PROJECT = {
  name: "Brigade Granada",
  developer: "Brigade Group",
  alsoKnownAs: "Brigade Whitefield Hoskote Road · Brigade Kadugodi",
  address:
    "Whitefield–Kadugodi Main Road, Sannatammanahalli, East Bangalore, Karnataka 560067",
  locality: "Kadugodi, Whitefield",
  city: "Bangalore",
  rera: "Awaited, registration in progress",
  status: "Pre-launch · EOI open",
};

export const FACTS: { label: string; value: string; note?: string; Icon: Icon }[] = [
  { label: "Land area", value: "~40 acres", note: "Integrated township", Icon: AcreIcon },
  { label: "Structure", value: "4B + G + 53", note: "Basements + floors", Icon: LayersIcon },
  { label: "Total units", value: "~2,000", note: "Across multiple towers", Icon: GridIcon },
  { label: "Configurations", value: "1–4 BHK", note: "730 – 2,760 sqft", Icon: BedIcon },
  { label: "Possession", value: "Dec 2031", note: "Indicative", Icon: KeyIcon },
  { label: "Launch", value: "TBA", note: "EOI open now", Icon: FlagIcon },
];

// Rupee amounts, not display strings — `price()` renders them, and the ₹/sqft
// figure plus the size bars are derived from these two numbers rather than
// stated separately.
//
// Labels are the developer's own layout names, including the bathroom count
// ("+ 2T" / "+ 3T"). That matters: two of these are 3 BHKs differing only in
// bathrooms, and a bare "3 BHK" on both made the card headings duplicate — the
// same heading twice tells a screen-reader user nothing about which is which.
export const CONFIGS: { label: string; sqft: number; from: number }[] = [
  { label: "1 BHK", sqft: 730, from: 10_700_000 },
  { label: "2 BHK Large", sqft: 1_275, from: 17_900_000 },
  { label: "3 BHK + 2T", sqft: 1_540, from: 21_900_000 },
  { label: "3 BHK + 3T", sqft: 1_820, from: 25_900_000 },
  { label: "3 BHK + 3T + Study", sqft: 2_240, from: 32_900_000 },
  { label: "4 BHK + 4T + Maid", sqft: 2_760, from: 39_900_000 },
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
  { value: "~40", label: "Acres" },
  { value: "53", label: "Floors" },
  { value: "~2,000", label: "Homes" },
  { value: price(FROM_PRICE), label: "Starting price" },
];

export const MIXED_USE: { title: string; body: string; Icon: Icon }[] = [
  {
    title: "400-key luxury hotel",
    body: "A hotel inside the township, which in practice means banquet space, restaurants and somewhere to put visiting family without leaving the gate.",
    Icon: HotelIcon,
  },
  {
    title: "35-floor commercial tower",
    body: "Office space on the same land parcel. For a resident, that is a walk to work; for an investor, it is rental demand that does not depend on the wider Whitefield market.",
    Icon: TowerIcon,
  },
  {
    title: "High-street retail",
    body: "Ground-level shopfronts and cafés along the frontage, so daily errands stay inside the development.",
    Icon: ShopIcon,
  },
];

export const AMENITIES: { group: string; items: string[]; Icon: Icon }[] = [
  {
    group: "Sport",
    Icon: TrophyIcon,
    items: [
      "Tennis court",
      "Badminton court",
      "Basketball court",
      "Pickleball court",
      "Squash court",
      "Cricket practice nets",
      "Jogging & cycling track",
    ],
  },
  {
    group: "Wellness",
    Icon: LeafIcon,
    items: [
      "Adult & children's swimming pools",
      "Yoga and meditation deck",
      "Reflexology walkway",
      "Landscaped gardens",
      "Hammock garden",
      "Senior citizens' park",
    ],
  },
  {
    group: "Recreation",
    Icon: DiceIcon,
    items: [
      "Clubhouse",
      "Gymnasium",
      "Billiards, table tennis & carrom",
      "Library",
      "Party hall with terrace",
    ],
  },
  {
    group: "Everyday",
    Icon: CoffeeIcon,
    items: [
      "Co-working spaces",
      "Retail & cafés",
      "Visitor guest rooms",
      "Banquet facilities",
      "Covered basement parking",
    ],
  },
  {
    group: "Safety & utilities",
    Icon: ShieldIcon,
    items: [
      "24/7 CCTV surveillance",
      "Access-controlled entry & boom barriers",
      "Video door phones",
      "Power backup",
      "Rainwater harvesting",
      "Sewage treatment plant",
      "Waste management",
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
      { name: "Kadugodi Metro (Purple Line)", away: "3–6 km" },
      { name: "Whitefield–Hoskote Road", away: "Frontage" },
      { name: "Whitefield Main Road", away: "5–8 min" },
      { name: "Airport", away: "40–50 min" },
    ],
  },
  {
    group: "Workplaces",
    Icon: BriefcaseIcon,
    items: [
      { name: "SAP Labs", away: "10–12 min" },
      { name: "EPIP Zone", away: "10–15 min" },
      { name: "Goldman Sachs, HP", away: "12–15 min" },
      { name: "ITPL", away: "15–20 min" },
    ],
  },
  {
    group: "Schools",
    Icon: CapIcon,
    items: [
      { name: "Vydehi School", away: "5–8 min" },
      { name: "VIBGYOR High", away: "8–10 min" },
      { name: "National Public School", away: "8–12 min" },
      { name: "Delhi Public School", away: "12–15 min" },
    ],
  },
  {
    group: "Hospitals",
    Icon: CrossIcon,
    items: [
      { name: "Vydehi Institute", away: "5–8 min" },
      { name: "Sri Sathya Sai", away: "5–10 min" },
      { name: "Manipal, Whitefield", away: "10–12 min" },
      { name: "Columbia Asia", away: "10–12 min" },
    ],
  },
  {
    group: "Retail",
    Icon: ShopIcon,
    items: [
      { name: "Park Square Mall", away: "8–12 min" },
      { name: "Forum Value Mall", away: "10–15 min" },
      { name: "Phoenix Marketcity", away: "15–20 min" },
    ],
  },
];

export const SPECS: { label: string; value: string; Icon: Icon }[] = [
  {
    label: "Structure",
    Icon: FrameIcon,
    value:
      "RCC framed structure built to seismic Zone II requirements, block masonry walls, 3.0–3.2 m floor-to-floor height.",
  },
  {
    label: "Flooring",
    Icon: FloorIcon,
    value:
      "Premium vitrified tiles in living, dining and bedrooms; anti-skid ceramic tiles in bathrooms, balconies and utility.",
  },
  {
    label: "Kitchen",
    Icon: StoveIcon,
    value:
      "Modular layout with granite or quartz counter, stainless steel sink, and provisions for a water purifier and chimney.",
  },
  {
    label: "Bathrooms",
    Icon: DropletIcon,
    value: "Premium sanitaryware and CP fittings, with geyser and exhaust fan provisions.",
  },
  {
    label: "Doors & windows",
    Icon: DoorIcon,
    value:
      "Engineered or teakwood main door, laminated flush internal doors, UPVC or anodised aluminium windows with mosquito mesh.",
  },
  {
    label: "Electrical",
    Icon: BoltIcon,
    value:
      "Concealed copper wiring, MCB protection, generous outlet counts, and AC provisions in bedrooms and living areas.",
  },
  {
    label: "Lifts & lobbies",
    Icon: LiftIcon,
    value:
      "High-speed passenger and service lifts per tower, with finished lobbies and corridors.",
  },
  {
    label: "Planning",
    Icon: CompassIcon,
    value: "Vaastu-compliant layouts oriented for natural light and cross-ventilation.",
  },
];

// Deliberately three states, not a percentage bar: "approvals in progress" and
// "RERA awaited" are facts about paperwork, and flattening them into one
// progress figure would read as further along than the project actually is.
export const TRACKER: { label: string; state: "done" | "active" | "pending" }[] = [
  { label: "Land acquisition", state: "done" },
  { label: "Statutory approvals", state: "active" },
  { label: "Site mobilisation", state: "active" },
  { label: "EOI registration", state: "active" },
  { label: "RERA registration", state: "pending" },
  { label: "Tower construction", state: "pending" },
];

export const PAYMENT: { stage: string; pct: number }[] = [
  { stage: "Booking", pct: 10 },
  { stage: "On commencement", pct: 10 },
  { stage: "Plinth level", pct: 10 },
  { stage: "25% of structure", pct: 10 },
  { stage: "50% of structure", pct: 15 },
  { stage: "75% of structure", pct: 15 },
  { stage: "Brickwork", pct: 10 },
  { stage: "Internal plastering", pct: 10 },
  { stage: "On possession", pct: 10 },
];

/** Largest single instalment — the bars in the payment table scale to this. */
export const MAX_PCT = Math.max(...PAYMENT.map((p) => p.pct));

export const EOI_STEPS: string[] = [
  "Share your details and the configuration you are after.",
  "Note your preference on tower, floor and orientation.",
  "Place the EOI amount by post-dated, refundable cheque.",
  "Get told first when RERA registration and the launch date land.",
  "Convert the EOI into a formal booking after the official launch.",
];

export const FAQS: { q: string; a: string }[] = [
  {
    q: "Where exactly is Brigade Granada?",
    a: "On Whitefield–Kadugodi Main Road at Sannatammanahalli, East Bangalore 560067, with direct frontage on the Whitefield–Hoskote Road and the Kadugodi metro terminal 3 to 6 km away.",
  },
  {
    q: "Is the project RERA registered?",
    a: "Not yet. Registration is in progress and the number has not been issued. Until it is, treat every price, size and date here as indicative, and do not commit funds beyond a refundable EOI.",
  },
  {
    q: "What does it cost?",
    a: `Indicative pre-launch pricing runs from ${price(FROM_PRICE)} for a 730 sqft 1 BHK to ${price(TOP_PRICE)} for a 2,760 sqft 4 BHK. GST, stamp duty, registration, floor rise, parking and maintenance are all extra.`,
  },
  {
    q: "When is possession?",
    a: "December 2031 is the indicative handover. That date is pre-RERA, so it carries no statutory weight yet; the registered timeline is what will actually bind the developer.",
  },
  {
    q: "What is an EOI, and is the money safe?",
    a: "An Expression of Interest reserves your place in the queue before launch, usually against a post-dated refundable cheque. It is not a booking and it does not create a right to a specific unit. Get the refund terms in writing before you hand anything over.",
  },
  {
    q: "Who is the developer?",
    a: "Brigade Group, around 35 years in the market, with 300-plus projects and over 75 million sqft delivered. Nearby work includes Brigade Lakefront and Brigade Woods in Kadugodi; comparable townships include Brigade Orchards, Brigade Utopia and Brigade Metropolis.",
  },
];

// Sourced from a third-party project marketing microsite, not from Brigade
// Group's own domain — Brigade Granada does not appear in Brigade's official
// project listing. These are pre-launch marketing renders, not photographs of
// a built project, and their authenticity is unverified. Caption every use
// accordingly; see the DISCLAIMER block in page.tsx.
export const GALLERY = [
  { src: "/img/brigade-granada/hero.webp", alt: "Brigade Granada, marketing render, main view" },
  { src: "/img/brigade-granada/entrance.webp", alt: "Brigade Granada, marketing render, entrance view" },
  { src: "/img/brigade-granada/tower.webp", alt: "Brigade Granada, marketing render, tower view" },
  { src: "/img/brigade-granada/pool.webp", alt: "Brigade Granada, marketing render, swimming pool" },
  { src: "/img/brigade-granada/night.webp", alt: "Brigade Granada, marketing render, night view" },
  { src: "/img/brigade-granada/dining.webp", alt: "Brigade Granada, marketing render, dining area" },
];

export const KITCHEN_IMAGE = {
  src: "/img/brigade-granada/kitchen.webp",
  alt: "Brigade Granada, marketing render, living-dining-kitchen layout",
};
