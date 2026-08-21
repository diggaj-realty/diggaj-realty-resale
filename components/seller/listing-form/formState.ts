import type { Facing, Furnishing, OwnershipType, PossessionStatus, PropertyType } from "@/types/api";
import type { CreatePropertyInput } from "@/types/seller";

export type ListingFormState = {
  // basics
  type: PropertyType;
  title: string;
  description: string;
  location: string;
  areaSqft: string;
  bhk: string;
  askingPrice: string;
  // location detail
  city: string;
  locality: string;
  latitude: number | null;
  longitude: number | null;
  // area breakdown
  carpetAreaSqft: string;
  builtUpAreaSqft: string;
  superBuiltUpAreaSqft: string;
  // configuration
  bathrooms: string;
  balconies: string;
  furnishing: Furnishing | "";
  facing: Facing | "";
  floorNumber: string;
  totalFloors: string;
  ageYears: string;
  parkingCovered: string;
  parkingOpen: string;
  // legal
  possessionStatus: PossessionStatus | "";
  possessionDate: string;
  ownershipType: OwnershipType | "";
  reraId: string;
  priceNegotiable: boolean;
  maintenanceMonthly: string;
  // project
  builderName: string;
  projectName: string;
  // media
  photoUrls: string[];
  videoUrl: string | undefined;
  floorPlanUrl: string | undefined;
  // amenities
  amenities: string[];
};

export const INITIAL_FORM_STATE: ListingFormState = {
  type: "RESIDENTIAL",
  title: "",
  description: "",
  location: "",
  areaSqft: "",
  bhk: "",
  askingPrice: "",
  city: "",
  locality: "",
  latitude: null,
  longitude: null,
  carpetAreaSqft: "",
  builtUpAreaSqft: "",
  superBuiltUpAreaSqft: "",
  bathrooms: "",
  balconies: "",
  furnishing: "",
  facing: "",
  floorNumber: "",
  totalFloors: "",
  ageYears: "",
  parkingCovered: "",
  parkingOpen: "",
  possessionStatus: "",
  possessionDate: "",
  ownershipType: "",
  reraId: "",
  priceNegotiable: false,
  maintenanceMonthly: "",
  builderName: "",
  projectName: "",
  photoUrls: [],
  videoUrl: undefined,
  floorPlanUrl: undefined,
  amenities: [],
};

const numOrUndef = (s: string): number | undefined => {
  const n = Number(s);
  return s.trim() !== "" && Number.isFinite(n) ? n : undefined;
};

/** Converts the form's UI-friendly state into exactly the shape
 *  POST /api/v1/listings accepts — dropping empty optional fields. */
export function toCreatePayload(f: ListingFormState): CreatePropertyInput {
  return {
    title: f.title.trim(),
    description: f.description.trim() || undefined,
    location: f.location.trim(),
    type: f.type,
    areaSqft: Number(f.areaSqft),
    bhk: numOrUndef(f.bhk) ?? null,
    askingPrice: Number(f.askingPrice),
    photoUrls: f.photoUrls,

    city: f.city || undefined,
    locality: f.locality.trim() || undefined,
    latitude: f.latitude ?? undefined,
    longitude: f.longitude ?? undefined,

    carpetAreaSqft: numOrUndef(f.carpetAreaSqft),
    builtUpAreaSqft: numOrUndef(f.builtUpAreaSqft),
    superBuiltUpAreaSqft: numOrUndef(f.superBuiltUpAreaSqft),

    bathrooms: numOrUndef(f.bathrooms),
    balconies: numOrUndef(f.balconies),
    furnishing: f.furnishing || undefined,
    facing: f.facing || undefined,
    floorNumber: numOrUndef(f.floorNumber),
    totalFloors: numOrUndef(f.totalFloors),
    ageYears: numOrUndef(f.ageYears),
    parkingCovered: numOrUndef(f.parkingCovered),
    parkingOpen: numOrUndef(f.parkingOpen),

    possessionStatus: f.possessionStatus || undefined,
    possessionDate: f.possessionDate || undefined,
    ownershipType: f.ownershipType || undefined,
    reraId: f.reraId.trim() || undefined,
    priceNegotiable: f.priceNegotiable,
    maintenanceMonthly: numOrUndef(f.maintenanceMonthly),

    floorPlanUrl: f.floorPlanUrl,
    videoUrl: f.videoUrl,
    amenities: f.amenities,

    builderName: f.builderName.trim() || undefined,
    projectName: f.projectName.trim() || undefined,
  };
}

export function validateStep(step: number, f: ListingFormState): string | null {
  if (step === 0) {
    if (!f.title.trim()) return "Title is required";
    if (!f.location.trim()) return "Location is required";
    if (!f.areaSqft || Number(f.areaSqft) <= 0) return "Area (sq ft) is required";
    if (!f.askingPrice || Number(f.askingPrice) <= 0) return "Asking price is required";
    if (!f.bhk) return "Configuration (BHK) is required";
  }
  return null;
}
