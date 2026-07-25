"use client";

import { useEffect, useState } from "react";
import { getCached, setCached } from "@/lib/dashboard/panelCache";

type Updater<T> = T | ((prev: T | null) => T | null);

/** The fetch+cache boilerplate shared by every dashboard panel: seed state
 *  from the in-memory panel cache (instant on revisit — see panelCache.ts),
 *  fetch fresh data on mount/key change, and keep the cache in sync with
 *  whatever's fetched. Each panel still owns its own mutation methods
 *  (remove/respond/toggle/etc.) via the returned `setItems`, which also
 *  writes through to the cache so those changes survive a remount too. */
export function useCachedPanelData<T>(cacheKey: string | null, fetchFn: () => Promise<T>) {
  const [items, setItemsState] = useState<T | null>(() => (cacheKey ? getCached<T>(cacheKey) ?? null : null));
  const [error, setError] = useState<string | null>(null);

  function setItems(updater: Updater<T>) {
    setItemsState((prev) => {
      const next = typeof updater === "function" ? (updater as (p: T | null) => T | null)(prev) : updater;
      if (cacheKey && next != null) setCached(cacheKey, next);
      return next;
    });
  }

  function load() {
    if (!cacheKey) return;
    fetchFn()
      .then((result) => {
        setCached(cacheKey, result);
        setItemsState(result);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"));
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(load, [cacheKey]);

  return { items, setItems, error, setError, load } as const;
}
