import { Suspense } from "react";
import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ListingsBrowser from "@/components/listings/ListingsBrowser";

export const metadata: Metadata = {
  title: "Homes for Sale — Diggaj Realty",
  description:
    "Browse every home on Diggaj Realty. Filter by city, price, and bedrooms — every listing eligible for commission cash back.",
};

export default function ListingsPage() {
  return (
    <main className="min-h-screen bg-white">
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
      <Suspense>
        <ListingsBrowser />
      </Suspense>
      <Footer />
    </main>
  );
}
