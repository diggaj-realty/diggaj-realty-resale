"use client";

import Image from "next/image";
import Link from "next/link";
import { propertyHref } from "@/lib/slug";
import type { Property } from "@/types/api";

function Card({ home }: { home: Property }) {
  const cover = home.photos[0]?.url;

  return (
    <Link
      href={propertyHref(home)}
      className="group relative block h-72 w-80 shrink-0 snap-start overflow-hidden rounded-2xl bg-cream sm:h-80 sm:w-96"
    >
      {cover ? (
        <Image
          src={cover}
          alt={home.title}
          fill
          sizes="384px"
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-xs text-body">No photo yet</div>
      )}
      <div className="absolute left-3 top-3">
        <span className="rounded-full bg-panel px-2.5 py-1 text-xs font-semibold text-lime shadow ring-1 ring-lime/30">
          ✦ Elite
        </span>
      </div>
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-4 pt-10 text-white">
        <p className="truncate text-base font-medium tracking-[-0.01em]">{home.title}</p>
        <p className="mt-1 truncate text-xs text-white/75">{home.location}</p>
      </div>
    </Link>
  );
}

export default function EliteStripSection({ homes }: { homes: Property[] }) {
  return (
    <div>
      <div className="flex items-end justify-between gap-6">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-lime">Elite</p>
          <h2 className="mt-0.5 text-base font-medium tracking-[-0.02em] text-white sm:text-lg">
            Elite properties
          </h2>
        </div>
        <Link href="/listings" className="hidden shrink-0 text-xs font-medium text-white/70 hover:text-white sm:block">
          View all →
        </Link>
      </div>

      <div className="mt-3 flex snap-x snap-mandatory gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {homes.map((h) => (
          <Card key={h.id} home={h} />
        ))}
      </div>
    </div>
  );
}
