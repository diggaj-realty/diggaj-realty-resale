import PropertyMap from "@/components/listings/PropertyMap";

/* Authored diagrams for the Myhna Vistara page. Same approach as Sobha One
 * World Hoskote's visuals.tsx: 6 towers of roughly the same G+31 height, so
 * one representative tower with a ×6 badge rather than a varied massing
 * comparison. Drawn from the developer's stated floor count, not an
 * architectural elevation. */

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
 * G+31 floors → 250px, so ~7.8px per floor. */

const FLOORS = 31;
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
      viewBox="0 0 420 340"
      minWidth="min-w-[380px]"
      caption="One representative tower, drawn to the stated G+31 floor count — six towers (A through F) make up the project. Not an architectural elevation."
    >
      <line x1="44" y1={floorY(FLOORS)} x2="44" y2={BASE_Y} stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
      {[0, 10, 20, 31].map((n) => (
        <g key={n}>
          <line x1="40" y1={floorY(n)} x2="48" y2={floorY(n)} stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
          <text x="34" y={floorY(n) + 4} textAnchor="end" fontSize="11" fill="rgba(255,255,255,0.4)">
            {n === 0 ? "G" : n}
          </text>
        </g>
      ))}

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
        G+{FLOORS} floors
      </text>

      {/* ×6 badge */}
      <g>
        <circle cx={towerX + towerW + 45} cy={towerY + 40} r="22" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.25)" />
        <text x={towerX + towerW + 45} y={towerY + 36} textAnchor="middle" fontSize="13" fontWeight="700" fill="#ffffff">
          ×6
        </text>
        <text x={towerX + towerW + 45} y={towerY + 50} textAnchor="middle" fontSize="8" fill="rgba(255,255,255,0.5)">
          towers
        </text>
      </g>
    </Figure>
  );
}

/* ── Locality map ─────────────────────────────────────────────────────────
 * Same pattern as the other two microsites: Google Maps JS API via the
 * shared PropertyMap component when GOOGLE_PLACES_API_KEY is configured,
 * falling back to OpenStreetMap otherwise. Centred on Gunjur, not a precise
 * site pin — the exact parcel boundary isn't published on the source site. */

const LOCALITY_CENTER = { lat: 12.9151, lng: 77.757 };
const OSM_BBOX = "77.732,12.895,77.782,12.935";

export function LocalityMap({ apiKey }: { apiKey?: string }) {
  return (
    <figure>
      <div className="h-[46vh] min-h-[340px] overflow-hidden rounded-2xl ring-1 ring-white/10 md:h-[32vh] md:min-h-[240px]">
        {apiKey ? (
          <PropertyMap
            lat={LOCALITY_CENTER.lat}
            lng={LOCALITY_CENTER.lng}
            title="Gunjur (approximate locality, not the site pin)"
            apiKey={apiKey}
            className="h-full w-full bg-white/5"
          />
        ) : (
          <iframe
            title="Gunjur locality map"
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
