import { unstable_cache } from "next/cache";

/**
 * Real nearby-place data from Google. Server-only — the key
 * (GOOGLE_PLACES_API_KEY, no NEXT_PUBLIC_ prefix) never reaches the browser.
 *
 * Pipeline: Places API (New) finds the nearest metro/hospital/school/IT-park/
 * airport around the listing's coordinates, then the Distance Matrix API turns
 * those into real DRIVING distance + time from the property. Falls back to
 * straight-line distance only if Distance Matrix is unavailable.
 *
 * Cached a week per rounded coordinate (pages are SSG/ISR, so this runs at
 * build/revalidation, not per visit) to keep API cost low.
 */

const KEY = process.env.GOOGLE_PLACES_API_KEY;

export type NearbyPlace = { name: string; km: number; mins?: number };
export type NearbyPlaces = {
  metro: NearbyPlace[];
  hospitals: NearbyPlace[];
  schools: NearbyPlace[];
  itParks: NearbyPlace[];
  airport: NearbyPlace | null;
};

type Candidate = { name: string; lat: number; lng: number };
type PlaceApiResult = {
  places?: { displayName?: { text?: string }; location?: { latitude: number; longitude: number } }[];
};

function haversineKm(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}
const round = (km: number) => (km < 10 ? Math.round(km * 10) / 10 : Math.round(km));

function toCandidates(json: PlaceApiResult): Candidate[] {
  return (json.places ?? [])
    .filter((p) => p.location)
    .map((p) => ({
      name: p.displayName?.text ?? "Unnamed",
      lat: p.location!.latitude,
      lng: p.location!.longitude,
    }));
}

async function searchNearby(
  lat: number,
  lng: number,
  includedTypes: string[],
  radius: number,
  max: number
): Promise<Candidate[]> {
  try {
    const res = await fetch("https://places.googleapis.com/v1/places:searchNearby", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": KEY as string,
        "X-Goog-FieldMask": "places.displayName,places.location",
      },
      body: JSON.stringify({
        includedTypes,
        maxResultCount: max,
        rankPreference: "DISTANCE",
        locationRestriction: { circle: { center: { latitude: lat, longitude: lng }, radius } },
      }),
    });
    if (!res.ok) return [];
    return toCandidates((await res.json()) as PlaceApiResult);
  } catch {
    return [];
  }
}

async function searchText(
  lat: number,
  lng: number,
  textQuery: string,
  radius: number,
  max: number
): Promise<Candidate[]> {
  try {
    const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": KEY as string,
        "X-Goog-FieldMask": "places.displayName,places.location",
      },
      body: JSON.stringify({
        textQuery,
        maxResultCount: max,
        locationBias: { circle: { center: { latitude: lat, longitude: lng }, radius } },
      }),
    });
    if (!res.ok) return [];
    return toCandidates((await res.json()) as PlaceApiResult);
  } catch {
    return [];
  }
}

type DistResult = { km: number; mins?: number };

/** One batched Distance Matrix call (driving) for all candidates at once. */
async function roadDistances(
  oLat: number,
  oLng: number,
  dests: Candidate[]
): Promise<DistResult[]> {
  const fallback = dests.map((d) => ({ km: round(haversineKm(oLat, oLng, d.lat, d.lng)) }));
  if (dests.length === 0) return [];
  try {
    const destStr = dests.map((d) => `${d.lat},${d.lng}`).join("|");
    const url =
      `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${oLat},${oLng}` +
      `&destinations=${encodeURIComponent(destStr)}&mode=driving&key=${KEY}`;
    const res = await fetch(url);
    if (!res.ok) return fallback;
    const json = (await res.json()) as {
      rows?: { elements?: { status: string; distance?: { value: number }; duration?: { value: number } }[] }[];
    };
    const els = json.rows?.[0]?.elements ?? [];
    return dests.map((d, i) => {
      const e = els[i];
      if (e?.status === "OK" && e.distance) {
        return {
          km: round(e.distance.value / 1000),
          mins: e.duration ? Math.round(e.duration.value / 60) : undefined,
        };
      }
      return { km: round(haversineKm(oLat, oLng, d.lat, d.lng)) };
    });
  } catch {
    return fallback;
  }
}

/** Airports are frequently mis-tagged in Places (travel agencies, cab stands,
 *  helipads). Resolve by name via text search, keeping only genuine airports. */
async function findAirport(lat: number, lng: number): Promise<Candidate[]> {
  const looksLikeAirport = (n: string) =>
    /\bairport\b|\bairfield\b/i.test(n) && !/travel|agenc|tours?|taxi|cab|forex|lounge|parking|hotel/i.test(n);

  const primary = (await searchText(lat, lng, "international airport", 50000, 5)).filter((c) =>
    looksLikeAirport(c.name)
  );
  if (primary.length > 0) return primary.slice(0, 1);

  const fallback = (await searchNearby(lat, lng, ["airport"], 50000, 5)).filter((c) =>
    looksLikeAirport(c.name)
  );
  return fallback.slice(0, 1);
}

async function fetchNearby(lat: number, lng: number): Promise<NearbyPlaces> {
  const [metroC, hospC, schoolC, itC, airportC] = await Promise.all([
    searchNearby(lat, lng, ["subway_station", "light_rail_station", "train_station"], 6000, 3),
    searchNearby(lat, lng, ["hospital"], 5000, 3),
    searchNearby(lat, lng, ["school"], 5000, 3),
    searchText(lat, lng, "IT park tech park", 9000, 3),
    findAirport(lat, lng),
  ]);

  const groups = [metroC, hospC, schoolC, itC, airportC];
  const flat = groups.flat();
  const dist = await roadDistances(lat, lng, flat);

  let idx = 0;
  const assign = (arr: Candidate[]): NearbyPlace[] =>
    arr
      .map((c) => {
        const d = dist[idx++];
        return { name: c.name, km: d.km, mins: d.mins };
      })
      .sort((a, b) => a.km - b.km);

  const metro = assign(metroC);
  const hospitals = assign(hospC);
  const schools = assign(schoolC);
  const itParks = assign(itC);
  const airport = assign(airportC)[0] ?? null;

  return { metro, hospitals, schools, itParks, airport };
}

/** Cached, coordinate-keyed lookup. Returns null when no key or no results. */
export async function getNearbyPlaces(lat: number, lng: number): Promise<NearbyPlaces | null> {
  if (!KEY) return null;
  const key = `${lat.toFixed(3)},${lng.toFixed(3)}`;
  const cached = unstable_cache(() => fetchNearby(lat, lng), ["nearby-places-v3", key], {
    revalidate: 60 * 60 * 24 * 7,
  });
  const result = await cached();
  const empty =
    result.metro.length === 0 &&
    result.hospitals.length === 0 &&
    result.schools.length === 0 &&
    result.itParks.length === 0 &&
    result.airport == null;
  return empty ? null : result;
}
