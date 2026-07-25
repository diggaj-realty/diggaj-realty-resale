"use client";

import { useDashboardSummary } from "@/components/dashboard/DashboardSummaryContext";
import StatsGrid from "@/components/dashboard/StatsGrid";
import SectionLinks from "@/components/dashboard/SectionLinks";
import RecentActivity from "@/components/dashboard/RecentActivity";
import { BUYER_NAV } from "@/lib/dashboard/nav";

export default function BuyerOverviewPage() {
  const summary = useDashboardSummary();
  if (!summary) return null;

  return (
    <div className="flex flex-col gap-10">
      <StatsGrid stats={summary.stats} />
      <div>
        <h2 className="mb-3 text-sm font-medium text-ink">Jump to</h2>
        <SectionLinks items={BUYER_NAV} />
      </div>
      <RecentActivity summary={summary} />
    </div>
  );
}
