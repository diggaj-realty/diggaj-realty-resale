"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { hasRole } from "@/lib/auth/roles";
import { createSiteVisit } from "@/lib/api/buyer";
import { ApiError } from "@/lib/api/client";
import { savePendingIntent, peekPendingIntent, clearPendingIntent, loginHrefWithReturn } from "@/lib/auth/redirectIntent";

export default function RequestVisitForm({ propertyId }: { propertyId: string }) {
  const { user, token } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const isBuyer = hasRole(user, "BUYER");

  const [date, setDate] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [disabled, setDisabled] = useState(false);
  const [done, setDone] = useState(false);
  const resumedRef = useRef(false);

  async function submitVisit(rawDate: string, rawNote: string) {
    if (!rawDate) {
      setError("Pick a date for your visit");
      return;
    }
    if (!isBuyer || !token) {
      savePendingIntent(propertyId, { type: "VISIT", date: rawDate, note: rawNote });
      router.push(loginHrefWithReturn("/login/buyer", pathname));
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await createSiteVisit(token, {
        propertyId,
        requestedDate: new Date(rawDate).toISOString(),
        buyerNote: rawNote.trim() || undefined,
      });
      setDone(true);
    } catch (err) {
      if (err instanceof ApiError && err.status === 403) {
        setDisabled(true);
      } else {
        setError(err instanceof ApiError ? err.message : "Failed to request a visit");
      }
    } finally {
      setSubmitting(false);
    }
  }

  function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    submitVisit(date, note);
  }

  // Resume a tour request that was interrupted by a login redirect — refills
  // the date/note and submits it, right after the user lands back here
  // authenticated. Deferred via microtask rather than called directly in the
  // effect body, since setState synchronously in an effect risks cascading
  // renders (same pattern as AuthContext.tsx). Only clears the stored intent
  // once the resumed submit has actually completed — peeking (not
  // consume-on-read) means this survives React Strict Mode's dev-only
  // double-invoke of effects, where a throwaway first mount would otherwise
  // delete it before the real, kept mount ever saw it.
  useEffect(() => {
    if (!isBuyer || !token || resumedRef.current) return;
    const intent = peekPendingIntent(propertyId);
    if (intent?.type === "VISIT") {
      resumedRef.current = true;
      queueMicrotask(async () => {
        setDate(intent.date);
        setNote(intent.note);
        await submitVisit(intent.date, intent.note);
        clearPendingIntent();
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isBuyer, token, propertyId]);

  const minDate = new Date().toISOString().slice(0, 10);

  if (done) {
    return (
      <div className="flex flex-col items-center rounded-2xl bg-white/5 px-6 py-8 text-center ring-1 ring-white/10">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-lime text-xl text-ink">✓</span>
        <p className="mt-4 text-sm font-medium text-white">Visit requested</p>
        <p className="mt-1 max-w-xs text-xs text-white/50">
          We&apos;ll confirm a time with you shortly — track it under My Site Visits.
        </p>
      </div>
    );
  }

  if (disabled) {
    return (
      <p className="rounded-2xl bg-white/5 px-5 py-4 text-xs text-white/60 ring-1 ring-white/10">
        Site visits are temporarily paused. Please check back soon, or contact us directly.
      </p>
    );
  }

  return (
    <form onSubmit={handleFormSubmit} className="flex flex-col gap-3">
      <label className="flex flex-col gap-1.5 text-xs text-white/70">
        Preferred date
        <input
          type="date"
          min={minDate}
          required
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="rounded-xl bg-white/5 px-4 py-3 text-sm text-white outline-none ring-1 ring-white/10 focus:ring-lime"
        />
      </label>
      <label className="flex flex-col gap-1.5 text-xs text-white/70">
        Note <span className="text-white/40">(optional)</span>
        <textarea
          rows={2}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Preferred time, questions…"
          className="resize-none rounded-xl bg-white/5 px-4 py-3 text-sm text-white outline-none ring-1 ring-white/10 placeholder:text-white/30 focus:ring-lime"
        />
      </label>
      {error && <p className="rounded-xl bg-red-500/10 px-4 py-2.5 text-xs text-red-300">{error}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="mt-1 rounded-full bg-lime px-6 py-3 text-sm font-semibold text-ink disabled:opacity-60"
      >
        {submitting ? "Requesting…" : "Request a tour"}
      </button>
    </form>
  );
}
