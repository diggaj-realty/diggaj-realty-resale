const BASE = process.env.NEXT_PUBLIC_API_BASE_URL!;

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export async function api<T>(
  path: string,
  opts: {
    method?: string;
    body?: unknown;
    cache?: RequestCache;
    /** ISR window (seconds) for the Next.js Data Cache. Ignored if `cache` is set. */
    revalidate?: number;
    tags?: string[];
    /** Lets a caller (e.g. a filter UI refetching on every keystroke) cancel
     *  this specific request — without it, a superseded request keeps running
     *  to completion in the background even though its result is discarded. */
    signal?: AbortSignal;
  } = {}
): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: opts.method ?? "GET",
    headers: opts.body ? { "Content-Type": "application/json" } : undefined,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
    signal: opts.signal,
    ...(opts.cache
      ? { cache: opts.cache }
      : opts.revalidate != null
      ? { next: { revalidate: opts.revalidate, tags: opts.tags } }
      : {}),
  });
  const json = await res.json();
  if (!res.ok) {
    throw new ApiError(json?.error?.message ?? `Request failed (${res.status})`, res.status);
  }
  return json.data as T;
}
