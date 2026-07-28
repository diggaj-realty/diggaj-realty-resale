"use client";

/** Shown on an Overview page when GET /dashboard failed.
 *
 *  Previously the shell itself bailed out on this error, replacing the sidebar,
 *  header and every child route with one red sentence — so a 5xx on this single
 *  endpoint locked the user out of Listings, Offers and Deals even though those
 *  endpoints were fine. Now only the summary area degrades, and it offers a real
 *  retry instead of requiring a page reload.
 */
export default function SummaryUnavailable({
  error,
  onRetry,
}: {
  error: string;
  onRetry: () => void;
}) {
  return (
    <div className="flex flex-col items-start gap-3 rounded-[24px] bg-red-50 p-5 ring-1 ring-red-200 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="text-sm font-medium text-red-900">Couldn&apos;t load your summary</p>
        <p className="mt-1 text-xs text-red-800/80">
          {error} Everything else in your dashboard still works — use the sidebar to carry on.
        </p>
      </div>
      <button
        onClick={onRetry}
        className="shrink-0 rounded-full bg-white px-4 py-2 text-xs font-medium text-red-900 ring-1 ring-red-200 transition-colors hover:bg-red-100"
      >
        Try again
      </button>
    </div>
  );
}
