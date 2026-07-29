import { getHomeCatalog } from "@/lib/api/home";
import { groupByCity } from "@/lib/cities";
import HeroSection from "@/components/listings/HeroSection";

const POPULAR_CITY_LIMIT = 5;

export default async function Hero() {
  const { items } = await getHomeCatalog();

  const popularCities = groupByCity(items)
    .slice(0, POPULAR_CITY_LIMIT)
    .map((c) => c.city);

  const eliteHomes = items.filter((p) => p.plan === "ELITE").slice(0, 10);

  return <HeroSection popularCities={popularCities} eliteHomes={eliteHomes} />;
}
