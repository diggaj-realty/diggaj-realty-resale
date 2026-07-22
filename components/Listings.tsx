import { getProperties } from "@/lib/api/properties";
import ListingsSection from "@/components/listings/ListingsSection";

export default async function Listings() {
  const { items } = await getProperties({ pageSize: 6 }, { cache: "no-store" });

  return <ListingsSection items={items} />;
}
