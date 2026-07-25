import type { GetPropertiesParams } from "@/types/api";

/** Builds the exact query string GET /properties accepts from a filter object —
 *  shared by the actual fetch (lib/api/properties.ts), the browse page's own
 *  address bar (so filters are shareable/bookmarkable), and a saved search's
 *  "Apply search" deep link, so all three never drift out of sync. */
export function buildFilterQueryString(params: GetPropertiesParams): string {
  const search = new URLSearchParams();
  if (params.q) search.set("q", params.q);
  if (params.type) search.set("type", params.type);
  if (params.minPrice != null) search.set("minPrice", String(params.minPrice));
  if (params.maxPrice != null) search.set("maxPrice", String(params.maxPrice));
  if (params.minBhk != null) search.set("minBhk", String(params.minBhk));
  if (params.city) search.set("city", params.city);
  if (params.locality) search.set("locality", params.locality);
  if (params.pincode) search.set("pincode", params.pincode);
  if (params.minBathrooms != null) search.set("minBathrooms", String(params.minBathrooms));
  if (params.minArea != null) search.set("minArea", String(params.minArea));
  if (params.maxArea != null) search.set("maxArea", String(params.maxArea));
  if (params.furnishing) search.set("furnishing", params.furnishing);
  if (params.facing) search.set("facing", params.facing);
  if (params.possessionStatus) search.set("possessionStatus", params.possessionStatus);
  if (params.maxAgeYears != null) search.set("maxAgeYears", String(params.maxAgeYears));
  if (params.parking) search.set("parking", "true");
  if (params.ownershipType) search.set("ownershipType", params.ownershipType);
  if (params.amenities?.length) search.set("amenities", params.amenities.join(","));
  if (params.eliteOnly) search.set("eliteOnly", "true");
  if (params.sort) search.set("sort", params.sort);
  if (params.page) search.set("page", String(params.page));
  if (params.pageSize) search.set("pageSize", String(params.pageSize));
  return search.toString();
}

/** Reverse of the above — parses a URLSearchParams (from the browse page's own
 *  address bar) back into a filter object, for hydrating browser state on load. */
export function parseFilterSearchParams(sp: URLSearchParams): GetPropertiesParams {
  const num = (v: string | null) => (v != null && v !== "" ? Number(v) : undefined);
  const bool = (v: string | null) => v === "true";
  return {
    q: sp.get("q") ?? undefined,
    type: (sp.get("type") as GetPropertiesParams["type"]) ?? undefined,
    minPrice: num(sp.get("minPrice")),
    maxPrice: num(sp.get("maxPrice")),
    minBhk: num(sp.get("minBhk")),
    city: sp.get("city") ?? undefined,
    locality: sp.get("locality") ?? undefined,
    pincode: sp.get("pincode") ?? undefined,
    minBathrooms: num(sp.get("minBathrooms")),
    minArea: num(sp.get("minArea")),
    maxArea: num(sp.get("maxArea")),
    furnishing: (sp.get("furnishing") as GetPropertiesParams["furnishing"]) ?? undefined,
    facing: (sp.get("facing") as GetPropertiesParams["facing"]) ?? undefined,
    possessionStatus: (sp.get("possessionStatus") as GetPropertiesParams["possessionStatus"]) ?? undefined,
    maxAgeYears: num(sp.get("maxAgeYears")),
    parking: bool(sp.get("parking")) || undefined,
    ownershipType: (sp.get("ownershipType") as GetPropertiesParams["ownershipType"]) ?? undefined,
    amenities: sp.get("amenities")?.split(",").filter(Boolean),
    eliteOnly: bool(sp.get("eliteOnly")) || undefined,
    sort: (sp.get("sort") as GetPropertiesParams["sort"]) ?? undefined,
  };
}
