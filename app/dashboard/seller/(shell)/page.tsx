"use client";

import Link from "next/link";
import { useDashboardSummary } from "@/components/dashboard/DashboardSummaryContext";
import StatsGrid from "@/components/dashboard/StatsGrid";
import SectionLinks from "@/components/dashboard/SectionLinks";
import RecentActivity from "@/components/dashboard/RecentActivity";
import { SELLER_NAV } from "@/lib/dashboard/nav";

export default function SellerOverviewPage() {
  const summary = useDashboardSummary();
  if (!summary) return null;

  return (
    <div className="flex flex-col gap-10">
      {summary.kyc && !summary.kyc.approved && (
        <div className="flex flex-col items-start gap-3 rounded-2xl bg-amber-50 p-5 text-sm text-amber-900 ring-1 ring-amber-200 sm:flex-row sm:items-center sm:justify-between">
          <p>
            {summary.kyc.rejected
              ? `KYC rejected${summary.kyc.remarks ? `: ${summary.kyc.remarks}` : ""}. Please resubmit.`
              : "Complete (or check the status of) your KYC verification to start publishing listings."}
          </p>
          <Link
            href="/dashboard/seller/kyc"
            className="shrink-0 rounded-full bg-panel px-4 py-2 text-xs font-medium text-white"
          >
            {summary.kyc.rejected ? "Resubmit KYC" : "View KYC"} →
          </Link>
        </div>
      )}

      <StatsGrid stats={summary.stats} />
      <div>
        <h2 className="mb-3 text-sm font-medium text-ink">Jump to</h2>
        <SectionLinks items={SELLER_NAV} />
      </div>
      <RecentActivity summary={summary} />
    </div>
  );
}
