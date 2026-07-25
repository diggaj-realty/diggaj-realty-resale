"use client";

import DashboardShell from "@/components/dashboard/DashboardShell";

export default function BuyerDashboardLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell role="BUYER">{children}</DashboardShell>;
}
