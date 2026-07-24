import { cache } from "react";
import { getProperties } from "@/lib/api/properties";

/**
 * The home page renders three sections (Hero pins, Showcase, Explore-by-city)
 * that each need the full catalog. Wrapping the fetch in React `cache()` dedupes
 * them into a SINGLE request per render, and the ISR `revalidate` window lets
 * that request be served from the Next.js Data Cache across visits — so the
 * home page renders from cache instead of blocking on the remote API each time.
 */
export const getHomeCatalog = cache(() =>
  getProperties({ pageSize: 100 }, { revalidate: 120 })
);
