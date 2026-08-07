import PropertyMap from "@/components/listings/PropertyMap";

/* Authored diagrams for the Brigade Granada page.
 *
 * There is no official imagery for a pre-launch project, and the stock photos
 * in public/img are Nordic cottages — using one as a "render" would misrepresent
 * the project. So the visual layer here is drawn from the published numbers
 * instead: it can only show what the data actually says.
 *
 * Two conventions throughout:
 *  - Wide diagrams scroll inside their own `overflow-x-auto` with a `min-w`
 *    floor (DESIGN.md's rule for wide content) rather than shrinking. That keeps
 *    SVG text at a legible size on a phone instead of scaling it to 5px.
 *  - Labels that would be too long for the drawing become numbered keys, with
 *    the names in an HTML legend underneath — responsive text, not SVG text. */

/** Shared frame: horizontal scroll on small screens, never a shrunken diagram.
 *  The diagram is wider than a phone, so the caption carries an explicit swipe
 *  hint below sm — an overflow container gives no visual cue that there is more
 *  to the right, and a silently half-shown diagram just looks broken. */
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

/** 1–n key badge tying a mass in the elevation to its row in the legend. */
function Key({ n, x, y }: { n: number; x: number; y: number }) {
  return (
    <>
      <circle cx={x} cy={y} r="12" fill="#cdea6f" />
      <text
        x={x}
        y={y + 4}
        textAnchor="middle"
        fontSize="12"
        fontWeight="600"
        fill="#1c1a16"
      >
        {n}
      </text>
    </>
  );
}

/** Legend for the elevation. Styled for the dark panel it sits on — the only
 *  place it is used since the site-plan diagram was dropped. */
function Legend({ items }: { items: { n: number; label: string; detail: string }[] }) {
  return (
    <ol className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((i) => (
        <li key={i.n} className="flex gap-3">
          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-lime text-[10px] font-bold text-ink">
            {i.n}
          </span>
          <span>
            <span className="block text-sm font-medium text-white">{i.label}</span>
            <span className="block text-xs text-white/45">{i.detail}</span>
          </span>
        </li>
      ))}
    </ol>
  );
}

/* ── Massing elevation ─────────────────────────────────────────────────────
 * Heights are drawn to a single scale derived from the stated floor counts:
 * 53 floors → 250px, so 4.717px per floor, and the 35-floor commercial tower
 * comes out proportionally at 165px. The hotel is drawn as a podium with NO
 * implied floor count, because the source states 400 keys and never states a
 * height — inventing one would be the easiest thing on this page to get wrong. */

const FLOOR_PX = 250 / 53;
const BASE_Y = 330;
const floorY = (n: number) => BASE_Y - n * FLOOR_PX;

// Ordered tallest-first, left to right. A rising skyline reads better on a wide
// screen, but this diagram is 620px wide inside a ~272px scroller on a phone —
// ascending order meant the first thing a mobile visitor saw was the retail
// podium, with the 53-floor tower (the whole point) off-screen until they
// happened to swipe. Descending puts the headline mass in the initial view.
const MASSES = [
  { n: 1, x: 70, w: 100, h: 250, fill: "#cdea6f", stroke: "none", floors: 53 },
  { n: 2, x: 200, w: 90, h: 165, fill: "rgba(255,255,255,0.22)", stroke: "rgba(255,255,255,0.4)", floors: 35 },
  { n: 3, x: 320, w: 150, h: 95, fill: "rgba(255,255,255,0.14)", stroke: "rgba(255,255,255,0.3)", floors: null },
  { n: 4, x: 500, w: 110, h: 40, fill: "rgba(255,255,255,0.09)", stroke: "rgba(255,255,255,0.25)", floors: null },
];

