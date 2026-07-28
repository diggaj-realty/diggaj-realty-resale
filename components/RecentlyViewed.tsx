"use client";

import { useSyncExternalStore } from "react";
import { getRecentlyViewed } from "@/lib/recentlyViewed";
import ListingCard from "@/components/listings/ListingCard";

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
    <section className="bg-white px-8 py-16 md:px-14">
      <h2 className="text-subhead font-medium tracking-[-0.02em] text-ink">Recently viewed</h2>
      <div className="mt-6 flex gap-5 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {items.map((p, i) => (
          <div key={p.id} className="w-64 shrink-0">
            <ListingCard property={p} i={i} />
          </div>
        ))}
      </div>
    </section>
  );
}
