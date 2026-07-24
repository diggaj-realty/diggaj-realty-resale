import { getLocalityIntel } from "@/lib/locality";
import { getNearbyPlaces, type NearbyPlace } from "@/lib/api/places";
import type { Property } from "@/types/api";

function Row({ title, icon, items }: { title: string; icon: string; items: NearbyPlace[] }) {
  if (items.length === 0) return null;
  return (
    <div className="rounded-2xl bg-cream p-4">
      <p className="flex items-center gap-2 text-sm font-medium text-ink">
        <span aria-hidden>{icon}</span> {title}
      </p>
      <ul className="mt-2 space-y-1.5">
        {items.map((it, i) => (
          <li key={`${it.name}-${i}`} className="flex items-baseline justify-between gap-3 text-xs">
            <span className="text-body [overflow-wrap:anywhere]">{it.name}</span>
            <span className="shrink-0 whitespace-nowrap font-medium text-ink">
              {it.km} km{it.mins != null ? ` · ${it.mins} min` : ""}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

type Resolved = {
  area: string;
  metro: NearbyPlace[];
  itParks: NearbyPlace[];
  hospitals: NearbyPlace[];
  schools: NearbyPlace[];
  airport: NearbyPlace | null;
  live: boolean;
};

async function resolve(property: Property): Promise<Resolved | null> {
  // 1) Real driving distances from Google when the listing has coordinates.
  if (property.latitude != null && property.longitude != null) {
    const g = await getNearbyPlaces(property.latitude, property.longitude);
    if (g) {
      return {
        area: property.locality ?? property.city ?? "This location",
        metro: g.metro,
        itParks: g.itParks,
        hospitals: g.hospitals,
        schools: g.schools,
        airport: g.airport,
        live: true,
      };
    }
  }
  // 2) Fallback to the curated locality profile (straight-line, no drive time).
  const c = getLocalityIntel(property.location, property.locality, property.city);
  if (!c) return null;
  return {
    area: c.area,
    metro: c.metro,
    itParks: c.itParks,
    hospitals: c.hospitals,
    schools: c.schools,
    airport: { name: "Kempegowda International Airport", km: c.airportKm },
    live: false,
  };
}

export default async function LocalityIntel({ property }: { property: Property }) {
  const data = await resolve(property);
  if (!data) return null;

  return (
    <>
      <div className="mt-12 flex flex-wrap items-center gap-3">
        <h2 className="text-2xl font-medium tracking-[-0.02em] text-ink">Locality &amp; connectivity</h2>
        {data.live && (
          <span className="rounded-full bg-limepale px-2.5 py-1 text-[11px] font-medium text-ink">
            ● Live · Google Maps
          </span>
        )}
      </div>
      <p className="mt-1 text-sm text-body">
        {data.area} · {data.live ? "driving distance & time from this address" : "approximate distances"}
      </p>
      <div className="mt-5 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        <Row title="Metro & transit" icon="🚇" items={data.metro} />
        <Row title="IT parks & offices" icon="🏢" items={data.itParks} />
        <Row title="Hospitals" icon="🏥" items={data.hospitals} />
        <Row title="Schools" icon="🎓" items={data.schools} />
        {data.airport && (
          <div className="rounded-2xl bg-panel p-4 text-white sm:col-span-2">
            <p className="flex items-center gap-2 text-sm font-medium">
              <span aria-hidden>✈️</span> {data.airport.name}
            </p>
            <p className="mt-1 text-xs text-white/60">
              {data.airport.km} km away
              {data.airport.mins != null ? ` · about ${data.airport.mins} min by road` : ""}
            </p>
          </div>
        )}
      </div>
      <p className="mt-3 text-[11px] leading-relaxed text-ink/40">
        {data.live
          ? "Live driving distances via Google Maps — actual time varies with traffic."
          : "Indicative distances based on the locality — confirm exact travel times during your site visit."}
      </p>
    </>
  );
}
