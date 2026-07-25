"use client";

import Image from "next/image";
import Link from "next/link";
import { useSyncExternalStore } from "react";
import { price } from "@/lib/listings";
import { useAuth } from "@/lib/auth/AuthContext";
import { getRecentlyViewed, type RecentlyViewedItem } from "@/lib/recentlyViewed";

// No native "changed" event for same-tab localStorage writes, so subscribe is
// a no-op — we only need a hydration-safe *initial* read (empty on the server,
// real value once mounted in the browser), matching the Footer.tsx precedent.
const subscribe = () => () => {};
const EMPTY: RecentlyViewedItem[] = [];
const getServerSnapshot = () => EMPTY;

export default function RecentlyViewed() {
  const { user } = useAuth();
  const items = useSyncExternalStore(subscribe, getRecentlyViewed, getServerSnapshot);

  if (items.length === 0) return null;

  return (
    <section className="bg-white px-8 py-16 md:px-14">
      <h2 className="text-2xl font-medium tracking-[-0.02em] text-ink md:text-3xl">Recently viewed</h2>
      <div className="mt-6 flex gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {items.map((p) => {
          const locked = p.plan === "ELITE" && !user;
          return (
            <Link
              key={p.id}
              href={`/listings/x--${p.id}`}
              className="w-52 shrink-0 overflow-hidden rounded-2xl bg-cream shadow-sm ring-1 ring-ink/5 transition-transform hover:-translate-y-1"
            >
              <div className="relative h-32 w-full bg-cream">
                {p.cover && <Image src={p.cover} alt={p.title} fill sizes="208px" className="object-cover" />}
                {p.plan === "ELITE" && (
                  <span className="absolute left-2 top-2 rounded-full bg-panel px-2 py-1 text-[10px] font-semibold text-lime ring-1 ring-lime/30">
                    ✦ Elite
                  </span>
                )}
              </div>
              <div className="p-3">
                <p className="truncate text-sm font-medium text-ink">{p.title}</p>
                <p className="truncate text-xs text-body">{p.location}</p>
                <p className="mt-1.5 text-sm font-semibold text-ink">
                  {locked ? <span className="select-none tracking-widest">₹ •• •• •••</span> : price(p.askingPrice)}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
