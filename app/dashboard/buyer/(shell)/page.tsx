"use client";

import { useDashboardSummaryState } from "@/components/dashboard/DashboardSummaryContext";
import StatsGrid from "@/components/dashboard/StatsGrid";
import SectionLinks from "@/components/dashboard/SectionLinks";
import RecentActivity from "@/components/dashboard/RecentActivity";
import SummaryUnavailable from "@/components/dashboard/SummaryUnavailable";
import { BuyerCharts } from "@/components/dashboard/charts/OverviewCharts";
import { BUYER_NAV } from "@/lib/dashboard/nav";

export default function BuyerOverviewPage() {
  const { summary, error, reload } = useDashboardSummaryState();

  return (
    <div className="flex flex-col gap-8">
      {/* The summary is no longer a hard gate for the whole shell, so this page
          has to handle its absence itself rather than rendering nothing. */}
      {error && <SummaryUnavailable error={error} onRetry={reload} />}

      {summary && <StatsGrid stats={summary.stats} />}

      {/* Charts read their own endpoints, so they still work when the summary
          endpoint is the thing that's down. */}
      <BuyerCharts />

      {summary && <RecentActivity summary={summary} />}

      <div>
        <h2 className="mb-3 text-subhead font-medium text-ink">Jump to</h2>
        <SectionLinks items={BUYER_NAV} />
      </div>
    </div>
  );
}
