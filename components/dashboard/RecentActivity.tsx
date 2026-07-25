import StatusBadge from "@/components/dashboard/StatusBadge";
import type { DashboardSummary } from "@/types/dashboard";

export default function RecentActivity({ summary }: { summary: DashboardSummary }) {
  return (
    <div>
      <h2 className="text-sm font-medium text-ink">{summary.itemsTitle}</h2>
      <div className="mt-3 flex flex-col gap-2">
        {summary.items.length === 0 && (
          <p className="rounded-2xl bg-white p-6 text-sm text-body ring-1 ring-ink/5">{summary.emptyMessage}</p>
        )}
        {summary.items.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between gap-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-ink/5"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-ink">{item.title}</p>
              <p className="truncate text-xs text-body">{item.subtitle}</p>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-sm font-semibold text-ink">{item.amountLabel}</p>
              <div className="mt-1">
                <StatusBadge status={item.status} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
