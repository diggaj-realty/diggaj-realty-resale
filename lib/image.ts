/**
 * Supabase Storage serves the full-size original at `/object/public/...`.
 * Its image-transformation endpoint (`/render/image/public/...`) returns a
 * resized, re-compressed variant straight from the CDN edge — a ~3KB thumbnail
 * instead of the ~170KB original.
 *
 * We use this for tiny UI thumbnails (e.g. the hero search-as-you-type
 * dropdown) where routing every rapidly-swapping image through Next's
 * on-demand optimizer is the bottleneck: in dev the optimizer processes
 * images one at a time and stalls under a burst of keystroke-driven requests,
 * so thumbnails render slowly or not at all. Pointing straight at the already
 * small, edge-cached Supabase variant (with `unoptimized` on <Image>) skips
 * that hop entirely and behaves identically in dev and prod.
 *
 * Non-Supabase or unexpected URLs are returned untouched, so the caller can
 * safely fall back to normal Next optimization for those.
 */
export function supabaseThumb(url: string, size = 128): string {
  if (!url.includes("/storage/v1/object/public/")) return url;
  const transformed = url.replace(
    "/storage/v1/object/public/",
    "/storage/v1/render/image/public/"
  );
  const sep = transformed.includes("?") ? "&" : "?";
  return `${transformed}${sep}width=${size}&height=${size}&resize=cover&quality=70`;
}

/** True when supabaseThumb produced a real transform URL (i.e. the source was a
 *  Supabase public object) — lets a caller decide whether to pass `unoptimized`. */
export function isSupabasePublic(url: string): boolean {
  return url.includes("/storage/v1/object/public/");
}
