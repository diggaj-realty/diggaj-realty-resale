// Mirrors the value arrays in diggaj-realty-resale-admin's
// src/lib/data/propertyFields.ts — keep in sync with the backend.
import type { Facing, Furnishing, OwnershipType, PossessionStatus } from "@/types/api";

export const FURNISHING: Furnishing[] = ["UNFURNISHED", "SEMI_FURNISHED", "FULLY_FURNISHED"];
export const FACING: Facing[] = ["N", "S", "E", "W", "NE", "NW", "SE", "SW"];
export const POSSESSION_STATUS: PossessionStatus[] = ["READY_TO_MOVE", "UNDER_CONSTRUCTION"];
export const OWNERSHIP_TYPE: OwnershipType[] = [
  "FREEHOLD",
  "LEASEHOLD",
  "POWER_OF_ATTORNEY",
  "CO_OPERATIVE",
];
