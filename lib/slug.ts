import type { Property } from "@/types/api";

const SLUG_ID_SEPARATOR = "--";

export function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Pretty URL that still round-trips to the real API id: title-slug--id
export function propertyHref(property: Pick<Property, "id" | "title">): string {
  return `/listings/${slugify(property.title)}${SLUG_ID_SEPARATOR}${property.id}`;
}

export function parsePropertyId(slugParam: string): string | null {
  const parts = slugParam.split(SLUG_ID_SEPARATOR);
  const id = parts[parts.length - 1];
  return id || null;
}
