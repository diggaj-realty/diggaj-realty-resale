import type { PropertyPlan } from "@/types/api";

export type RecentlyViewedItem = {
  id: string;
  title: string;
  location: string;
  cover?: string;
  bhk: number | null;
  areaSqft: number;
  askingPrice: number;
  plan: PropertyPlan;
  viewedAt: string;
};

const KEY = "diggaj_recently_viewed";
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

export function recordRecentlyViewed(item: Omit<RecentlyViewedItem, "viewedAt">) {
  if (typeof window === "undefined") return;
  try {
    const existing = getRecentlyViewed().filter((x) => x.id !== item.id);
    const next = [{ ...item, viewedAt: new Date().toISOString() }, ...existing].slice(0, MAX_ITEMS);
    window.localStorage.setItem(KEY, JSON.stringify(next));
    cacheRaw = null; // invalidate so the next getRecentlyViewed() re-reads
  } catch {
    /* localStorage unavailable — not fatal */
  }
}
