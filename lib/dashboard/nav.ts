import type { ComponentType } from "react";
import {
  OverviewIcon,
  HeartIcon,
  OfferIcon,
  CalendarIcon,
  BookmarkIcon,
  DocumentIcon,
  BuildingIcon,
  HandshakeIcon,
  SparkleIcon,
} from "@/components/dashboard/icons";

export type NavItem = {
  href: string;
  label: string;
  description: string;
  Icon: ComponentType<{ className?: string }>;
  /** For active-state matching: exact ("/dashboard/buyer") vs prefix routes. */
  exact?: boolean;
};

export const BUYER_NAV: NavItem[] = [
  { href: "/dashboard/buyer", label: "Overview", description: "Your activity at a glance", Icon: OverviewIcon, exact: true },
  { href: "/dashboard/buyer/saved", label: "Saved", description: "Properties you've shortlisted", Icon: HeartIcon },
  { href: "/dashboard/buyer/offers", label: "Offers", description: "Track & negotiate your offers", Icon: OfferIcon },
  { href: "/dashboard/buyer/site-visits", label: "Site Visits", description: "Requested & scheduled tours", Icon: CalendarIcon },
  { href: "/dashboard/buyer/saved-searches", label: "Saved Searches", description: "Get alerted on new matches", Icon: BookmarkIcon },
  { href: "/dashboard/buyer/closing", label: "Closing & Documents", description: "Track your deal to close", Icon: DocumentIcon },
];

export const SELLER_NAV: NavItem[] = [
  { href: "/dashboard/seller", label: "Overview", description: "Your activity at a glance", Icon: OverviewIcon, exact: true },
  { href: "/dashboard/seller/listings", label: "My Listings", description: "Manage your submitted listings", Icon: BuildingIcon },
  { href: "/dashboard/seller/offers", label: "Offers", description: "Respond to buyer offers", Icon: OfferIcon },
  { href: "/dashboard/seller/deals", label: "Deals", description: "Closing progress & payments", Icon: HandshakeIcon },
  { href: "/dashboard/seller/site-visits", label: "Site Visits", description: "Who's touring your property", Icon: CalendarIcon },
  { href: "/dashboard/seller/plans", label: "Plans", description: "Boost your listing's visibility", Icon: SparkleIcon },
];
