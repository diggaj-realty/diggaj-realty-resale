"use client";

import { createContext, useContext } from "react";
import type { DashboardSummary } from "@/types/dashboard";

type Ctx = {
  summary: DashboardSummary | null;
  /** Non-null when the /dashboard summary fetch failed. Carried down so the
   *  Overview page can degrade on its own instead of the shell blanking every
   *  route — see DashboardShell. */
  error: string | null;
  reload: () => void;
};

const DashboardSummaryContext = createContext<Ctx>({
  summary: null,
  error: null,
  reload: () => {},
});

export function DashboardSummaryProvider({
  summary,
  error = null,
  reload = () => {},
  children,
}: {
  summary: DashboardSummary | null;
  error?: string | null;
  reload?: () => void;
  children: React.ReactNode;
}) {
  return (
    <DashboardSummaryContext.Provider value={{ summary, error, reload }}>
      {children}
    </DashboardSummaryContext.Provider>
  );
}

/** Reads the already-fetched dashboard summary (stats, kyc, etc.) — only the
 *  Overview page renders it, but any section page can read it if needed. */
export function useDashboardSummary(): DashboardSummary | null {
  return useContext(DashboardSummaryContext).summary;
}

/** Summary fetch state, for the Overview page's degraded/retry UI. */
export function useDashboardSummaryState(): Ctx {
  return useContext(DashboardSummaryContext);
}
