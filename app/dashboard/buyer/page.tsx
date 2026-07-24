"use client";

import DashboardShell from "@/components/dashboard/DashboardShell";
import BuyerTabs from "@/components/dashboard/buyer/BuyerTabs";

export default function BuyerDashboardPage() {
  return (
    <DashboardShell role="BUYER">
      {() => <BuyerTabs />}
    </DashboardShell>
  );
}
