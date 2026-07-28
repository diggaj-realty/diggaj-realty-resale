"use client";

import Link from "next/link";
import { useDashboardSummaryState } from "@/components/dashboard/DashboardSummaryContext";
import StatsGrid from "@/components/dashboard/StatsGrid";
import SectionLinks from "@/components/dashboard/SectionLinks";
import RecentActivity from "@/components/dashboard/RecentActivity";
import SummaryUnavailable from "@/components/dashboard/SummaryUnavailable";
import { SellerCharts } from "@/components/dashboard/charts/OverviewCharts";
import { SELLER_NAV } from "@/lib/dashboard/nav";

export default function SellerOverviewPage() {
  const { summary, error, reload } = useDashboardSummaryState();
  const kyc = summary?.kyc;

  return (
    <div className="flex flex-col gap-8">
      {error && <SummaryUnavailable error={error} onRetry={reload} />}

      {kyc && !kyc.approved && (
        <div className="flex flex-col items-start gap-3 rounded-[24px] bg-amber-50 p-5 text-sm text-amber-900 ring-1 ring-amber-200 sm:flex-row sm:items-center sm:justify-between">
          <p>
            {kyc.rejected
              ? `KYC rejected${kyc.remarks ? `: ${kyc.remarks}` : ""}. Please resubmit.`
              : "Complete (or check the status of) your KYC verification to start publishing listings."}
          </p>
          <Link
            href="/dashboard/seller/kyc"
            className="shrink-0 rounded-full bg-panel px-4 py-2 text-xs font-medium text-white"
          >
            {kyc.rejected ? "Resubmit KYC" : "View KYC"} →
          </Link>
        </div>
      )}

      {summary && <StatsGrid stats={summary.stats} />}

      {/* Charts fetch their own data, so they survive a summary-endpoint outage. */}
      <SellerCharts />

      {summary && <RecentActivity summary={summary} />}

      <div>
        <h2 className="mb-3 text-subhead font-medium text-ink">Jump to</h2>
        <SectionLinks items={SELLER_NAV} />
      </div>
    </div>
  );
}
