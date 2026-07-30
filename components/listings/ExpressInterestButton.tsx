"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { hasRole } from "@/lib/auth/roles";
import { expressInterest } from "@/lib/api/interests";
import { addShortlist } from "@/lib/api/buyer";
import { invalidateSharedShortlist } from "@/lib/api/shortlistCache";
import { ApiError } from "@/lib/api/client";
import { isBuyerPhoneRequired } from "@/lib/api/errorCodes";
import { HeartIcon } from "@/components/dashboard/icons";
import InlinePhoneCapture from "@/components/shared/InlinePhoneCapture";
import { savePendingIntent, peekPendingIntent, clearPendingIntent, loginHrefWithReturn } from "@/lib/auth/redirectIntent";
import type { PropertyInterest } from "@/types/transaction";

/** The primary, low-friction entry point on a property page: "I'm
 *  interested" — no amount, no commitment, just a lead the assigned agent
 *  can follow up on (call, site visit, offline negotiation). Distinct from
 *  MakeOfferModal (an online offer). Also shortlists the property, so there is
 *  no separate save button.
 *  Same submit-time-gated + resume-after-login pattern as those two. */
export default function ExpressInterestButton({
  propertyId,
  onExpressed,
}: {
  propertyId: string;
  /** Called with the resulting lead once expressed, so the parent action
   *  area can switch straight to the "you have an active interest" view. */
  onExpressed?: (interest: PropertyInterest) => void;
}) {
  const { user, token } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const isBuyer = hasRole(user, "BUYER");

  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Set once the backend responds 422 BUYER_PHONE_REQUIRED — the prompt is
  // the server's own message, shown verbatim. A subsequent 400 (bad format)
  // on the retry gets its own slot so it doesn't overwrite that prompt.
  const [phonePrompt, setPhonePrompt] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const resumedRef = useRef(false);

  async function submitInterest(rawNote: string, buyerPhone?: string) {
    if (!isBuyer || !token) {
      savePendingIntent(propertyId, { type: "INTEREST", note: rawNote });
      router.push(loginHrefWithReturn("/login/buyer", pathname));
      return;
    }
    setSubmitting(true);
    setError(null);
    if (buyerPhone) setPhoneError(null);
    try {
      const interest = await expressInterest(token, propertyId, {
        source: "GENERAL_INTEREST",
        buyerNote: rawNote.trim() || undefined,
        buyerPhone,
      });

      // Saving is a deliberate side effect of showing interest, so there's no
      // separate save button to forget: anything you enquired about is in your
      // saved list. Intentionally best-effort and swallowed — the lead is the
      // point, and the two most likely failures here are both harmless (the
      // property is already shortlisted, or the request just didn't land).
      // Surfacing either as an error would wrongly imply the interest failed.
      try {
        await addShortlist(token, propertyId);
        invalidateSharedShortlist();
      } catch {
        /* no-op: interest is recorded either way */
      }

      onExpressed?.(interest);
      setOpen(false);
    } catch (err) {
      if (isBuyerPhoneRequired(err)) {
        setPhonePrompt(err.message);
        return;
      }
      if (buyerPhone && err instanceof ApiError && err.status === 400) {
        // The number they just typed on retry is unusable — keep the phone
        // step open with its own error, don't fall back to the generic one.
        setPhoneError(err.message);
        return;
      }
      setError(err instanceof ApiError ? err.message : "Failed to record your interest");
    } finally {
      setSubmitting(false);
    }
  }

  function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    submitInterest(note);
  }

  // Resume an interest that was interrupted by a login redirect — same
  // peek/clear pattern as MakeOfferModal/RequestVisitForm/ShortlistButton
  // (survives React Strict Mode's dev-only double-invoke of effects).
  useEffect(() => {
    if (!isBuyer || !token || resumedRef.current) return;
    const intent = peekPendingIntent(propertyId);
    if (intent?.type === "INTEREST") {
      resumedRef.current = true;
      queueMicrotask(async () => {
        setNote(intent.note);
        await submitInterest(intent.note);
        clearPendingIntent();
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isBuyer, token, propertyId]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        // Icon-only: sits beside "Make an offer" on one line. Kept lime so the
        // lead action still carries the accent despite being the smaller target.
        title="Show interest — also saves this property"
        aria-label="Show interest — also saves this property"
        className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-lime text-ink transition-transform hover:-translate-y-px"
      >
        <HeartIcon className="h-5 w-5" />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center"
          onClick={() => setOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-t-[28px] bg-white p-6 sm:rounded-[28px]"
          >
            <div className="flex items-center justify-between">
              <p className="text-lg font-medium text-ink">Show interest</p>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="text-ink/40">
                ✕
              </button>
            </div>
            <p className="mt-1 text-xs text-body">
              We&apos;ll connect you with the assigned agent and save this home to your
              properties. No offer or commitment yet.
            </p>

            {phonePrompt ? (
              <div className="mt-5">
                <InlinePhoneCapture
                  prompt={phonePrompt}
                  submitting={submitting}
                  error={phoneError}
                  onSubmit={(phone) => submitInterest(note, phone)}
                />
              </div>
            ) : (
              <form onSubmit={handleFormSubmit}>
                <label className="mt-5 flex flex-col gap-1.5 text-sm text-ink">
                  Anything the agent should know? <span className="font-normal text-body">(optional)</span>
                  <textarea
                    rows={3}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Preferred contact time, questions…"
                    className="resize-none rounded-xl border border-ink/10 bg-white px-4 py-3 text-sm outline-none focus:border-ink/30"
                  />
                </label>

                {error && <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

                <button
                  type="submit"
                  disabled={submitting}
                  className="mt-5 w-full rounded-full bg-panel px-6 py-3.5 text-sm font-medium text-white disabled:opacity-60"
                >
                  {submitting ? "Sending…" : "Confirm interest"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
