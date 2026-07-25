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
 * Also records a lightweight "recently viewed" entry in localStorage — purely
 * client-side, since there's no API to list a buyer's own view history.
 */
export default function ViewTracker({ property }: { property: Property }) {
  const { token, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    fetch(`${BASE}/properties/${property.id}`, {
      cache: "no-store",
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    }).catch(() => {});

    recordRecentlyViewed({
      id: property.id,
      title: property.title,
      location: property.location,
      cover: property.photos[0]?.url,
      bhk: property.bhk,
      areaSqft: property.areaSqft,
      askingPrice: property.askingPrice,
      plan: property.plan,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [property.id, loading]);

  return null;
}
