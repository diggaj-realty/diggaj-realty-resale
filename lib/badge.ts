import type { Property } from "@/types/api";

const NEW_WINDOW_MS = 14 * 24 * 60 * 60 * 1000;

export function badgeFor(property: Property): "New" | "For Sale" {
  const age = Date.now() - new Date(property.createdAt).getTime();
  return age <= NEW_WINDOW_MS ? "New" : "For Sale";
}

// Elite is the premium seller plan — badge it distinctly from New/For Sale.
export function isElite(property: Property): boolean {
  return property.plan === "ELITE";
}
