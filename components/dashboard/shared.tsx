"use client";

import Link from "next/link";
import { RowSkeleton } from "@/components/Skeleton";

/** Guarded: called on ~15 optional-ish API fields, and an empty or malformed
 *  string used to render the literal text "Invalid Date" to the user. */
export const fmtDate = (iso: string | null | undefined) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? "—"
    : d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

export function Panel({
  loading,
  error,
  empty,
  emptyText,
  emptyAction,
  onRetry,
  children,
}: {
  loading: boolean;
  error: string | null;
  empty: boolean;
  emptyText: string;
  /** Optional CTA for the empty state — every emptyText names an action
   *  ("Browse listings and tap the heart"), which used to be unclickable prose. */
  emptyAction?: { href: string; label: string };
  onRetry?: () => void;
  children: React.ReactNode;
}) {
  if (loading)
    return (
      <div className="flex flex-col gap-3">
        <RowSkeleton />
        <RowSkeleton />
        <RowSkeleton />
      </div>
    );

  // An error is a non-blocking banner ABOVE the data, never a replacement for
  // it. Previously a failed remove/cancel/toggle set `error`, and this function
  // returned early — so the user's entire list disappeared and was replaced by
  // one red line, even though the rows were still in state.
  const banner = error ? (
    <div className="flex items-start justify-between gap-3 rounded-2xl bg-red-50 px-4 py-3 ring-1 ring-red-200">
      <p className="text-sm text-red-800">{error}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="shrink-0 rounded-full bg-white px-3 py-1 text-xs font-medium text-red-800 ring-1 ring-red-200 hover:bg-red-100"
        >
          Retry
        </button>
      )}
    </div>
  ) : null;

  if (empty)
    return (
      <div className="flex flex-col gap-3">
        {banner}
        <div className="flex flex-col items-center rounded-[24px] bg-white px-6 py-12 text-center ring-1 ring-ink/5">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-limepale text-ink">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M3 3h18v18H3z" opacity="0.25" /><path d="M8 12h8M12 8v8" />
            </svg>
          </span>
          <p className="mt-4 max-w-sm text-sm text-body">{emptyText}</p>
          {emptyAction && (
            <Link
              href={emptyAction.href}
              className="mt-5 inline-block rounded-full bg-panel px-6 py-3 text-sm font-medium text-white transition-transform hover:-translate-y-px"
            >
              {emptyAction.label}
            </Link>
          )}
        </div>
      </div>
    );

  return (
    <div className="flex flex-col gap-3">
      {banner}
      {children}
    </div>
  );
}

/** A dispute, an open query, or a fallen-through deal — states that stop the
 *  clock rather than just waiting on someone. Deliberately louder than the
 *  red error banner in `Panel` above (a block, not a line), so it reads as
 *  fundamentally different from "awaiting your confirmation." */
export function BlockedNotice({
  title,
  note,
  meta,
}: {
  title: string;
  note?: string | null;
  meta?: string;
}) {
  return (
    <div className="rounded-2xl bg-red-50 p-4 ring-1 ring-red-200">
      <p className="text-sm font-medium text-red-800">{title}</p>
      {note && <p className="mt-1 text-xs text-red-700">&ldquo;{note}&rdquo;</p>}
      {meta && <p className="mt-1 text-[11px] text-red-700/70">{meta}</p>}
    </div>
  );
}

export function Step({ done, label, detail }: { done: boolean; label: string; detail?: string }) {
  return (
    <div className="flex items-start gap-3">
      <span
        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] ${
          done ? "bg-lime text-ink" : "bg-ink/10 text-ink/40"
        }`}
      >
        {done ? "✓" : ""}
      </span>
      <div>
        <p className={`text-sm ${done ? "text-ink" : "text-ink/50"}`}>{label}</p>
        {detail && <p className="text-xs text-body">{detail}</p>}
      </div>
    </div>
  );
}
