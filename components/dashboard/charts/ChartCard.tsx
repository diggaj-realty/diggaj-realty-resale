"use client";

import { useState } from "react";

/** Shared frame for every dashboard chart.
 *
 *  Carries three things the charts themselves shouldn't re-implement:
 *  - a title/subtitle, so a single-series chart needs no legend (the title names
 *    the series);
 *  - `caveat`, for honesty about truncated data — every list endpoint here is
 *    hardcoded to pageSize=50 with no pagination, so a chart over a bigger
 *    account is showing a subset and must say so;
 *  - a table view toggle, which is the accessibility fallback for any chart
 *    (also the relief path for marks that sit under 3:1 contrast).
 */
export default function ChartCard({
  title,
  subtitle,
  caveat,
  table,
  children,
}: {
  title: string;
  subtitle?: string;
  caveat?: string | null;
  /** Rows behind the chart, exposed as a real table for screen readers and for
   *  anyone who needs exact values rather than mark lengths. */
  table?: { label: string; value: string }[];
  children: React.ReactNode;
}) {
  const [showTable, setShowTable] = useState(false);

  return (
    <section className="rounded-[24px] bg-white p-5 shadow-sm ring-1 ring-ink/5">
      <header className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-ink">{title}</h3>
          {subtitle && <p className="mt-0.5 text-xs text-body">{subtitle}</p>}
        </div>
        {table && table.length > 0 && (
          <button
            onClick={() => setShowTable((v) => !v)}
            className="shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium text-ink/55 transition-colors hover:bg-ink/5 hover:text-ink"
            aria-expanded={showTable}
          >
            {showTable ? "Show chart" : "Show data"}
          </button>
        )}
      </header>

      <div className="mt-4">
        {showTable && table ? (
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-ink/10 text-ink/50">
                <th scope="col" className="pb-2 font-medium">Item</th>
                <th scope="col" className="pb-2 text-right font-medium">Value</th>
              </tr>
            </thead>
            <tbody>
              {table.map((r) => (
                <tr key={r.label} className="border-b border-ink/5 last:border-0">
                  <td className="py-2 pr-3 text-ink">{r.label}</td>
                  <td className="py-2 text-right font-medium tabular-nums text-ink">{r.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          children
        )}
      </div>

      {caveat && <p className="mt-3 text-[11px] leading-relaxed text-ink/45">{caveat}</p>}
    </section>
  );
}
