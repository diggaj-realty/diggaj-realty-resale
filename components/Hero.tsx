import { getHomeCatalog } from "@/lib/api/home";
import { groupByCity } from "@/lib/cities";
import HeroSection from "@/components/listings/HeroSection";

const POPULAR_CITY_LIMIT = 5;

// Pins sit in a bottom-anchored row (see HeroSection), so a slot only carries
// its vertical stagger and drift phase — never an absolute x/y. Percentage
// positions used to be hardcoded here and only cleared each other at ~1440px.
// `reveal` drops the later pins on narrower screens instead of overlapping them.
// Offsets only ever lift a pin (never push it down), so no card can reach past
// the row's bottom anchor into the stats bar.
const PIN_SLOTS = [
  { offset: "translate-y-0", delay: "0s", reveal: "" },
  { offset: "-translate-y-10", delay: "1.6s", reveal: "" },
  { offset: "-translate-y-4", delay: "3s", reveal: "hidden xl:block" },
];

export default async function Hero() {
  const { items } = await getHomeCatalog();

  const popularCities = groupByCity(items)
    .slice(0, POPULAR_CITY_LIMIT)
    .map((c) => c.city);

  const pins = items
    .filter((p) => p.plan === "ELITE")
    .slice(0, PIN_SLOTS.length)
    .map((property, i) => ({ property, ...PIN_SLOTS[i] }));

  return <HeroSection popularCities={popularCities} pins={pins} />;
}
