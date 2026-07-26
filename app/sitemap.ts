import type { MetadataRoute } from "next";
import { getProperties } from "@/lib/api/properties";
import { slugify } from "@/lib/slug";

const SITE_URL = "https://diggajrealty.com";

const STATIC_ROUTES: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
  { path: "", priority: 1, changeFrequency: "daily" },
  { path: "/listings", priority: 0.9, changeFrequency: "daily" },
  { path: "/contact", priority: 0.5, changeFrequency: "monthly" },
  { path: "/login/buyer", priority: 0.3, changeFrequency: "yearly" },
  { path: "/login/seller", priority: 0.3, changeFrequency: "yearly" },
  { path: "/privacy", priority: 0.2, changeFrequency: "yearly" },
  { path: "/terms", priority: 0.2, changeFrequency: "yearly" },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((r) => ({
    url: `${SITE_URL}${r.path}`,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));

  // Same pageSize/slug-building pattern as generateStaticParams in
  // app/listings/[slug]/page.tsx — best-effort: a fetch failure just means
  // fewer listing entries this build, not a broken sitemap.
  let listingEntries: MetadataRoute.Sitemap = [];
  try {
    const { items } = await getProperties({ pageSize: 100 }, { revalidate: 3600 });
    listingEntries = items.map((p) => ({
      url: `${SITE_URL}/listings/${slugify(p.title)}--${p.id}`,
      lastModified: p.updatedAt,
      changeFrequency: "weekly",
      priority: 0.8,
    }));
  } catch {
    listingEntries = [];
  }

  return [...staticEntries, ...listingEntries];
}
