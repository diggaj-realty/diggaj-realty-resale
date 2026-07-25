"use client";

import DashboardShell from "@/components/dashboard/DashboardShell";

export default function SellerDashboardLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell role="SELLER">{children}</DashboardShell>;
}
