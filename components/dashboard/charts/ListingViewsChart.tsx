"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import ChartCard from "@/components/dashboard/charts/ChartCard";
import { AXIS_TICK, CHART } from "@/components/dashboard/charts/chartTokens";
import ChartTooltip from "@/components/dashboard/charts/ChartTooltip";
import type { Property } from "@/types/api";

const TOP_N = 6;

/** Views per listing — a cross-sectional magnitude comparison.
 *
 *  Deliberately NOT a line/area over time. `Property.viewCount` is a single
 *  cumulative integer; the API exposes no view events and no daily snapshots, so
 *  any "views this week" trend line would be invented data. This chart only ever
 *  compares listings against each other at one moment.
 */
export default function ListingViewsChart({
  listings,
  total,
}: {
  listings: Property[];
  /** `Paginated.total` — used to disclose truncation when it exceeds what we got. */
  total?: number;
}) {
  const ranked = [...listings]
    .filter((p) => (p.viewCount ?? 0) > 0)
    .sort((a, b) => (b.viewCount ?? 0) - (a.viewCount ?? 0));

  const rows = ranked.slice(0, TOP_N).map((p) => ({
    label: p.title.length > 22 ? `${p.title.slice(0, 21)}…` : p.title,
    fullLabel: p.title,
    value: p.viewCount ?? 0,
  }));

  const truncated = typeof total === "number" && total > listings.length;
  const caveat = [
    ranked.length > TOP_N ? `Top ${TOP_N} of ${ranked.length} listings with views.` : null,
    truncated ? `Based on the ${listings.length} most recent of ${total} listings.` : null,
  ]
    .filter(Boolean)
    .join(" ");

  if (rows.length === 0) {
    return (
      <ChartCard title="Views per listing" subtitle="Which of your listings buyers are opening">
        <p className="py-8 text-center text-xs text-body">
          No views recorded yet. Once your listings go live, view counts appear here.
        </p>
      </ChartCard>
    );
  }

  return (
    <ChartCard
      title="Views per listing"
      subtitle="Which of your listings buyers are opening"
      caveat={caveat || null}
      table={rows.map((r) => ({ label: r.fullLabel, value: r.value.toLocaleString("en-IN") }))}
    >
      <ResponsiveContainer width="100%" height={Math.max(150, rows.length * 40)}>
        <BarChart data={rows} layout="vertical" margin={{ top: 4, right: 28, bottom: 4, left: 0 }}>
          <CartesianGrid horizontal={false} stroke={CHART.grid} />
          {/* domain ends at the data max: the default padded to a round number, so a
              chart whose largest value was 1 drew ticks out to 4 and left the bars
              occupying a quarter of the plot. */}
          <XAxis
            type="number"
            allowDecimals={false}
            domain={[0, "dataMax"]}
            tick={AXIS_TICK}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="label"
            width={150}
            tick={AXIS_TICK}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip cursor={{ fill: "rgba(28,26,22,0.04)" }} content={<ChartTooltip unitSuffix=" views" />} />
          <Bar dataKey="value" fill={CHART.mark} radius={[0, 4, 4, 0]} barSize={14} isAnimationActive={false} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
