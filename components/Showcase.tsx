import { getHomeCatalog } from "@/lib/api/home";
import ShowcaseSection from "@/components/listings/ShowcaseSection";

export default async function Showcase() {
  // No `plan` filter on GET /properties, so fetch a page and filter client-side.
  // Shares the single cached catalog fetch with Hero + ExploreMap.
  const { items } = await getHomeCatalog();
  const homes = items.filter((p) => p.plan === "ELITE").slice(0, 6);

  if (homes.length === 0) return null;

  return <ShowcaseSection homes={homes} />;
}
