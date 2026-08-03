import Image from "next/image";
import Link from "next/link";
import { price } from "@/lib/listings";
import { propertyHref } from "@/lib/slug";
import StatusBadge from "@/components/dashboard/StatusBadge";
import type { Property } from "@/types/api";

export default function PropertyRow({
  property,
  actions,
}: {
  property: Property;
  /** Extra controls (e.g. "Request Elite") rendered below the row, outside
   *  the navigation link so they don't nest interactive elements inside it. */
  actions?: React.ReactNode;
}) {
  const cover = property.photos?.[0]?.url;
  return (
    <div className="rounded-2xl bg-white shadow-sm ring-1 ring-ink/5">
      <Link
        href={propertyHref(property)}
        className="flex items-center gap-4 p-4 transition-transform hover:-translate-y-0.5"
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
          <div className="mt-1 flex justify-end">
            <StatusBadge status={property.status} />
          </div>
        </div>
      </Link>
      {actions && <div className="flex flex-wrap items-center gap-2 border-t border-ink/5 px-4 py-3">{actions}</div>}
    </div>
  );
}
