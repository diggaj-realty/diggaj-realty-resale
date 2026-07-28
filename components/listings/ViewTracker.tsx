"use client";

import { useEffect } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { recordRecentlyViewed } from "@/lib/recentlyViewed";
import type { Property } from "@/types/api";

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL!;

/**
 * Property detail pages are prerendered/ISR (revalidate: 120s) for performance,
 * so the server-side view-recording that happens inside GET /properties/[id]
 * only fires on rebuild/revalidation — not per real visitor. This fires that
 * same GET once per real page view from the browser (fire-and-forget, result
 * discarded) so viewCount / "most viewed" stay meaningful. The API already
 * de-dupes a logged-in user's repeat views within 30 minutes server-side.
 *
 * Also records the full property in a "recently viewed" localStorage entry —
 * purely client-side, since anonymous visitors (with no account to query)
 * should get this too, not just logged-in buyers. Storing the whole object
 * (not just a few fields) lets RecentlyViewed.tsx render it through the same
 * ListingCard used everywhere else.
 */
export default function ViewTracker({ property }: { property: Property }) {
  const { token, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    fetch(`${BASE}/properties/${property.id}`, {
      cache: "no-store",
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    }).catch(() => {});

    recordRecentlyViewed(property);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [property.id, loading]);

  return null;
}
