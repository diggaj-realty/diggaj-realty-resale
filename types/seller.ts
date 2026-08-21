import type {
  Facing,
  Furnishing,
  OwnershipType,
  PossessionStatus,
  PropertyType,
} from "./api";

export type KycStatus = "PENDING" | "APPROVED" | "REJECTED";

export type IdType = "AADHAAR" | "PAN" | "PASSPORT" | "VOTER_ID" | "DRIVING_LICENSE";

export const ID_TYPE_LABEL: Record<IdType, string> = {
  AADHAAR: "Aadhaar Card",
  PAN: "PAN Card",
  PASSPORT: "Passport",
  VOTER_ID: "Voter ID",
  DRIVING_LICENSE: "Driving Licence",
};

export type SellerKyc = {
  id: string;
  userId: string;
  idType: string;
  idDocUrl: string | null;
  selfieUrl: string | null;
  status: KycStatus;
  remarks: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Amenity = {
  id: string;
  name: string;
  category: string | null;
  active: boolean;
};

/** Matches exactly what POST /api/v1/listings accepts — nothing more.
 *  Notably: no `id`/status (server-assigned) and no `unitsAvailable` (the
 *  create endpoint doesn't read that field at all, despite it existing on
 *  the Property model — omitted here rather than silently dropped). */
export type CreatePropertyInput = {
  title: string;
  description?: string;
  location: string;
  type: PropertyType;
  areaSqft: number;
  bhk?: number | null;
  askingPrice: number;
  photoUrls?: string[];

  city?: string;
  locality?: string;
  latitude?: number;
  longitude?: number;

  carpetAreaSqft?: number;
  builtUpAreaSqft?: number;
  superBuiltUpAreaSqft?: number;

  bathrooms?: number;
  balconies?: number;
  furnishing?: Furnishing;
  facing?: Facing;
  floorNumber?: number;
  totalFloors?: number;
  ageYears?: number;
  parkingCovered?: number;
  parkingOpen?: number;

  possessionStatus?: PossessionStatus;
  possessionDate?: string;
  ownershipType?: OwnershipType;
  reraId?: string;
  priceNegotiable?: boolean;
  maintenanceMonthly?: number;

  floorPlanUrl?: string;
  videoUrl?: string;
  amenities?: string[];

  builderName?: string;
  projectName?: string;
};
