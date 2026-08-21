import { api } from "@/lib/api/client";
import { buildFilterQueryString } from "@/lib/filters";
import type { GetPropertiesParams, Paginated, Property } from "@/types/api";

type FetchOpts = { cache?: RequestCache; revalidate?: number; signal?: AbortSignal };

export async function getProperties(
  params: GetPropertiesParams = {},
  opts: FetchOpts = {}
): Promise<Paginated<Property>> {
  // The platform deals only in residential property — every list fetch is
  // pinned to RESIDENTIAL so plot/commercial inventory (should the backend
  // ever hold any) never surfaces on the storefront, search, or AI results.
  const qs = buildFilterQueryString({ ...params, type: "RESIDENTIAL" });
  return api<Paginated<Property>>(`/properties${qs ? `?${qs}` : ""}`, opts);
}

export async function getProperty(id: string, opts: FetchOpts = {}): Promise<Property> {
  return api<Property>(`/properties/${id}`, opts);
}
