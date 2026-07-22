import { getProperties } from "@/lib/api/properties";
import ShowcaseSection from "@/components/listings/ShowcaseSection";

export default async function Showcase() {
  // No `plan` filter on GET /properties, so fetch a page and filter client-side.
  // NOTE: same pageSize-100 cap as ExploreMap — fine for now, would need
  // multi-page fetching (or a backend filter) once the catalog grows past that.
  const { items } = await getProperties({ pageSize: 100 }, { cache: "no-store" });
  const homes = items.filter((p) => p.plan === "ELITE").slice(0, 6);

  if (homes.length === 0) return null;

  return <ShowcaseSection homes={homes} />;
}
