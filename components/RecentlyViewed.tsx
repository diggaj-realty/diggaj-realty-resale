"use client";

import { useSyncExternalStore } from "react";
import { getRecentlyViewed } from "@/lib/recentlyViewed";
import ListingsSection from "@/components/listings/ListingsSection";

// No native "changed" event for same-tab localStorage writes, so subscribe is
// a no-op — we only need a hydration-safe *initial* read (empty on the server,
// real value once mounted in the browser), matching the Footer.tsx precedent.
const subscribe = () => () => {};
const EMPTY: ReturnType<typeof getRecentlyViewed> = [];
const getServerSnapshot = () => EMPTY;

export default function RecentlyViewed() {
  const items = useSyncExternalStore(subscribe, getRecentlyViewed, getServerSnapshot);

  if (items.length === 0) return null;

  return (
    <ListingsSection
      items={items}
      title="Recently viewed"
      subtitle="Pick up where you left off — homes you've looked at recently."
    />
  );
}
