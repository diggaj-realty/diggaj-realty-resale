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
    throw new ApiError(json?.error?.message ?? `Request failed (${res.status})`, res.status, json?.error?.code);
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
    throw new ApiError(json?.error?.message ?? `Request failed (${res.status})`, res.status, json?.error?.code);
  }
  return json.data as T;
}

/** Multipart file upload — POST /api/v1/uploads (bucket: property-media |
 *  kyc-documents | deal-documents). Returns the stored file's public URL. */
export async function authedUpload(
  token: string,
  file: File,
  bucket: "property-media" | "kyc-documents" | "deal-documents",
  folder?: string
): Promise<{ url: string }> {
  const form = new FormData();
  form.append("file", file);
  form.append("bucket", bucket);
  if (folder) form.append("folder", folder);

  const res = await fetch(`${BASE}/uploads`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  const json = await res.json();
  if (!res.ok) {
    throw new ApiError(json?.error?.message ?? `Upload failed (${res.status})`, res.status, json?.error?.code);
  }
  return json.data as { url: string };
}
