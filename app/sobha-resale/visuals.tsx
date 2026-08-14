import { price } from "@/lib/listings";
import { COMMUNITIES, PRICED, TOP_PRICE, SECTOR_COUNTS } from "./data";

/* Authored diagrams for the Sobha resale portfolio page.
 *
 * The other three microsites each diagram one building, because each is one
 * project. This page has no single site to draw — it spans ten communities in
 * three parts of the city — so the two things worth drawing are *where they
 * are relative to each other* and *what they cost relative to each other*.
 * Both are derived from COMMUNITIES in data.ts; neither restates a number
 * that is already in the tables.
 *
 * Same conventions as the other microsites' visuals.tsx: wide diagrams scroll
 * in their own overflow-x-auto with a min-w floor, and long labels become a
 * numbered key with an HTML legend underneath rather than SVG text that
 * cannot reflow.
 *
 * Deliberately schematic, not a map. A real map would need a pin per
 * community and we do not have surveyed coordinates for resale stock spread
 * across ten sites — a diagram that is obviously a diagram cannot be mistaken
 * for one. */

function Figure({
  caption,
  minWidth,
  viewBox,
  children,
}: {
  caption: string;
  minWidth: string;
  viewBox: string;
  children: React.ReactNode;
}) {
  return (
    <figure>
      <div className="overflow-x-auto">
        <svg viewBox={viewBox} className={`h-auto w-full ${minWidth}`} role="img">
          {children}
        </svg>
      </div>
      <figcaption className="mt-4 text-xs text-white/40">
        <span className="mb-1 block font-medium text-lime sm:hidden">
          Swipe the diagram sideways →
        </span>
        {caption}
      </figcaption>
    </figure>
  );
}

/* ── Corridor diagram ─────────────────────────────────────────────────────
 * The Outer Ring Road as a circle with the city core inside it, and the three
 * corridors placed at their real compass bearings: north up, east right,
 * south down. Counts come from SECTOR_COUNTS so the diagram cannot disagree
 * with the community list. */

const CX = 210;
const CY = 200;
const RING_R = 108;

/** Corridor markers at their compass bearings — angle in SVG degrees, where
 *  -90 is straight up. Distance is a visual choice, not a scale. */
const NODES: { key: "North" | "East" | "South"; angle: number; dist: number }[] = [
  { key: "North", angle: -90, dist: 150 },
  { key: "East", angle: 0, dist: 158 },
  { key: "South", angle: 82, dist: 150 },
];

const pointAt = (angle: number, dist: number) => ({
  x: CX + Math.cos((angle * Math.PI) / 180) * dist,
  y: CY + Math.sin((angle * Math.PI) / 180) * dist,
});

export function CorridorDiagram() {
  return (
    <Figure
      viewBox="0 0 420 400"
      minWidth="min-w-[380px]"
      caption="Schematic, not a map — the ring is the Outer Ring Road and the three arms are the corridors Sobha's Bengaluru communities sit on, at their compass bearings. Distances are drawn for legibility, not to scale."
    >
      {/* ORR */}
      <circle
        cx={CX}
        cy={CY}
        r={RING_R}
        fill="none"
        stroke="rgba(255,255,255,0.18)"
        strokeWidth="10"
      />
      <circle cx={CX} cy={CY} r={RING_R} fill="none" stroke="rgba(255,255,255,0.28)" strokeWidth="1" />
      {/* Bottom-left of the ring: the one quadrant with no arm crossing it, so
          the label can sit outside the circle without landing on a corridor. */}
      <text x="96" y={CY + RING_R + 24} textAnchor="middle" fontSize="10" fill="rgba(255,255,255,0.45)">
        Outer Ring Road
      </text>

      {/* City core */}
      <circle cx={CX} cy={CY} r="26" fill="rgba(255,255,255,0.08)" />
      <text x={CX} y={CY + 4} textAnchor="middle" fontSize="11" fill="rgba(255,255,255,0.55)">
        City
      </text>

      {/* Corridor arms */}
      {NODES.map((n) => {
        const inner = pointAt(n.angle, 34);
        const outer = pointAt(n.angle, n.dist);
        const count = SECTOR_COUNTS[n.key];
        return (
          <g key={n.key}>
            <line
              x1={inner.x}
              y1={inner.y}
              x2={outer.x}
              y2={outer.y}
              stroke={count > 0 ? "#cdea6f" : "rgba(255,255,255,0.22)"}
              strokeWidth={count > 0 ? 2.5 : 1.5}
              strokeDasharray={count > 0 ? undefined : "4 4"}
            />
            <circle
              cx={outer.x}
              cy={outer.y}
              r="21"
              fill={count > 0 ? "#cdea6f" : "rgba(255,255,255,0.12)"}
            />
            <text
              x={outer.x}
              y={outer.y + 6}
              textAnchor="middle"
              fontSize="17"
              fontWeight="600"
              fill={count > 0 ? "#1c1a16" : "rgba(255,255,255,0.5)"}
            >
              {count}
            </text>
          </g>
        );
      })}

      {/* Arm labels, placed clear of the discs. East sits *below* its disc
          rather than beside it — at this viewBox width there is not enough
          room to the right of the disc for the label, and it rendered on top
          of the count. */}
      <text x={CX} y="18" textAnchor="middle" fontSize="11" fill="rgba(255,255,255,0.6)">
        North — airport belt
      </text>
      <text x={CX + 158} y={CY + 44} textAnchor="middle" fontSize="11" fill="rgba(255,255,255,0.6)">
        East — ORR
      </text>
      <text x={CX} y="392" textAnchor="middle" fontSize="11" fill="rgba(255,255,255,0.6)">
        South — E-City / Mysore Road
      </text>
    </Figure>
  );
}

/* ── Entry-price ladder ───────────────────────────────────────────────────
 * Bar width is each community's entry price against the highest one, so the
 * spread between an ₹82 L one-bed and a ₹2.3 Cr three-bed is visible as a
 * shape rather than as ten numbers the reader has to hold in their head.
 * Communities without a published indication are excluded (PRICED), and
 * called out in the caption rather than drawn as an empty bar. */

const OMITTED = COMMUNITIES.length - PRICED.length;

export function PriceLadder() {
  return (
    <div>
      <ol className="flex flex-col gap-3">
        {PRICED.map((c) => {
          const pct = (c.from / TOP_PRICE) * 100;
          return (
            <li key={c.name} className="grid items-center gap-x-4 gap-y-1 sm:grid-cols-[minmax(0,13rem)_1fr]">
              <span className="truncate text-sm text-white/75">{c.name}</span>
              <span className="flex items-center gap-3">
                <span
                  className="h-2.5 rounded-full bg-lime"
                  style={{ width: `${Math.max(pct, 6)}%` }}
                  aria-hidden
                />
                <span className="shrink-0 text-xs font-semibold text-white/60">
                  {price(c.from)}
                </span>
              </span>
            </li>
          );
        })}
      </ol>
      <p className="mt-6 text-xs text-white/40">
        Entry price only — the cheapest configuration in each community, drawn against the highest
        of them. A larger unit, a better floor or a corner facing moves well above the bar shown.
        {OMITTED > 0 &&
          ` ${OMITTED} ${OMITTED === 1 ? "community" : "communities"} without a published resale` +
            ` indication ${OMITTED === 1 ? "is" : "are"} left out.`}
      </p>
    </div>
  );
}
