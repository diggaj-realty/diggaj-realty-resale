"use client";

import Link from "next/link";
import { useEffect } from "react";

/** Error boundary for every /dashboard route.
 *
 *  There was no error.tsx anywhere in the app, so a single render throw in one
 *  panel — a `.map` over a payload that came back as an object instead of an
 *  array, an unguarded `photos[0]`, a null party on a deal — took down the whole
 *  dashboard to a blank white screen with no way back.
 *
 *  Next only uses this for render/effect throws; rejected fetches are still each
 *  panel's own business (see the Panel error banner in dashboard/shared.tsx).
 */
export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Without this the message is swallowed in production and the page is
    // simply blank-then-boundary, leaving nothing to debug from.
    console.error("Dashboard render error:", error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-cream px-6 py-16">
      <div className="w-full max-w-md rounded-[24px] bg-white p-7 text-center shadow-sm ring-1 ring-ink/5">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-700">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
            <path d="M12 9v4M12 17h.01" />
            <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
          </svg>
        </span>
        <h1 className="mt-4 text-subhead font-medium text-ink">Something went wrong</h1>
        <p className="mt-2 text-sm text-body">
          This section failed to render. Your data is safe — nothing was changed.
        </p>
        {error.digest && (
          <p className="mt-3 font-mono text-[11px] text-ink/35">Ref: {error.digest}</p>
        )}
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <button
            onClick={reset}
            className="rounded-full bg-panel px-6 py-3 text-sm font-medium text-white transition-transform hover:-translate-y-px"
          >
            Try again
          </button>
          <Link
            href="/"
            className="rounded-full bg-ink/5 px-6 py-3 text-sm font-medium text-ink transition-colors hover:bg-ink/10"
          >
            Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}
