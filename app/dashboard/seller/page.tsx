"use client";

import { useEffect, useState } from "react";
import DashboardShell from "@/components/dashboard/DashboardShell";
import PropertyRow from "@/components/dashboard/PropertyRow";
import { RowSkeleton } from "@/components/Skeleton";
import { useAuth } from "@/lib/auth/AuthContext";
import { authedGet } from "@/lib/api/authed";
import type { Paginated, Property } from "@/types/api";

function MyListings() {
  const { token } = useAuth();
  const [listings, setListings] = useState<Property[] | null>(null);

  useEffect(() => {
    if (!token) return;
    authedGet<Paginated<Property>>("/listings?pageSize=20", token)
      .then((res) => setListings(res.items))
      .catch(() => setListings([]));
  }, [token]);

  return (
    <div>
      <h2 className="text-lg font-medium text-ink">My listings</h2>
      <div className="mt-4 flex flex-col gap-3">
        {listings === null && (
          <>
            <RowSkeleton />
            <RowSkeleton />
            <RowSkeleton />
          </>
        )}
        {listings?.length === 0 && (
          <p className="rounded-2xl bg-white p-6 text-sm text-body ring-1 ring-ink/5">
            No listings yet.
          </p>
        )}
        {listings?.map((p) => (
          <PropertyRow key={p.id} property={p} statusLabel={p.status} />
        ))}
      </div>
    </div>
  );
}

export default function SellerDashboardPage() {
  return (
    <DashboardShell role="SELLER">
      {(summary) => (
        <div className="flex flex-col gap-12">
          {summary.kyc && !summary.kyc.approved && (
            <div className="rounded-2xl bg-amber-50 p-5 text-sm text-amber-900 ring-1 ring-amber-200">
              {summary.kyc.rejected
                ? `KYC rejected${summary.kyc.remarks ? `: ${summary.kyc.remarks}` : ""}. Please resubmit.`
                : "Your KYC is pending review. You'll be able to publish listings once it's approved."}
            </div>
          )}
          <MyListings />
        </div>
      )}
    </DashboardShell>
  );
}
