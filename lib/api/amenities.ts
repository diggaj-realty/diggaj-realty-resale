import { api } from "@/lib/api/client";
import type { Amenity } from "@/types/seller";

// Public endpoint (no auth) — shared by the seller listing form and the
// buyer browse filters, so the checklist always reflects the admin-managed list.
export const getAmenities = () => api<Amenity[]>("/amenities", { revalidate: 3600 });

// Mirrors the backend's own fallback (propertyFields.ts DEFAULT_AMENITIES) —
// used only if the admin-managed amenity master table is empty.
export const FALLBACK_AMENITIES = [
  "Lift",
  "Power Backup",
  "Car Parking",
  "24x7 Security",
  "CCTV",
  "Gymnasium",
  "Swimming Pool",
  "Clubhouse",
  "Children's Play Area",
  "Park / Garden",
  "Gated Community",
  "Water Supply",
  "Fire Safety",
  "Rain Water Harvesting",
];
