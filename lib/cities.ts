import type { Property } from "@/types/api";

// Canonical cities the backend accepts on `?city=` (server normalizes aliases
// like "Bengaluru" -> "Bangalore"). Mirrors the seller-side dropdown; keep in
// sync with the admin app. Sellers may still pick "Other" (a custom name), so
// real listings can carry a city outside this list.
export const CANONICAL_CITIES = [
  "Bangalore",
  "Mumbai",
  "Delhi",
  "Pune",
  "Hyderabad",
  "Chennai",
  "Kolkata",
  "Ahmedabad",
  "Noida",
  "Gurgaon",
  "Jaipur",
  "Chandigarh",
  "Kochi",
  "Coimbatore",
  "Lucknow",
  "Indore",
  "Nagpur",
  "Surat",
  "Thane",
  "Navi Mumbai",
] as const;

// Curated art-direction photo per city — decorative, independent of which
// listings currently exist there. Falls back to a generic shot for any city
// that turns up in real data but isn't one of ours yet.
const CITY_IMAGES: Record<string, string> = {
  mumbai: "/img/villa.jpg",
  bengaluru: "/img/hero-house.jpg",
  bangalore: "/img/hero-house.jpg",
  gurugram: "/img/house2.jpg",
  gurgaon: "/img/house2.jpg",
  pune: "/img/footer-house.jpg",
  hyderabad: "/img/listing-woods.jpg",
};

const DEFAULT_CITY_IMAGE = "/img/building-hero.jpg";

function cityImageFor(city: string): string {
  return CITY_IMAGES[city.trim().toLowerCase()] ?? DEFAULT_CITY_IMAGE;
}

// city field is usually null on real listings — fall back to the text after
// the last comma in `location` (e.g. "Koramangala, Bangalore" -> "Bangalore").
function cityFor(property: Property): string | null {
  if (property.city) return property.city;
  const parts = property.location.split(",");
  if (parts.length < 2) return null;
  const city = parts[parts.length - 1].trim();
  return city || null;
}

export type CityGroup = {
  city: string;
  count: number;
  minPrice: number;
  img: string;
};

export function groupByCity(properties: Property[]): CityGroup[] {
  const map = new Map<string, CityGroup>();
  for (const property of properties) {
    const city = cityFor(property);
    if (!city) continue;
    const existing = map.get(city);
    if (existing) {
      existing.count += 1;
      existing.minPrice = Math.min(existing.minPrice, property.askingPrice);
    } else {
      map.set(city, {
        city,
        count: 1,
        minPrice: property.askingPrice,
        img: cityImageFor(city),
      });
    }
  }
  return Array.from(map.values()).sort((a, b) => b.count - a.count);
}
