"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { hasRole } from "@/lib/auth/roles";
import { createOffer } from "@/lib/api/buyer";
import { ApiError } from "@/lib/api/client";
import { price } from "@/lib/listings";
import { savePendingIntent, peekPendingIntent, clearPendingIntent, loginHrefWithReturn } from "@/lib/auth/redirectIntent";

export default function MakeOfferModal({
  propertyId,
  askingPrice,
}: {
  propertyId: string;
  askingPrice: number;
}) {
  const { user, token } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const isBuyer = hasRole(user, "BUYER");

  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const resumedRef = useRef(false);

  // Anyone can open and fill in the form — signing in is only required to
  // actually submit, checked (and prompted for) at that point instead of
  // gating the button itself, so a logged-out visitor never loses what
  // they've typed just for looking.
  function openModal() {
    setOpen(true);
  }

  async function submitOffer(rawAmount: string, rawMessage: string) {
    const numeric = Number(rawAmount);
    if (!Number.isFinite(numeric) || numeric <= 0) {
      setError("Enter a valid offer amount");
      return;
    }
    if (!isBuyer || !token) {
      savePendingIntent(propertyId, { type: "OFFER", amount: rawAmount, message: rawMessage });
      router.push(loginHrefWithReturn("/login/buyer", pathname));
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await createOffer(token, { propertyId, amount: numeric, message: rawMessage.trim() || undefined });
      setDone(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to submit offer");
    } finally {
      setSubmitting(false);
    }
  }

  function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    submitOffer(amount, message);
  }

  // Resume an offer that was interrupted by a login redirect — reopens the
  // modal with what was typed and submits it, right after the user lands
  // back here authenticated. Deferred via microtask rather than called
  // directly in the effect body, since setState synchronously in an effect
  // risks cascading renders (same pattern as AuthContext.tsx). Only clears
  // the stored intent once the resumed submit has actually completed —
  // peeking (not consume-on-read) means this survives React Strict Mode's
  // dev-only double-invoke of effects, where a throwaway first mount would
  // otherwise delete it before the real, kept mount ever saw it.
  useEffect(() => {
    if (!isBuyer || !token || resumedRef.current) return;
    const intent = peekPendingIntent(propertyId);
    if (intent?.type === "OFFER") {
      resumedRef.current = true;
      queueMicrotask(async () => {
        setAmount(intent.amount);
        setMessage(intent.message);
        setOpen(true);
        await submitOffer(intent.amount, intent.message);
        clearPendingIntent();
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isBuyer, token, propertyId]);

  function close() {
    setOpen(false);
    setDone(false);
    setAmount("");
    setMessage("");
    setError(null);
  }

  return (
    <>
      <button
        onClick={openModal}
        className="w-full rounded-full bg-panel px-6 py-3.5 text-sm font-medium text-white transition-transform hover:-translate-y-px"
      >
        Make an offer
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center"
          onClick={close}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-t-[28px] bg-white p-6 sm:rounded-[28px]"
          >
            {done ? (
              <div className="flex flex-col items-center py-6 text-center">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-lime text-2xl text-ink">
                  ✓
                </span>
                <p className="mt-5 text-xl font-medium text-ink">Offer submitted</p>
                <p className="mt-2 max-w-xs text-sm text-body">
                  Our team reviews every offer before it reaches the seller; you&apos;ll be notified once it&apos;s
                  forwarded.
                </p>
                <button
                  onClick={close}
                  className="mt-6 rounded-full bg-panel px-6 py-3 text-sm text-white"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit}>
                <div className="flex items-center justify-between">
                  <p className="text-lg font-medium text-ink">Make an offer</p>
                  <button type="button" onClick={close} aria-label="Close" className="text-ink/40">
                    ✕
                  </button>
                </div>
                <p className="mt-1 text-xs text-body">Asking price: {price(askingPrice)}</p>

                <label className="mt-5 flex flex-col gap-1.5 text-sm text-ink">
                  Your offer (₹)
                  <input
                    type="number"
                    min={1}
                    required
                    autoFocus
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder={String(Math.round(askingPrice * 0.95))}
                    className="rounded-xl border border-ink/10 bg-white px-4 py-3 text-sm outline-none focus:border-ink/30"
                  />
                </label>

                <label className="mt-4 flex flex-col gap-1.5 text-sm text-ink">
                  Message <span className="font-normal text-body">(optional)</span>
                  <textarea
                    rows={3}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Anything the seller should know…"
                    className="resize-none rounded-xl border border-ink/10 bg-white px-4 py-3 text-sm outline-none focus:border-ink/30"
                  />
                </label>

                {error && <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

                <p className="mt-4 text-[11px] leading-relaxed text-ink/40">
                  Every offer is reviewed by our team before it reaches the seller, usually within 24 hours.
                </p>

                <button
                  type="submit"
                  disabled={submitting}
                  className="mt-5 w-full rounded-full bg-panel px-6 py-3.5 text-sm font-medium text-white disabled:opacity-60"
                >
                  {submitting ? "Submitting…" : "Submit offer"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
