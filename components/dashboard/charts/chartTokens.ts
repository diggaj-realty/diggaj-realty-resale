/** Chart colour slots.
 *
 * Recharts needs concrete values for SVG fills, so these can't be Tailwind
 * classes — they're the one place raw hex is legitimate.
 *
 * Derived from the brand lime (same yellow-green hue family, h≈120) but stepped
 * DARKER so marks actually clear the surface: `--color-lime` #cdea6f is a 1.6:1
 * tint on white, unusable as a data mark. Validated with the data-viz palette
 * checker as an ordinal ramp — monotone lightness, ≥0.06 ΔL between steps,
 * single hue, light end above the 2:1 floor:
 *
 *   light on #ffffff → PASS (light end #8fae35 at 2.54:1; solid #6b8524 at 4.20:1)
 *   dark  on #171717 → PASS (light end #8fae35 at 7.06:1)
 *
 * Deliberately ONE hue: every dashboard chart here answers "compare magnitude",
 * which is a sequential job. Categorical hues would be wrong — the category
 * names live on the axis, so colour carries magnitude only, and a multi-hue
 * palette failed CVD separation against the neutral slot.
 */
export const CHART = {
  /** Single-series mark. Highest contrast step. */
  mark: "#6b8524",
  /** Ordinal ramp, light → dark. Use for ordered magnitude only. */
  ramp: ["#8fae35", "#6b8524", "#4a5c19"] as const,
  /** De-emphasis for the "context" marks in an emphasis chart. */
  muted: "#d8d6cf",
  /** Recessive grid + axis, per the design system's ink at low alpha. */
  grid: "rgba(28, 26, 22, 0.08)",
  axis: "rgba(28, 26, 22, 0.45)",
  surface: "#ffffff",
} as const;

/** Shared Recharts axis/tooltip styling so every chart reads as one system. */
export const AXIS_TICK = { fontSize: 11, fill: CHART.axis } as const;
