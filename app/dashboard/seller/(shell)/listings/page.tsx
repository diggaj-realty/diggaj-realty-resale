import Link from "next/link";
import { ListingsPanel } from "@/components/dashboard/seller/panels";

export default function SellerListingsPage() {
  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-medium tracking-[-0.02em] text-ink">My listings</h1>
          <p className="mt-1 text-sm text-body">Every listing you&apos;ve submitted, with its review status.</p>
        </div>
        <Link
          href="/dashboard/seller/listings/new"
          className="shrink-0 rounded-full bg-panel px-5 py-2.5 text-sm font-medium text-white"
        >
          + Add listing
        </Link>
      </div>
      <div className="mt-6">
        <ListingsPanel />
      </div>
    </div>
  );
}
