import { Suspense } from "react";
import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ListingsBrowser, { PAGE_SIZE } from "@/components/listings/ListingsBrowser";
import { ListingGridSkeleton } from "@/components/Skeleton";
import { getProperties } from "@/lib/api/properties";
import { parseFilterSearchParams } from "@/lib/filters";
import type { Paginated, Property } from "@/types/api";

export const metadata: Metadata = {
  title: "Homes for Sale — Diggaj Realty",
  description:
    "Browse every home on Diggaj Realty. Filter by city, price, and bedrooms — every listing eligible for commission cash back.",
};

// Fetches page 1 for whatever filters are in the URL so the first paint
// already has real listing HTML (and real <title>-adjacent content for
// crawlers) instead of a client-fetched skeleton. Falls back to letting
// ListingsBrowser fetch client-side if this ever fails.
async function loadInitialPage(
  searchParams: Record<string, string | string[] | undefined>
): Promise<Paginated<Property> | undefined> {
  const sp = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    if (typeof value === "string") sp.set(key, value);
    else if (Array.isArray(value) && value[0] != null) sp.set(key, value[0]);
  }
  const filters = parseFilterSearchParams(sp);
  try {
    return await getProperties({ ...filters, page: 1, pageSize: PAGE_SIZE }, { revalidate: 60 });
  } catch {
    return undefined;
  }
}

export default async function ListingsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const initialData = await loadInitialPage(await searchParams);

  return (
    <main className="min-h-screen overflow-x-clip bg-white">
      <div className="bg-cream pb-10">
        <Nav />
        <div className="px-8 pt-14 md:px-14">
          <h1 className="max-w-3xl text-5xl font-medium tracking-[-0.03em] text-ink md:text-6xl">
            Homes for sale
          </h1>
          <p className="mt-5 max-w-md text-[15px] leading-relaxed text-ink/70">
            Every listing below is eligible for commission cash back — an
            average of ₹5 Lakh returned at closing.
          </p>
        </div>
      </div>
      <Suspense
        fallback={
          <section className="px-8 py-12 md:px-14">
            <ListingGridSkeleton count={6} />
          </section>
        }
      >
        <ListingsBrowser initialData={initialData} />
      </Suspense>
      <Footer />
    </main>
  );
}
