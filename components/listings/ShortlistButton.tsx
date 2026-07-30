"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { hasRole } from "@/lib/auth/roles";
import { addShortlist, removeShortlist } from "@/lib/api/buyer";
import { expressInterest } from "@/lib/api/interests";
import { getSharedShortlistIds, invalidateSharedShortlist } from "@/lib/api/shortlistCache";
import { savePendingIntent, peekPendingIntent, clearPendingIntent, loginHrefWithReturn } from "@/lib/auth/redirectIntent";
import { ApiError } from "@/lib/api/client";
import { isBuyerPhoneRequired } from "@/lib/api/errorCodes";
import { agentAssignedMessage } from "@/lib/interestMessages";
import InlinePhoneCapture from "@/components/shared/InlinePhoneCapture";

export default function ShortlistButton({
  propertyId,
  compact = false,
}: {
  propertyId: string;
  /** Smaller, shadowed circle tuned for overlaying a listing card's photo,
   *  instead of the slightly larger ringed circle used in the property page's
   *  action stack. Both are icon-only. The post-save "contact me?" follow-up
   *  only renders in the non-compact (property page) context — there's no
   *  room for it inside a card-grid thumbnail. */
  compact?: boolean;
}) {
  const { user, token } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const isBuyer = hasRole(user, "BUYER");
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Saving now 400s if the property isn't LIVE anymore — once that happens,
  // stop letting the user retry against a listing that's gone.
  const [stale, setStale] = useState(false);
  const resumedRef = useRef(false);

  // Post-save "want an agent to call you?" prompt — the only path that turns
  // a silent bookmark into an actionable lead. Not shown in compact mode.
  const [showContactPrompt, setShowContactPrompt] = useState(false);
  const [contactSubmitting, setContactSubmitting] = useState(false);
  const [contactPhonePrompt, setContactPhonePrompt] = useState<string | null>(null);
  const [contactPhoneError, setContactPhoneError] = useState<string | null>(null);
  const [contactMessage, setContactMessage] = useState<string | null>(null);

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
      await (next ? addShortlist(token, propertyId) : removeShortlist(token, propertyId));
      invalidateSharedShortlist();
      if (next && !compact) setShowContactPrompt(true);
    } catch (err) {
      setSaved(!next); // revert
      if (err instanceof ApiError && err.status === 400) {
        // "This property is no longer available" — verbatim, and stop
        // letting the button be retried against a listing that's gone.
        setError(err.message);
        setStale(true);
      } else {
        setError("Couldn't save, try again");
      }
    } finally {
      setBusy(false);
    }
  }

  async function requestContact(buyerPhone?: string) {
    if (!token) return;
    setContactSubmitting(true);
    if (buyerPhone) setContactPhoneError(null);
    try {
      const interest = await expressInterest(token, propertyId, { source: "CONTACT_REQUEST", buyerPhone });
      setContactMessage(agentAssignedMessage(interest) ?? "An agent will be in touch.");
      setContactPhonePrompt(null);
    } catch (err) {
      if (isBuyerPhoneRequired(err)) {
        setContactPhonePrompt(err.message);
        return;
      }
      if (buyerPhone && err instanceof ApiError && err.status === 400) {
        setContactPhoneError(err.message);
        return;
      }
      setContactMessage(err instanceof ApiError ? err.message : "Couldn't reach an agent right now.");
    } finally {
      setContactSubmitting(false);
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
        disabled={busy || stale}
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

      {showContactPrompt && (
        <div className="absolute top-full left-1/2 z-20 mt-2 w-64 -translate-x-1/2 rounded-2xl bg-white p-4 text-left shadow-lg ring-1 ring-ink/10">
          {contactMessage ? (
            <p className="text-sm text-ink">{contactMessage}</p>
          ) : contactPhonePrompt ? (
            <InlinePhoneCapture
              prompt={contactPhonePrompt}
              submitting={contactSubmitting}
              error={contactPhoneError}
              onSubmit={(phone) => requestContact(phone)}
            />
          ) : (
            <>
              <p className="text-sm text-ink">Saved. Want an agent to call you about this one?</p>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => requestContact()}
                  disabled={contactSubmitting}
                  className="rounded-full bg-panel px-4 py-2 text-xs font-medium text-white disabled:opacity-60"
                >
                  {contactSubmitting ? "Please wait…" : "Yes, contact me"}
                </button>
                <button
                  onClick={() => setShowContactPrompt(false)}
                  className="rounded-full px-4 py-2 text-xs font-medium text-body underline underline-offset-4"
                >
                  Not now
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
