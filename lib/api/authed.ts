import { ApiError } from "@/lib/api/client";

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL!;

/** Authenticated GET against the resale-admin API, for use in client components
 *  that hold a bearer token from AuthContext. */
export async function authedGet<T>(path: string, token: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await res.json();
  if (!res.ok) {
    throw new ApiError(json?.error?.message ?? `Request failed (${res.status})`, res.status);
  }
  return json.data as T;
}

/** Authenticated write (POST/PATCH/DELETE) against the resale-admin API. */
export async function authedSend<T>(
  path: string,
  token: string,
  opts: { method: "POST" | "PATCH" | "DELETE"; body?: unknown } = { method: "POST" }
): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: opts.method,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(opts.body ? { "Content-Type": "application/json" } : {}),
    },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  const json = await res.json();
  if (!res.ok) {
    throw new ApiError(json?.error?.message ?? `Request failed (${res.status})`, res.status);
  }
  return json.data as T;
}
