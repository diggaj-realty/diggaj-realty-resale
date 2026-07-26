export type PropertyType = "RESIDENTIAL" | "PLOT" | "COMMERCIAL";
export type PropertyStatus =
  | "DRAFT"
  | "PENDING_VERIFICATION"
  | "LIVE"
  | "UNDER_CONTRACT"
  | "REJECTED"
  | "CLOSED";
export type PropertyPlan = "BASIC" | "ELITE";
export type Furnishing = "UNFURNISHED" | "SEMI_FURNISHED" | "FULLY_FURNISHED";
export type Facing = "N" | "S" | "E" | "W" | "NE" | "NW" | "SE" | "SW";
export type PossessionStatus = "READY_TO_MOVE" | "UNDER_CONSTRUCTION";
export type OwnershipType =
  | "FREEHOLD"
  | "LEASEHOLD"
  | "POWER_OF_ATTORNEY"
  | "CO_OPERATIVE";

export type PropertyPhoto = {
  id: string;
  url: string;
  order: number;
};

export type Property = {
  id: string;
  sellerId: string;
  agentId: string | null;
  type: PropertyType;
  title: string;
  description: string;
  location: string;
  latitude: number | null;
  longitude: number | null;
  areaSqft: number;
  bhk: number | null;
  askingPrice: number;
  unitsAvailable?: number | null;
  status: PropertyStatus;
  plan: PropertyPlan;
  /** Pending seller-requested upgrade (e.g. "ELITE"), awaiting staff approval. Null when nothing's pending. */
  requestedPlan: PropertyPlan | null;
  viewCount: number;

  city?: string;
  locality?: string;
  pincode?: string;
  carpetAreaSqft?: number | null;
  builtUpAreaSqft?: number | null;
  superBuiltUpAreaSqft?: number | null;

  bathrooms?: number | null;
  balconies?: number | null;
  furnishing?: Furnishing | null;
  facing?: Facing | null;
  floorNumber?: number | null;
  totalFloors?: number | null;
  ageYears?: number | null;
  parkingCovered?: number | null;
  parkingOpen?: number | null;

  possessionStatus?: PossessionStatus | null;
  possessionDate?: string | null;
  ownershipType?: OwnershipType | null;
  reraId?: string | null;
  priceNegotiable?: boolean | null;
  maintenanceMonthly?: number | null;

  floorPlanUrl?: string | null;
  videoUrl?: string | null;
  amenities?: string[];

  builderName?: string | null;
  projectName?: string | null;

  verifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
  sellerName?: string;
  agentName?: string;
  photos: PropertyPhoto[];
};

export type Paginated<T> = {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type SortOrder =
  | "newest"
  | "price_asc"
  | "price_desc"
  | "area_asc"
  | "area_desc"
  | "most_viewed";

export type GetPropertiesParams = {
  q?: string;
  type?: PropertyType;
  minPrice?: number;
  maxPrice?: number;
  minBhk?: number;
  city?: string;
  locality?: string;
  pincode?: string;
  minBathrooms?: number;
  minArea?: number;
  maxArea?: number;
  furnishing?: Furnishing;
  facing?: Facing;
  possessionStatus?: PossessionStatus;
  maxAgeYears?: number;
  parking?: boolean;
  ownershipType?: OwnershipType;
  amenities?: string[];
  eliteOnly?: boolean;
  sort?: SortOrder;
  page?: number;
  pageSize?: number;
};
