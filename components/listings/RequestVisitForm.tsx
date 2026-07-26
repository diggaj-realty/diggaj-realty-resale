"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { hasRole } from "@/lib/auth/roles";
import { createSiteVisit } from "@/lib/api/buyer";
import { ApiError } from "@/lib/api/client";

export default function RequestVisitForm({ propertyId }: { propertyId: string }) {
  const { user, token } = useAuth();
  const router = useRouter();
  const isBuyer = hasRole(user, "BUYER");

  const [date, setDate] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [disabled, setDisabled] = useState(false);
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!isBuyer || !token) {
      router.push("/login/buyer");
      return;
    }
    if (!date) {
      setError("Pick a date for your visit");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await createSiteVisit(token, {
        propertyId,
        requestedDate: new Date(date).toISOString(),
        buyerNote: note.trim() || undefined,
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
    <form onSubmit={submit} className="flex flex-col gap-3">
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
