import { api } from "@/lib/api/client";
import { buildFilterQueryString } from "@/lib/filters";
import type { GetPropertiesParams, Paginated, Property } from "@/types/api";

type FetchOpts = { cache?: RequestCache; revalidate?: number; signal?: AbortSignal };

export async function getProperties(
  params: GetPropertiesParams = {},
  opts: FetchOpts = {}
): Promise<Paginated<Property>> {
  const qs = buildFilterQueryString(params);
  return api<Paginated<Property>>(`/properties${qs ? `?${qs}` : ""}`, opts);
}

export async function getProperty(id: string, opts: FetchOpts = {}): Promise<Property> {
  return api<Property>(`/properties/${id}`, opts);
}
