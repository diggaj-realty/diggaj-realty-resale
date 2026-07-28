"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { hasRole } from "@/lib/auth/roles";
import { authedSend } from "@/lib/api/authed";
import { getSharedShortlistIds, invalidateSharedShortlist } from "@/lib/api/shortlistCache";
import { savePendingIntent, peekPendingIntent, clearPendingIntent, loginHrefWithReturn } from "@/lib/auth/redirectIntent";

export default function ShortlistButton({
  propertyId,
  compact = false,
}: {
  propertyId: string;
  /** Smaller, shadowed circle tuned for overlaying a listing card's photo,
   *  instead of the slightly larger ringed circle used in the property page's
   *  action stack. Both are icon-only. */
  compact?: boolean;
}) {
  const { user, token } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const isBuyer = hasRole(user, "BUYER");
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const resumedRef = useRef(false);

  // hydrate current membership for logged-in buyers — shared/deduped across
  // every ShortlistButton mounted at once (a grid of cards), so this doesn't
  // fire one GET /shortlists per card.
  useEffect(() => {
    if (!isBuyer || !token) return;
    getSharedShortlistIds(token)
      .then((ids) => {
        // A resumed post-login toggle (below) can complete before this
        // fetch — which was snapshotted pre-toggle — resolves. Don't let a
        // stale response stomp the more recent, authoritative result.
        if (resumedRef.current) return;
        setSaved(ids.has(propertyId));
      })
      .catch(() => setError("Couldn't check your saved properties"));
  }, [isBuyer, token, propertyId]);

  async function toggle() {
    if (!isBuyer || !token) {
      savePendingIntent(propertyId, { type: "SHORTLIST" });
      router.push(loginHrefWithReturn("/login/buyer", pathname));
      return;
    }
    setBusy(true);
    setError(null);
    const next = !saved;
    setSaved(next); // optimistic
    try {
      await authedSend(`/shortlists${next ? "" : `/${propertyId}`}`, token, {
        method: next ? "POST" : "DELETE",
        body: next ? { propertyId } : undefined,
      });
      invalidateSharedShortlist();
    } catch {
      setSaved(!next); // revert
      setError("Couldn't save, try again");
    } finally {
      setBusy(false);
    }
  }

  // Resume a save that was interrupted by a login redirect — fires once,
  // right after the user lands back here authenticated. Deferred via
  // microtask rather than called directly in the effect body, since
  // setState synchronously in an effect risks cascading renders (same
  // pattern as AuthContext.tsx). Only clears the stored intent once the
  // resumed toggle has actually completed — peeking (not consume-on-read)
  // means this survives React Strict Mode's dev-only double-invoke of
  // effects, where a throwaway first mount would otherwise delete it before
  // the real, kept mount ever saw it.
  useEffect(() => {
    if (!isBuyer || !token || resumedRef.current) return;
    const intent = peekPendingIntent(propertyId);
    if (intent?.type === "SHORTLIST") {
      resumedRef.current = true;
      queueMicrotask(async () => {
        await toggle();
        clearPendingIntent();
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isBuyer, token, propertyId]);

  return (
    <div className={compact ? "relative inline-block" : "relative w-full"}>
      <button
        onClick={(e) => {
          // Harmless when this button stands alone (property detail page);
          // required when it overlays a ListingCard's thumbnail, which is
          // itself wrapped in a Link — without this, the click would bubble
          // up and navigate instead of toggling the heart.
          e.preventDefault();
          e.stopPropagation();
          toggle();
        }}
        disabled={busy}
        aria-pressed={saved}
        // Now that there's no visible label anywhere, `title` gives sighted
        // users the same hover affordance aria-label gives screen readers.
        title={isBuyer ? (saved ? "Saved" : "Save") : "Save to shortlist"}
        aria-label={isBuyer ? (saved ? "Saved" : "Save") : "Save to shortlist"}
        className={
          compact
            ? `flex h-9 w-9 items-center justify-center rounded-full shadow ring-1 transition-colors disabled:opacity-60 ${
                saved ? "bg-lime text-ink ring-lime" : "bg-white/90 text-ink ring-ink/10 hover:bg-white"
              }`
            : // Icon-only circle on the property page: the heart alone carries
              // the meaning (filled = saved), and dropping the label keeps this
              // the quietest thing in the action stack. Saved uses the pale lime
              // tint, not solid lime, which competed with the primary CTA.
              `inline-flex h-11 w-11 items-center justify-center rounded-full ring-1 transition-colors disabled:opacity-60 ${
                saved
                  ? "bg-limepale text-ink ring-lime/50"
                  : "bg-white text-ink ring-ink/15 hover:bg-cream"
              }`
        }
      >
        <svg
          width="16" height="16" viewBox="0 0 24 24"
          fill={saved ? "currentColor" : "none"}
          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden
        >
          <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z" />
        </svg>
      </button>
      {error && (
        <p className="absolute top-full left-1/2 mt-1.5 w-max max-w-[10rem] -translate-x-1/2 text-center text-[11px] text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
