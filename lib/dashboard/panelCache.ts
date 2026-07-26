// Each dashboard panel lives on its own route, so navigating away and back
// unmounts/remounts it — without this, that means a fresh fetch and a full
// loading skeleton every single time, even seconds after the same data was
// already loaded. This is a plain in-memory cache (not persisted, cleared on
// a full page reload) that panels seed their initial state from, so a
// revisit within the same tab renders instantly while still refetching in
// the background to stay current.
const cache = new Map<string, unknown>();

export function getCached<T>(key: string): T | undefined {
  return cache.get(key) as T | undefined;
}

export function setCached<T>(key: string, value: T): void {
  cache.set(key, value);
}

/** Drops every cached entry whose key starts with `prefix` — for when an
 *  action on one panel (e.g. accepting an offer) makes another panel's
 *  cached data stale (e.g. the deals list, which gains a new row) before
 *  that panel's own route is ever visited. */
export function invalidate(prefix: string): void {
  for (const key of cache.keys()) {
    if (key.startsWith(prefix)) cache.delete(key);
  }
}
