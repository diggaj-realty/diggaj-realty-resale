"use client";

/** Shared hover tooltip.
 *
 *  Every chart here ships one — an on-screen chart is interactive by default, and
 *  a bar's length alone never gives an exact value. Text uses ink tokens, never
 *  the series colour; the colour swatch beside it carries the identity.
 */
export default function ChartTooltip({
  active,
  payload,
  label,
  unitSuffix = "",
  valueFormatter,
}: {
  active?: boolean;
  payload?: { value?: number | string; payload?: Record<string, unknown> }[];
  label?: string | number;
  unitSuffix?: string;
  valueFormatter?: (v: number) => string;
}) {
  if (!active || !payload?.length) return null;
  const raw = payload[0]?.value;
  const num = typeof raw === "number" ? raw : Number(raw);
  const shown =
    valueFormatter && Number.isFinite(num) ? valueFormatter(num) : `${raw}${unitSuffix}`;

  return (
    <div className="rounded-xl bg-panel px-3 py-2 shadow-2xl ring-1 ring-white/10">
      <p className="text-[11px] text-white/60">{label}</p>
      <p className="mt-0.5 text-sm font-semibold tabular-nums text-white">{shown}</p>
    </div>
  );
}
