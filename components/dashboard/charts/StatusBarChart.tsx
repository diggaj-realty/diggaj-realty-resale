"use client";

import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import ChartCard from "@/components/dashboard/charts/ChartCard";
import { AXIS_TICK, CHART } from "@/components/dashboard/charts/chartTokens";
import ChartTooltip from "@/components/dashboard/charts/ChartTooltip";

export type StatusDatum = { label: string; value: number };

/** Horizontal magnitude bars for a status breakdown (offers, interests).
 *
 *  Single hue on purpose. The reader's job is "compare how many are in each
 *  state", which is a sequential job — the state NAMES are on the axis, so
 *  colour never has to carry identity. A per-status categorical palette was
 *  tried first and failed CVD separation against its neutral slot; it would also
 *  have meant no legend could be omitted.
 *
 *  Horizontal because status names are long words, which would collide or need
 *  rotating on a vertical x-axis.
 */
export default function StatusBarChart({
  title,
  subtitle,
  data,
  caveat,
  /** Index of the row to emphasise (e.g. the one needing action). Others recede,
   *  per the design-system "emphasis" form. */
  emphasisLabel,
}: {
  title: string;
  subtitle?: string;
  data: StatusDatum[];
  caveat?: string | null;
  emphasisLabel?: string;
}) {
  const rows = data.filter((d) => d.value > 0);

  if (rows.length === 0) {
    return (
      <ChartCard title={title} subtitle={subtitle} caveat={caveat}>
        <p className="py-8 text-center text-xs text-body">Nothing to chart yet.</p>
      </ChartCard>
    );
  }

  return (
    <ChartCard
      title={title}
      subtitle={subtitle}
      caveat={caveat}
      table={rows.map((r) => ({ label: r.label, value: String(r.value) }))}
    >
      <ResponsiveContainer width="100%" height={Math.max(140, rows.length * 38)}>
        <BarChart data={rows} layout="vertical" margin={{ top: 4, right: 28, bottom: 4, left: 0 }}>
          {/* recessive grid; only the value axis needs gridlines */}
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
            width={132}
            tick={AXIS_TICK}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            cursor={{ fill: "rgba(28,26,22,0.04)" }}
            content={<ChartTooltip unitSuffix="" />}
          />
          {/* 4px rounded data-end, anchored flat at the baseline */}
          <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={14} isAnimationActive={false}>
            {rows.map((r) => (
              <Cell
                key={r.label}
                fill={
                  emphasisLabel && r.label !== emphasisLabel ? CHART.muted : CHART.mark
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
