import { getProperties } from "@/lib/api/properties";
import { groupByCity } from "@/lib/cities";
import HeroSection from "@/components/listings/HeroSection";

const POPULAR_CITY_LIMIT = 5;

// fixed screen positions art-directed for the hero photo — content changes,
// placement doesn't
const PIN_SLOTS = [
  { pos: "left-[18%] top-[58%]", delay: "0s" },
  { pos: "left-[44%] top-[42%]", delay: "1.6s" },
  { pos: "right-[22%] top-[64%]", delay: "3s" },
];

export default async function Hero() {
  const { items } = await getProperties({ pageSize: 100 }, { cache: "no-store" });

  const popularCities = groupByCity(items)
    .slice(0, POPULAR_CITY_LIMIT)
    .map((c) => c.city);

  const pins = items
    .filter((p) => p.plan === "ELITE")
    .slice(0, PIN_SLOTS.length)
    .map((property, i) => ({ property, ...PIN_SLOTS[i] }));

  return <HeroSection popularCities={popularCities} pins={pins} />;
}
