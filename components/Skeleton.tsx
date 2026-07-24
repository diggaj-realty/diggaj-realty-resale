export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-ink/10 ${className}`} />;
}

/** Matches the ListingCard layout so grids swap in without layout shift. */
function ListingCardSkeleton() {
  return (
    <div>
      <Skeleton className="aspect-[10/9] w-full rounded-[20px]" />
      <div className="mt-4 flex items-center gap-2">
        <Skeleton className="h-3 w-36" />
      </div>
      <div className="mt-2 flex items-center justify-between gap-4">
        <Skeleton className="h-5 w-1/2" />
        <Skeleton className="h-5 w-16" />
      </div>
      <Skeleton className="mt-2 h-3 w-28" />
    </div>
  );
}

export function ListingGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-x-7 gap-y-14 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <ListingCardSkeleton key={i} />
      ))}
    </div>
  );
}

/** Generic card-row skeleton for dashboard lists. */
export function RowSkeleton() {
  return (
    <div className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-ink/5">
      <Skeleton className="h-16 w-20 shrink-0 rounded-xl" />
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-1/3" />
      </div>
      <Skeleton className="h-8 w-20 shrink-0 rounded-full" />
    </div>
  );
}
