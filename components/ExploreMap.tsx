import { getProperties } from "@/lib/api/properties";
import { groupByCity } from "@/lib/cities";
import ExploreMapSection from "@/components/listings/ExploreMapSection";

export default async function ExploreMap() {
  // NOTE: aggregates a single page (API cap: pageSize 100). Fine while the
  // catalog is small; once listings exceed that, this needs either a
  // dedicated backend aggregate endpoint or multi-page fetching here.
  const { items } = await getProperties({ pageSize: 100 }, { cache: "no-store" });
  const places = groupByCity(items);

  return <ExploreMapSection places={places} />;
}
