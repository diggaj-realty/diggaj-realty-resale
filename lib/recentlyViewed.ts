import type { Property } from "@/types/api";

// Stores the full Property object (not just a lightweight subset) so
// RecentlyViewed.tsx can render it through the same ListingCard used
// everywhere else, instead of a bespoke mini-card layout.
export type RecentlyViewedItem = Property & { viewedAt: string };

// v2: stores the full Property object instead of a lightweight subset — a
// new key so any pre-existing v1 entries (incompatible shape) are simply
// orphaned rather than crashing ListingCard on missing fields like `photos`.
const KEY = "diggaj_recently_viewed_v2";
const MAX_ITEMS = 8;

// useSyncExternalStore requires getSnapshot to return a referentially stable
// result when nothing has changed — cache the parsed array against the raw
// string so repeated calls between writes don't return a new array each time.
let cacheRaw: string | null = null;
let cacheParsed: RecentlyViewedItem[] = [];

export function getRecentlyViewed(): RecentlyViewedItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw === cacheRaw) return cacheParsed;
    cacheRaw = raw;
    cacheParsed = raw ? (JSON.parse(raw) as RecentlyViewedItem[]) : [];
    return cacheParsed;
  } catch {
    return [];
  }
}

export function recordRecentlyViewed(property: Property) {
  if (typeof window === "undefined") return;
  try {
    const existing = getRecentlyViewed().filter((x) => x.id !== property.id);
    const next = [{ ...property, viewedAt: new Date().toISOString() }, ...existing].slice(0, MAX_ITEMS);
    window.localStorage.setItem(KEY, JSON.stringify(next));
    cacheRaw = null; // invalidate so the next getRecentlyViewed() re-reads
  } catch {
    /* localStorage unavailable — not fatal */
  }
}
