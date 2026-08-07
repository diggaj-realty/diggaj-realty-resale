import PropertyMap from "@/components/listings/PropertyMap";

/* Authored diagrams for the Sobha One World Hoskote page.
 *
 * Unlike Brigade Granada's mixed-use skyline, this project is 14 residential
 * towers of roughly the same height — so the useful diagram here isn't a
 * varied massing comparison, it's one representative tower with a call-out
 * for how many of them there are. Drawn from the developer's stated floor
 * count, not an architectural elevation.
 *
 * Same conventions as Brigade Granada's visuals.tsx: wide diagrams scroll in
 * their own overflow-x-auto with a min-w floor, and long labels become a
 * numbered key with an HTML legend underneath. */

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

/* ── Tower elevation ──────────────────────────────────────────────────────
 * 46 floors (top of the stated 45–46 range) → 250px, so 5.43px per floor.
 * Drawn as a single tower with a ×14 badge rather than 14 separate bars,
 * which would just repeat the same height fourteen times. */

const FLOORS = 46;
const FLOOR_PX = 250 / FLOORS;
const BASE_Y = 300;
const floorY = (n: number) => BASE_Y - n * FLOOR_PX;

export function TowerElevation() {
  const towerX = 90;
  const towerW = 130;
  const towerH = FLOORS * FLOOR_PX;
  const towerY = BASE_Y - towerH;

  return (
    <Figure
      viewBox="0 0 420 360"
      minWidth="min-w-[380px]"
      caption="One representative tower, drawn to the stated floor count — fourteen towers of roughly this height make up Phase 1. Not an architectural elevation."
    >
      {/* Floor scale */}
      <line x1="44" y1={floorY(FLOORS)} x2="44" y2={BASE_Y} stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
      {[0, 10, 20, 30, 40, 46].map((n) => (
        <g key={n}>
          <line x1="40" y1={floorY(n)} x2="48" y2={floorY(n)} stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
          <text x="34" y={floorY(n) + 4} textAnchor="end" fontSize="11" fill="rgba(255,255,255,0.4)">
            {n === 0 ? "G" : n}
          </text>
        </g>
      ))}

      {/* Basement — 3 levels of parking, one band under the tower footprint */}
      <rect x={towerX - 20} y={BASE_Y} width={towerW + 40} height="22" fill="url(#tower-hatch)" />
      <rect x={towerX - 20} y={BASE_Y} width={towerW + 40} height="22" fill="none" stroke="rgba(255,255,255,0.15)" />
      <defs>
        <pattern id="tower-hatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="8" stroke="rgba(255,255,255,0.14)" strokeWidth="1" />
        </pattern>
      </defs>
      <text x={towerX + towerW / 2} y={BASE_Y + 15} textAnchor="middle" fontSize="10" fill="rgba(255,255,255,0.45)">
        3 basement levels
      </text>

      {/* Grade */}
      <line x1="70" y1={BASE_Y} x2="350" y2={BASE_Y} stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" />

      {/* Tower mass */}
      <rect x={towerX} y={towerY} width={towerW} height={towerH} fill="#cdea6f" rx="2" />
      {Array.from({ length: Math.floor(FLOORS / 5) }, (_, i) => (i + 1) * 5).map((f) => (
        <line
          key={f}
          x1={towerX}
          y1={floorY(f)}
          x2={towerX + towerW}
          y2={floorY(f)}
          stroke="rgba(28,26,22,0.22)"
          strokeWidth="1"
        />
      ))}
      <text
        x={towerX + towerW / 2}
        y={towerY - 14}
        textAnchor="middle"
        fontSize="16"
        fontWeight="600"
        fill="#cdea6f"
      >
        Up to {FLOORS} floors
      </text>

      {/* ×14 badge */}
      <g>
        <circle cx={towerX + towerW + 45} cy={towerY + 40} r="22" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.25)" />
        <text x={towerX + towerW + 45} y={towerY + 36} textAnchor="middle" fontSize="13" fontWeight="700" fill="#ffffff">
          ×14
        </text>
        <text x={towerX + towerW + 45} y={towerY + 50} textAnchor="middle" fontSize="8" fill="rgba(255,255,255,0.5)">
          towers
        </text>
      </g>
    </Figure>
  );
}

/* ── Locality map ─────────────────────────────────────────────────────────
 * Same pattern as Brigade Granada's LocalityMap: Google Maps JS API via the
 * shared PropertyMap component when GOOGLE_PLACES_API_KEY is configured,
 * falling back to OpenStreetMap's key-free embed otherwise. Centred on
 * Hoskote town, not a precise site pin — the exact parcel boundary isn't
 * published on the source site. */

const LOCALITY_CENTER = { lat: 13.1145, lng: 77.7975 };
const OSM_BBOX = "77.7725,13.0945,77.8225,13.1345";

export function LocalityMap({ apiKey }: { apiKey?: string }) {
  return (
    <figure>
      <div className="h-[46vh] min-h-[340px] overflow-hidden rounded-2xl ring-1 ring-white/10 md:h-[32vh] md:min-h-[240px]">
        {apiKey ? (
          <PropertyMap
            lat={LOCALITY_CENTER.lat}
            lng={LOCALITY_CENTER.lng}
            title="Hoskote (approximate locality, not the site pin)"
            apiKey={apiKey}
            className="h-full w-full bg-white/5"
          />
        ) : (
          <iframe
            title="Hoskote locality map"
            loading="lazy"
            className="h-full w-full border-0"
            src={`https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(
              OSM_BBOX
            )}&layer=mapnik`}
          />
        )}
      </div>
      <figcaption className="mt-4 text-xs text-white/40">
        {apiKey ? "© Google" : "© OpenStreetMap contributors"} — approximate locality only. The
        exact site boundary comes with the sale agreement, not a precise pin here.
      </figcaption>
    </figure>
  );
}
