import Nav from "@/components/Nav";
import { Skeleton } from "@/components/Skeleton";

export default function LoadingListingDetail() {
  return (
    <main className="min-h-screen overflow-x-clip bg-white">
      <div className="bg-cream pb-8">
        <Nav />
        <div className="px-8 pt-10 md:px-14">
          <Skeleton className="h-3 w-48" />
          <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="w-full">
              <div className="flex gap-2">
                <Skeleton className="h-7 w-20 rounded-full" />
                <Skeleton className="h-7 w-16 rounded-full" />
              </div>
              <Skeleton className="mt-4 h-12 w-3/4 max-w-2xl" />
              <Skeleton className="mt-3 h-4 w-1/2 max-w-md" />
            </div>
            <div className="flex flex-col items-start gap-3 md:items-end">
              <Skeleton className="h-12 w-40" />
              <Skeleton className="h-9 w-32 rounded-full" />
            </div>
          </div>
        </div>
      </div>

      {/* gallery */}
      <div className="grid grid-cols-1 gap-2.5 px-3 pt-3 md:grid-cols-[1.7fr_1fr]">
        <Skeleton className="h-[34vh] max-h-[460px] rounded-[24px] md:h-[46vh]" />
        <div className="hidden grid-cols-2 gap-2.5 md:grid">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[22vh] rounded-[24px]" />
          ))}
        </div>
      </div>

      {/* stat strip */}
      <div className="grid grid-cols-2 gap-2.5 px-3 pt-3 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-[24px]" />
        ))}
      </div>

      {/* body */}
      <div className="grid gap-14 px-8 py-16 md:px-14 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-4">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-full max-w-xl" />
          <Skeleton className="h-4 w-5/6 max-w-xl" />
          <Skeleton className="h-4 w-2/3 max-w-xl" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-40 rounded-[24px]" />
          <Skeleton className="h-64 rounded-[28px]" />
        </div>
      </div>
    </main>
  );
}
