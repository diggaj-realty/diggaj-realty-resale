"use client";

import dynamic from "next/dynamic";
import { useAuth } from "@/lib/auth/AuthContext";
import { useCachedPanelData } from "@/lib/dashboard/useCachedPanelData";
import { getOffers } from "@/lib/api/buyer";
import { getMyListings } from "@/lib/api/seller";
import { getInterests } from "@/lib/api/interests";
import { statusLabel } from "@/components/dashboard/StatusBadge";
import { Skeleton } from "@/components/Skeleton";
import type { Offer } from "@/types/buyer";
import type { Property } from "@/types/api";
import type { PropertyInterest } from "@/types/transaction";

function ChartSkeleton() {
  return (
    <div className="rounded-[24px] bg-white p-5 shadow-sm ring-1 ring-ink/5">
      <Skeleton className="h-4 w-40" />
      <Skeleton className="mt-2 h-3 w-56" />
      <Skeleton className="mt-5 h-36 w-full rounded-xl" />
    </div>
  );
}

// Recharts is ~360KB of the dashboard overview's JS — by far the largest thing
// on the route, and these charts sit below the stats grid. Loading them
// dynamically keeps that weight out of the initial bundle so the page paints on
// the stats first, then streams the charts in. `ssr: false` because Recharts
// measures the DOM to size itself, so server-rendering it buys nothing.
const StatusBarChart = dynamic(() => import("@/components/dashboard/charts/StatusBarChart"), {
  ssr: false,
  loading: () => <ChartSkeleton />,
});
const ListingViewsChart = dynamic(() => import("@/components/dashboard/charts/ListingViewsChart"), {
  ssr: false,
  loading: () => <ChartSkeleton />,
});

/** Count by a key, preserving first-seen order so the chart doesn't reshuffle
 *  between renders. */
function tally<T>(rows: T[], key: (r: T) => string) {
  const out: { label: string; value: number }[] = [];
  const index = new Map<string, number>();
  for (const r of rows) {
    const k = key(r);
    const at = index.get(k);
    if (at === undefined) {
      index.set(k, out.length);
      out.push({ label: k, value: 1 });
    } else {
      out[at].value += 1;
    }
  }
  return out.sort((a, b) => b.value - a.value);
}

/** Buyer: how your offers are distributed across states. Real data only —
 *  `displayStatus` straight off GET /offers. */
export function BuyerCharts() {
  const { token } = useAuth();
  const cacheKey = token ? `buyerOffers:${token}` : null;
  const { items } = useCachedPanelData<Offer[]>(cacheKey, () =>
    getOffers(token!, "buyer").then((r) => r.items)
  );

  if (!items) return <ChartSkeleton />;
  if (items.length === 0) return null;

  return (
    <StatusBarChart
      title="Your offers by status"
      subtitle="Where each of your offers currently stands"
      data={tally(items, (o) => statusLabel(o.displayStatus))}
    />
  );
}

/** Seller: listing engagement + the incoming lead/offer split. */
export function SellerCharts() {
  const { token } = useAuth();
  const listingsKey = token ? `sellerListings:${token}` : null;
  const offersKey = token ? `sellerOffers:${token}` : null;
  const interestsKey = token ? `sellerInterests:${token}` : null;

  const { items: listings } = useCachedPanelData<Property[]>(listingsKey, () =>
    getMyListings(token!).then((r) => r.items)
  );
  const { items: offers } = useCachedPanelData<Offer[]>(offersKey, () =>
    getOffers(token!, "seller").then((r) => r.items)
  );
  const { items: interests } = useCachedPanelData<PropertyInterest[]>(interestsKey, () =>
    getInterests(token!).then((r) => r.items)
  );

  const loading = !listings || !offers || !interests;
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <ChartSkeleton />
        <ChartSkeleton />
      </div>
    );
  }

  const hasAny = listings.length > 0 || offers.length > 0 || interests.length > 0;
  if (!hasAny) return null;

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
      {listings.length > 0 && <ListingViewsChart listings={listings} />}
      {offers.length > 0 && (
        <StatusBarChart
          title="Offers by status"
          subtitle="Buyer offers across all your listings"
          data={tally(offers, (o) => statusLabel(o.displayStatus))}
        />
      )}
      {interests.length > 0 && (
        <StatusBarChart
          title="Enquiries by stage"
          subtitle="A snapshot of where your buyer leads sit right now"
          data={tally(interests, (i) => statusLabel(i.status))}
          // Interest statuses mutate in place and there's no transition log, so
          // this can only ever be a current snapshot — never a conversion rate.
          caveat="Current snapshot. Stages change in place, so this isn't a conversion rate over time."
        />
      )}
    </div>
  );
}
