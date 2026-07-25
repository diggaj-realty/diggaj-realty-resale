"use client";

import { createContext, useContext } from "react";
import type { DashboardSummary } from "@/types/dashboard";

type Ctx = { summary: DashboardSummary | null };

const DashboardSummaryContext = createContext<Ctx>({ summary: null });

export function DashboardSummaryProvider({
  summary,
  children,
}: {
  summary: DashboardSummary | null;
  children: React.ReactNode;
}) {
  return <DashboardSummaryContext.Provider value={{ summary }}>{children}</DashboardSummaryContext.Provider>;
}

/** Reads the already-fetched dashboard summary (stats, kyc, etc.) — only the
 *  Overview page renders it, but any section page can read it if needed. */
export function useDashboardSummary(): DashboardSummary | null {
  return useContext(DashboardSummaryContext).summary;
}
