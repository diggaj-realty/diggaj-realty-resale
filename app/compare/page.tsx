"use client";

import Image from "next/image";
import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import LeadSection from "@/components/LeadSection";
import { getProperty } from "@/lib/api/properties";
import { propertyHref } from "@/lib/slug";
import { sqft, buildSpecs } from "@/lib/property";
import { badgeFor, isElite } from "@/lib/badge";
import GatedPrice from "@/components/listings/GatedPrice";
import { ApiError } from "@/lib/api/client";
import type { Property } from "@/types/api";

function CompareContent() {
  const params = useSearchParams();
  const ids = (params.get("ids") ?? "").split(",").filter(Boolean).slice(0, 3);

  const [items, setItems] = useState<Property[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.allSettled(ids.map((id) => getProperty(id, { cache: "no-store" })))
      .then((results) => {
        const loaded = results
          .filter((r): r is PromiseFulfilledResult<Property> => r.status === "fulfilled")
          .map((r) => r.value);
        if (loaded.length === 0 && ids.length > 0) {
          setError("Failed to load properties");
          return;
        }
        setItems(loaded);
      })
      .catch((e) => setError(e instanceof ApiError ? e.message : "Failed to load properties"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ids.join(",")]);

  if (error) {
    return <p className="mx-8 mt-10 rounded-2xl bg-red-50 p-5 text-sm text-red-700 md:mx-14">{error}</p>;
  }

  if (items === null) {
    return <p className="mx-8 mt-10 text-sm text-body md:mx-14">Loading…</p>;
  }

  if (items.length < 2) {
    return (
      <div className="mx-8 mt-10 rounded-2xl bg-cream p-8 text-center text-sm text-body md:mx-14">
        Pick 2–3 properties from your shortlist to compare them side by side.
        <div className="mt-4">
          <Link href="/dashboard/buyer" className="rounded-full bg-panel px-5 py-2.5 text-xs font-medium text-white">
            Go to shortlist →
          </Link>
        </div>
      </div>
    );
  }

  // union of every spec label across the compared properties, in first-seen order
  const specRows = Array.from(new Map(items.flatMap(buildSpecs).map((s) => [s.label, s.label])).values());
  const specsByProperty = items.map((p) => new Map(buildSpecs(p).map((s) => [s.label, s.value])));

  return (
    <div className="overflow-x-auto px-8 pb-16 md:px-14">
      <table className="w-full min-w-[640px] border-separate border-spacing-0">
        <thead>
          <tr>
            <th className="w-32" />
            {items.map((p) => (
              <th key={p.id} className="w-64 px-3 pb-4 text-left align-top font-normal">
                <Link href={propertyHref(p)} className="block">
                  <div className="relative h-32 w-full overflow-hidden rounded-2xl bg-cream">
                    {p.photos[0]?.url && (
                      <Image src={p.photos[0].url} alt={p.title} fill sizes="256px" className="object-cover" />
                    )}
                    {isElite(p) && (
                      <span className="absolute left-2 top-2 rounded-full bg-panel px-2.5 py-1 text-[10px] font-semibold text-lime ring-1 ring-lime/30">
                        ✦ Elite
                      </span>
                    )}
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm font-medium text-ink">{p.title}</p>
                  <p className="mt-0.5 truncate text-xs text-body">{p.location}</p>
                </Link>
                <div className="mt-2">
                  <GatedPrice property={p} className="text-base font-semibold text-ink" />
                </div>
                <span className="mt-2 inline-block rounded-full bg-ink/5 px-2.5 py-1 text-[10px] font-medium text-ink/60">
                  {badgeFor(p)}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {specRows.map((label, i) => (
            <tr key={label} className={i % 2 === 0 ? "bg-cream" : "bg-white"}>
              <td className="whitespace-nowrap px-3 py-3 text-xs text-body">{label}</td>
              {specsByProperty.map((specs, ci) => (
                <td key={ci} className="px-3 py-3 text-sm font-medium text-ink">
                  {specs.get(label) ?? "-"}
                </td>
              ))}
            </tr>
          ))}
          <tr className={specRows.length % 2 === 0 ? "bg-cream" : "bg-white"}>
            <td className="whitespace-nowrap px-3 py-3 text-xs text-body">Area</td>
            {items.map((p) => (
              <td key={p.id} className="px-3 py-3 text-sm font-medium text-ink">
                {sqft(p.areaSqft)}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default function ComparePage() {
  return (
    <main className="min-h-screen overflow-x-clip bg-white">
      <div className="bg-cream pb-8">
        <Nav />
        <div className="px-8 pt-10 md:px-14">
          <h1 className="text-section font-medium tracking-[-0.02em] text-ink">Compare properties</h1>
          <p className="mt-2 text-sm text-body">A side-by-side look at your shortlisted homes.</p>
        </div>
      </div>
      <Suspense fallback={<p className="mx-8 mt-10 text-sm text-body md:mx-14">Loading…</p>}>
        <CompareContent />
      </Suspense>
      {/* Someone comparing two or three homes is as far down the funnel as
          this site gets, and the page previously offered them nothing but a
          link back to the shortlist. */}
      <LeadSection
        eyebrow="Still deciding?"
        title="Get a second opinion before you commit"
        lead="Send us the shortlist and an advisor will talk you through the trade-offs — pricing, locality, resale, and what the listing doesn't say."
        subject="Compare page enquiry"
        source="compare"
        cta="Talk it through"
      />
      <Footer />
    </main>
  );
}
