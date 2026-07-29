import { getHomeCatalog } from "@/lib/api/home";
import ShowcaseSection from "@/components/listings/ShowcaseSection";

export default async function Showcase() {
  // Shares the single cached catalog fetch with Hero + ExploreMap.
  const { items } = await getHomeCatalog();
  const homes = [...items].sort((a, b) => b.askingPrice - a.askingPrice).slice(0, 5);

  if (homes.length === 0) return null;

  return <ShowcaseSection homes={homes} />;
}
