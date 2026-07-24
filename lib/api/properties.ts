import { api } from "@/lib/api/client";
import type { GetPropertiesParams, Paginated, Property } from "@/types/api";

type FetchOpts = { cache?: RequestCache; revalidate?: number };

export async function getProperties(
  params: GetPropertiesParams = {},
  opts: FetchOpts = {}
): Promise<Paginated<Property>> {
  const search = new URLSearchParams();
  if (params.q) search.set("q", params.q);
  if (params.type) search.set("type", params.type);
  if (params.minPrice != null) search.set("minPrice", String(params.minPrice));
  if (params.maxPrice != null) search.set("maxPrice", String(params.maxPrice));
  if (params.minBhk != null) search.set("minBhk", String(params.minBhk));
  if (params.city) search.set("city", params.city);
  if (params.page) search.set("page", String(params.page));
  if (params.pageSize) search.set("pageSize", String(params.pageSize));

  const qs = search.toString();
  return api<Paginated<Property>>(`/properties${qs ? `?${qs}` : ""}`, opts);
}

export async function getProperty(id: string, opts: FetchOpts = {}): Promise<Property> {
  return api<Property>(`/properties/${id}`, opts);
}
