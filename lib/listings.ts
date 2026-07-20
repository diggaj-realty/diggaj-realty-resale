export type Listing = {
  slug: string;
  img: string;
  title: string;
  price: number;
  address: string;
  city: string;
  beds: number;
  baths: number;
  sqft: number;
  badge: "For Sale" | "New";
  description: string;
  features: string[];
  gallery: string[];
};

// Indian-style pricing: ₹ with Cr / Lakh abbreviations for large values
export const price = (n: number) => {
  if (n >= 10000000) {
    const v = (n / 10000000).toFixed(2).replace(/\.?0+$/, "");
    return `₹${v} Cr`;
  }
  if (n >= 100000) {
    const v = (n / 100000).toFixed(2).replace(/\.?0+$/, "");
    return `₹${v} L`;
  }
  return "₹" + n.toLocaleString("en-IN");
};

export const LISTINGS: Listing[] = [
  {
    slug: "pinnacle-highland-park",
    img: "/img/villa.jpg",
    title: "The Pinnacle at Bandra Heights",
    price: 89000000,
    address: "12 Carter Road, Bandra West",
    city: "Mumbai, MH",
    beds: 5,
    baths: 4,
    sqft: 3200,
    badge: "For Sale",
    description:
      "A striking contemporary villa perched above Bandra. Floor-to-ceiling glass frames the sea link while warm teak interiors keep every room grounded. A chef's kitchen, private terrace, and spa bath make it as livable as it is impressive.",
    features: ["Chef's kitchen", "Private terrace", "Smart home system", "2-car parking", "Spa bathroom", "Walk-in closets"],
    gallery: ["/img/villa.jpg", "/img/interior-kitchen.jpg", "/img/interior-living.jpg"],
  },
  {
    slug: "birchwood-aframe",
    img: "/img/listing-aframe.jpg",
    title: "Birchwood A-Frame Retreat",
    price: 24000000,
    address: "Tungarli Lake Road",
    city: "Lonavala, MH",
    beds: 3,
    baths: 2,
    sqft: 1820,
    badge: "For Sale",
    description:
      "Classic A-frame charm tucked into the Sahyadri hills minutes from the trailhead. Vaulted teak ceilings, a fireplace, and a wraparound deck built for slow monsoon mornings. Turn-key as a home or a proven weekend rental.",
    features: ["Fireplace", "Wraparound deck", "Vaulted ceilings", "Rental history", "Valley views", "New roof 2024"],
    gallery: ["/img/listing-aframe.jpg", "/img/interior-living.jpg", "/img/listing-woods.jpg"],
  },
  {
    slug: "meadow-longhouse",
    img: "/img/hero-house.jpg",
    title: "The Meadow Longhouse",
    price: 65000000,
    address: "Prestige Lakeside, Whitefield",
    city: "Bengaluru, KA",
    beds: 5,
    baths: 3,
    sqft: 3650,
    badge: "For Sale",
    description:
      "A low-slung modern longhouse set in open green. Black-clad exterior, white-oak interior, and a 60-foot wall of glass that slides fully open to the garden. Solar and rainwater harvesting keep running costs near zero.",
    features: ["60ft glass wall", "Solar + rainwater", "Home office wing", "Outdoor kitchen", "Half-acre plot", "EV charging"],
    gallery: ["/img/hero-house.jpg", "/img/interior-kitchen.jpg", "/img/interior2.jpg"],
  },
  {
    slug: "aurora-ridge",
    img: "/img/house2.jpg",
    title: "Aurora Ridge Residence",
    price: 120000000,
    address: "42 Golf Course Road, Sector 42",
    city: "Gurugram, HR",
    beds: 6,
    baths: 5,
    sqft: 5120,
    badge: "New",
    description:
      "New construction on Golf Course Road with sweeping skyline views from every level. Six bedrooms across three floors, a glass-railed terrace, and a lower level ready for a theatre, gym, or staff suite.",
    features: ["Skyline views", "Roof terrace", "New construction", "Private lift", "Heated floors", "Builder warranty"],
    gallery: ["/img/house2.jpg", "/img/interior-living.jpg", "/img/interior-kitchen.jpg"],
  },
  {
    slug: "fernwood-valley",
    img: "/img/footer-house.jpg",
    title: "Fernwood Valley Estate",
    price: 55000000,
    address: "17 Riverside, Baner",
    city: "Pune, MH",
    beds: 4,
    baths: 3,
    sqft: 3300,
    badge: "For Sale",
    description:
      "A modern estate along the river bend in Baner. Cedar and glass pavilion architecture, mature landscaping, and a detached studio perfect for guests or a home business.",
    features: ["Riverfront plot", "Detached studio", "Cedar + glass build", "Chef's range", "Mature gardens", "Mudroom"],
    gallery: ["/img/footer-house.jpg", "/img/interior2.jpg", "/img/interior-living.jpg"],
  },
  {
    slug: "gable-house",
    img: "/img/listing-woods.jpg",
    title: "The Gable House",
    price: 38000000,
    address: "5 Road No. 10, Jubilee Hills",
    city: "Hyderabad, TS",
    beds: 4,
    baths: 3,
    sqft: 2410,
    badge: "For Sale",
    description:
      "A crisp gabled form in the leafy lanes of Jubilee Hills. Contemporary interiors, a light-filled double-height living room, and a flat, private yard backing onto open space.",
    features: ["Double-height living", "Backs to open space", "Modular kitchen", "Metal roof", "Landscaped yard", "Workshop"],
    gallery: ["/img/listing-woods.jpg", "/img/interior-living.jpg", "/img/interior-kitchen.jpg"],
  },
];

export const getListing = (slug: string) =>
  LISTINGS.find((l) => l.slug === slug);
