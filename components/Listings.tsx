import { getProperties } from "@/lib/api/properties";
import ListingsSection from "@/components/listings/ListingsSection";

export default async function Listings() {
  const { items } = await getProperties({ pageSize: 6 }, { revalidate: 120 });

  return <ListingsSection items={items} />;
}
