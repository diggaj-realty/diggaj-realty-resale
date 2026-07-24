/**
 * Curated, public-knowledge locality connectivity for the areas our listings
 * sit in. Distances are approximate and indicative — surfaced with a disclaimer
 * in the UI. Matched by scanning a property's location/locality string for a
 * keyword, falling back to a city-level profile, then null.
 */

type PlaceItem = { name: string; km: number };
export type LocalityIntel = {
  area: string;
  metro: PlaceItem[];
  itParks: PlaceItem[];
  hospitals: PlaceItem[];
  schools: PlaceItem[];
  airportKm: number;
};

// Ordered by specificity — first keyword found in the location string wins.
const LOCALITIES: { keywords: string[]; data: LocalityIntel }[] = [
  {
    keywords: ["panathur", "kadubeesanahalli", "bellandur", "marathahalli", "sobha neopolis"],
    data: {
      area: "Outer Ring Road (East Bengaluru)",
      metro: [
        { name: "Kadubeesanahalli (Blue Line, upcoming)", km: 1.5 },
        { name: "Bellandur (Blue Line, upcoming)", km: 2.5 },
      ],
      itParks: [
        { name: "Embassy TechVillage", km: 2 },
        { name: "RMZ Ecoworld", km: 2.5 },
        { name: "Cessna Business Park", km: 3 },
        { name: "Prestige Tech Park", km: 1.5 },
      ],
      hospitals: [
        { name: "Sakra World Hospital", km: 4 },
        { name: "Cloudnine, Bellandur", km: 2 },
      ],
      schools: [
        { name: "GEAR Innovative Intl School", km: 3 },
        { name: "VIBGYOR High, Bellandur", km: 2.5 },
      ],
      airportKm: 42,
    },
  },
  {
    keywords: ["whitefield", "varthur", "hoodi", "kundalahalli"],
    data: {
      area: "Whitefield",
      metro: [
        { name: "Whitefield (Kadugodi) — Purple Line", km: 3 },
        { name: "Hoodi — Purple Line", km: 2 },
      ],
      itParks: [
        { name: "ITPL / International Tech Park", km: 3 },
        { name: "EPIP Zone", km: 3.5 },
      ],
      hospitals: [
        { name: "Manipal Hospital, Whitefield", km: 3 },
        { name: "Vydehi Institute", km: 4 },
      ],
      schools: [
        { name: "Deens Academy", km: 2.5 },
        { name: "Vydehi School of Excellence", km: 4 },
      ],
      airportKm: 40,
    },
  },
  {
    keywords: ["sarjapur", "haralur", "kaikondrahalli", "carmelaram"],
    data: {
      area: "Sarjapur Road",
      metro: [{ name: "Ibblur (Blue Line, upcoming)", km: 4 }],
      itParks: [
        { name: "RGA Tech Park", km: 3 },
        { name: "Wipro Corporate Office", km: 5 },
      ],
      hospitals: [{ name: "Columbia Asia, Sarjapur", km: 4 }],
      schools: [
        { name: "Greenwood High", km: 3 },
        { name: "Inventure Academy", km: 6 },
      ],
      airportKm: 50,
    },
  },
  {
    keywords: ["electronic city", "electronics city", "hosur road"],
    data: {
      area: "Electronic City",
      metro: [{ name: "Electronic City (Yellow Line)", km: 1.5 }],
      itParks: [
        { name: "Infosys Campus", km: 2 },
        { name: "Wipro EC", km: 2.5 },
        { name: "Biocon Park", km: 3 },
      ],
      hospitals: [{ name: "Narayana Health City", km: 6 }],
      schools: [{ name: "VIBGYOR High, EC", km: 2 }],
      airportKm: 55,
    },
  },
];

const CITY_FALLBACK: Record<string, LocalityIntel> = {
  bangalore: {
    area: "Bengaluru",
    metro: [{ name: "Nearest Namma Metro station", km: 4 }],
    itParks: [{ name: "Major IT corridor", km: 6 }],
    hospitals: [{ name: "Multi-specialty hospital", km: 5 }],
    schools: [{ name: "Reputed school", km: 3 }],
    airportKm: 40,
  },
};

export function getLocalityIntel(
  location?: string | null,
  locality?: string | null,
  city?: string | null
): LocalityIntel | null {
  const hay = `${location ?? ""} ${locality ?? ""} ${city ?? ""}`.toLowerCase();
  for (const entry of LOCALITIES) {
    if (entry.keywords.some((k) => hay.includes(k))) return entry.data;
  }
  const cityKey = (city ?? "").toLowerCase().trim();
  if (CITY_FALLBACK[cityKey]) return CITY_FALLBACK[cityKey];
  if (hay.includes("bangalore") || hay.includes("bengaluru")) return CITY_FALLBACK.bangalore;
  return null;
}
