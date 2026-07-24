import { getHomeCatalog } from "@/lib/api/home";
import { groupByCity } from "@/lib/cities";
import HeroSection from "@/components/listings/HeroSection";

const POPULAR_CITY_LIMIT = 5;

// fixed screen positions art-directed for the hero photo — content changes,
// placement doesn't
const PIN_SLOTS = [
  { pos: "left-[16%] top-[56%]", delay: "0s" },
  { pos: "left-[48%] top-[46%]", delay: "1.6s" },
  { pos: "right-[16%] top-[52%]", delay: "3s" },
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
