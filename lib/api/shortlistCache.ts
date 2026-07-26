import { getShortlist } from "@/lib/api/buyer";

// ShortlistButton now renders on every card in a grid (Listings, Popular,
// AI results, etc.), each hydrating "is this saved?" on mount — without this,
// a 12-card grid would fire 12 identical GET /shortlists requests at once.
// This dedupes concurrent calls for the same token into one shared in-flight
// promise, same lightweight module-level-cache approach as
// lib/dashboard/panelCache.ts.
let cached: { token: string; promise: Promise<Set<string>> } | null = null;

export function getSharedShortlistIds(token: string): Promise<Set<string>> {
  if (cached && cached.token === token) return cached.promise;
  const promise = getShortlist(token).then((r) => new Set(r.items.map((p) => p.id)));
  cached = { token, promise };
  // Don't keep a failed fetch cached — the next mount should retry.
  promise.catch(() => {
    if (cached?.promise === promise) cached = null;
  });
  return promise;
}

/** Drop the cache after a toggle succeeds, so any button that mounts later
 *  this session re-fetches current truth instead of serving stale data. */
export function invalidateSharedShortlist() {
  cached = null;
}
