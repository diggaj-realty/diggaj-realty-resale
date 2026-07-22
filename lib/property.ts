import { price } from "@/lib/listings";
import type {
  Facing,
  Furnishing,
  OwnershipType,
  PossessionStatus,
  Property,
  PropertyType,
} from "@/types/api";

export const sqft = (n: number) => `${n.toLocaleString("en-IN")} sq ft`;

const TYPE_LABEL: Record<PropertyType, string> = {
  RESIDENTIAL: "Residential",
  PLOT: "Plot",
  COMMERCIAL: "Commercial",
};

const FURNISHING_LABEL: Record<Furnishing, string> = {
  UNFURNISHED: "Unfurnished",
  SEMI_FURNISHED: "Semi-furnished",
  FULLY_FURNISHED: "Fully furnished",
};

const FACING_LABEL: Record<Facing, string> = {
  N: "North",
  S: "South",
  E: "East",
  W: "West",
  NE: "North-East",
  NW: "North-West",
  SE: "South-East",
  SW: "South-West",
};

const POSSESSION_LABEL: Record<PossessionStatus, string> = {
  READY_TO_MOVE: "Ready to move",
  UNDER_CONSTRUCTION: "Under construction",
};

const OWNERSHIP_LABEL: Record<OwnershipType, string> = {
  FREEHOLD: "Freehold",
  LEASEHOLD: "Leasehold",
  POWER_OF_ATTORNEY: "Power of attorney",
  CO_OPERATIVE: "Co-operative",
};

export const propertyTypeLabel = (t: PropertyType) => TYPE_LABEL[t];

const age = (yrs: number) =>
  yrs <= 0 ? "New construction" : `${yrs} ${yrs === 1 ? "year" : "years"} old`;

const parking = (covered?: number | null, open?: number | null) => {
  const parts: string[] = [];
  if (covered) parts.push(`${covered} covered`);
  if (open) parts.push(`${open} open`);
  return parts.length ? parts.join(" · ") : null;
};

export type Spec = { label: string; value: string };

/** All non-empty structured attributes, ready to render as a specs grid. */
export function buildSpecs(p: Property): Spec[] {
  const floor =
    p.floorNumber != null
      ? p.totalFloors != null
        ? `${p.floorNumber} of ${p.totalFloors}`
        : `${p.floorNumber}`
      : null;

  const rows: Array<[string, string | null | undefined]> = [
    ["Property type", TYPE_LABEL[p.type]],
    [
      "Units available",
      p.unitsAvailable != null
        ? `${p.unitsAvailable} ${p.unitsAvailable === 1 ? "unit" : "units"}`
        : null,
    ],
    ["Configuration", p.bhk != null ? `${p.bhk} BHK` : null],
    ["Bathrooms", p.bathrooms != null ? String(p.bathrooms) : null],
    ["Balconies", p.balconies != null ? String(p.balconies) : null],
    ["Carpet area", p.carpetAreaSqft != null ? sqft(p.carpetAreaSqft) : null],
    ["Built-up area", p.builtUpAreaSqft != null ? sqft(p.builtUpAreaSqft) : null],
    [
      "Super built-up",
      p.superBuiltUpAreaSqft != null ? sqft(p.superBuiltUpAreaSqft) : null,
    ],
    ["Furnishing", p.furnishing ? FURNISHING_LABEL[p.furnishing] : null],
    ["Facing", p.facing ? FACING_LABEL[p.facing] : null],
    ["Floor", floor],
    ["Age", p.ageYears != null ? age(p.ageYears) : null],
    ["Parking", parking(p.parkingCovered, p.parkingOpen)],
    ["Possession", p.possessionStatus ? POSSESSION_LABEL[p.possessionStatus] : null],
    ["Ownership", p.ownershipType ? OWNERSHIP_LABEL[p.ownershipType] : null],
    [
      "Maintenance",
      p.maintenanceMonthly != null ? `${price(p.maintenanceMonthly)}/mo` : null,
    ],
    [
      "Price",
      p.priceNegotiable == null
        ? null
        : p.priceNegotiable
        ? "Negotiable"
        : "Fixed",
    ],
    ["Project", p.projectName ?? null],
    ["Builder", p.builderName ?? null],
    ["RERA ID", p.reraId ?? null],
  ];

  return rows
    .filter(([, v]) => v != null && v !== "")
    .map(([label, value]) => ({ label, value: value as string }));
}