export function MassingElevation() {
  return (
    <div>
      <Figure
        viewBox="0 0 660 396"
        minWidth="min-w-[620px]"
        caption="Indicative massing, drawn to one scale from the stated floor counts. Not an architectural elevation. The hotel is shown as a podium because its height has not been published."
      >
        <defs>
          <pattern id="bg-hatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="8" stroke="rgba(255,255,255,0.14)" strokeWidth="1" />
          </pattern>
        </defs>

        {/* Floor scale */}
        <line x1="44" y1={floorY(53)} x2="44" y2={BASE_Y} stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
        {[0, 10, 20, 30, 40, 50].map((n) => (
          <g key={n}>
            <line
              x1="40"
              y1={floorY(n)}
              x2="48"
              y2={floorY(n)}
              stroke="rgba(255,255,255,0.25)"
              strokeWidth="1"
            />
            <text x="34" y={floorY(n) + 4} textAnchor="end" fontSize="11" fill="rgba(255,255,255,0.4)">
              {n === 0 ? "G" : n}
            </text>
          </g>
        ))}

        {/* Basements — one band across the whole parcel, since they run under it */}
        <rect x="56" y={BASE_Y} width="574" height="25" fill="url(#bg-hatch)" />
        <rect x="56" y={BASE_Y} width="574" height="25" fill="none" stroke="rgba(255,255,255,0.15)" />
        <text x="343" y={BASE_Y + 17} textAnchor="middle" fontSize="10" fill="rgba(255,255,255,0.45)">
          4 basement levels
        </text>

        {/* Grade */}
        <line x1="56" y1={BASE_Y} x2="630" y2={BASE_Y} stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" />

        {MASSES.map((m) => {
          const y = BASE_Y - m.h;
          return (
            <g key={m.n}>
              <rect x={m.x} y={y} width={m.w} height={m.h} fill={m.fill} stroke={m.stroke} rx="2" />
              {/* Floor banding every 5 levels, so height reads as storeys */}
              {m.floors
                ? Array.from({ length: Math.floor(m.floors / 5) }, (_, i) => (i + 1) * 5).map((f) => (
                    <line
                      key={f}
                      x1={m.x}
                      y1={floorY(f)}
                      x2={m.x + m.w}
                      y2={floorY(f)}
                      stroke={m.n === 1 ? "rgba(28,26,22,0.22)" : "rgba(255,255,255,0.16)"}
                      strokeWidth="1"
                    />
                  ))
                : null}
              <text
                x={m.x + m.w / 2}
                y={y - 12}
                textAnchor="middle"
                fontSize={m.floors ? "15" : "11"}
                fontWeight={m.floors ? "600" : "500"}
                fill={m.n === 1 ? "#cdea6f" : m.floors ? "rgba(255,255,255,0.75)" : "rgba(255,255,255,0.4)"}
              >
                {m.floors ? `${m.floors} floors` : "Height not stated"}
              </text>
              <Key n={m.n} x={m.x + m.w / 2} y={372} />
            </g>
          );
        })}
      </Figure>

      <Legend
        items={[
          { n: 1, label: "Residential towers", detail: "4B + G + 53 floors · ~2,000 units" },
          { n: 2, label: "Commercial tower", detail: "35 floors of office space" },
          { n: 3, label: "Luxury hotel", detail: "400 keys · height not published" },
          { n: 4, label: "Retail high street", detail: "Shopfronts along the frontage" },
        ]}
      />
    </div>
  );
}

/* ── Locality map ──────────────────────────────────────────────────────────
 * Google Maps JS API via the shared PropertyMap component (same one the
 * listings pages use) when GOOGLE_PLACES_API_KEY is configured server-side —
 * it's passed in as a prop rather than read here since this file has no
 * server/client boundary of its own. Falls back to OpenStreetMap's key-free
 * embed if the key is absent, so the page never breaks on a missing key.
 * Centred on the Whitefield/Kadugodi locality, not a precise site pin — the
 * exact parcel boundary isn't published, and inventing one would misstate it. */

// Centre of the same locality bbox the OSM fallback used to frame.
const LOCALITY_CENTER = { lat: 12.995, lng: 77.77 };
const OSM_BBOX = "77.745,12.975,77.795,13.015";

export function LocalityMap({ apiKey }: { apiKey?: string }) {
  return (
    <figure>
      {/* Taller on phones: OpenStreetMap's attribution bar is fixed-size text
          that wraps to three lines in a narrow frame, and at 240px it covered
          roughly a third of the map. A near-square frame also suits a locality
          view better on a narrow screen. */}
      <div className="h-[46vh] min-h-[340px] overflow-hidden rounded-2xl ring-1 ring-white/10 md:h-[32vh] md:min-h-[240px]">
        {apiKey ? (
          <PropertyMap
            lat={LOCALITY_CENTER.lat}
            lng={LOCALITY_CENTER.lng}
            title="Whitefield / Kadugodi (approximate locality, not the site pin)"
            apiKey={apiKey}
            className="h-full w-full bg-white/5"
          />
        ) : (
          <iframe
            title="Whitefield and Kadugodi locality map"
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
        exact site boundary comes with the launch material, not a precise pin here.
      </figcaption>
    </figure>
  );
}
