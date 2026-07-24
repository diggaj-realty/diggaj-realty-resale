import { getHomeCatalog } from "@/lib/api/home";
import { groupByCity } from "@/lib/cities";
import ExploreMapSection from "@/components/listings/ExploreMapSection";

export default async function ExploreMap() {
  // Aggregates the shared cached catalog (single fetch across the home page).
  const { items } = await getHomeCatalog();
  const places = groupByCity(items);

  return <ExploreMapSection places={places} />;
}
