"use client";

// Preserves what a logged-out visitor was trying to do (save/offer/tour) and
// where they were, across the login redirect — sessionStorage survives that
// navigation, unlike component state, which unmounts the moment the property
// page does.

const INTENT_KEY = "diggaj_pending_intent";

export type PendingIntent =
  | { type: "SHORTLIST" }
  | { type: "OFFER"; amount: string; message: string }
  | { type: "VISIT"; date: string; note: string };

type StoredIntent = PendingIntent & { propertyId: string; savedAt: number };

// Stale intents (user wandered off and logged in hours later from a
// different context) shouldn't silently fire — better to make them redo the
// action deliberately than surprise them with an old one.
const MAX_AGE_MS = 15 * 60 * 1000;

export function savePendingIntent(propertyId: string, intent: PendingIntent) {
  try {
    sessionStorage.setItem(INTENT_KEY, JSON.stringify({ ...intent, propertyId, savedAt: Date.now() }));
  } catch {
    // Storage unavailable (private browsing, etc.) — the action just won't
    // auto-resume after login; the user can simply retry it manually.
  }
}

/** Reads the pending intent if it matches this property and isn't stale —
 *  does NOT remove it (see clearPendingIntent). A plain consume-on-read
 *  doesn't survive React Strict Mode's dev-only double-invoke of effects
 *  (mount → discard → remount): the first, throwaway mount would consume
 *  and delete it before the real, kept mount ever saw it. Callers should
 *  peek here, run the resumed action, then call clearPendingIntent() once
 *  it actually completes. */
export function peekPendingIntent(propertyId: string): PendingIntent | null {
  try {
    const raw = sessionStorage.getItem(INTENT_KEY);
    if (!raw) return null;
    const stored = JSON.parse(raw) as StoredIntent;
    if (stored.propertyId !== propertyId) return null;
    if (Date.now() - stored.savedAt > MAX_AGE_MS) {
      sessionStorage.removeItem(INTENT_KEY);
      return null;
    }
    return stored;
  } catch {
    return null;
  }
}

export function clearPendingIntent(): void {
  try {
    sessionStorage.removeItem(INTENT_KEY);
  } catch {
    // ignore
  }
}

/** Login URL carrying the current path, so AuthForm/GoogleSignInButton can
 *  send the user back to the page they were on instead of always the fixed
 *  dashboard path. */
export function loginHrefWithReturn(loginPath: string, returnPath: string): string {
  return `${loginPath}?redirect=${encodeURIComponent(returnPath)}`;
}
