import Image from "next/image";
import Link from "next/link";
import { price } from "@/lib/listings";
import { propertyHref } from "@/lib/slug";
import type { Property } from "@/types/api";

export default function PropertyRow({ property, statusLabel }: { property: Property; statusLabel?: string }) {
  const cover = property.photos[0]?.url;
  return (
    <Link
      href={propertyHref(property)}
      className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-ink/5 transition-transform hover:-translate-y-0.5"
    >
      <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-xl bg-cream">
        {cover && <Image src={cover} alt={property.title} fill sizes="80px" className="object-cover" />}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-ink">{property.title}</p>
        <p className="truncate text-xs text-body">{property.location}</p>
      </div>
      <div className="shrink-0 text-right">
        <p className="text-sm font-semibold text-ink">{price(property.askingPrice)}</p>
        {statusLabel && <p className="mt-0.5 text-xs text-body">{statusLabel}</p>}
      </div>
    </Link>
  );
}
