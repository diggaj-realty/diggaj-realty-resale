import { getHomeCatalog } from "@/lib/api/home";
import ListingsSection from "@/components/listings/ListingsSection";

export default async function PopularListings() {
  const { items } = await getHomeCatalog();
  // Most-viewed first; only surface homes that have actually drawn interest.
  const popular = [...items]
    .filter((p) => (p.viewCount ?? 0) > 0)
    .sort((a, b) => (b.viewCount ?? 0) - (a.viewCount ?? 0))
    .slice(0, 6);

  if (popular.length < 3) return null;

  return (
    <ListingsSection
      items={popular}
      title="Popular right now"
      subtitle="The homes buyers are viewing and shortlisting the most this week."
    />
  );
}
