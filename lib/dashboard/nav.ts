import type { ComponentType } from "react";
import type { UserRole } from "@/types/auth";
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
  ShieldIcon,
  PlusIcon,
  UserIcon,
} from "@/components/dashboard/icons";

export type NavItem = {
  href: string;
  label: string;
  description: string;
  Icon: ComponentType<{ className?: string }>;
  /** For active-state matching: exact ("/dashboard/buyer") vs prefix routes. */
  exact?: boolean;
  /** Sidebar grouping. A flat list of 8+ equal-weight links is hard to scan, so
   *  items are bucketed under small headings; order here defines section order. */
  group?: NavGroup;
  /** Excluded from the Overview page's "Jump to" grid — for secondary or
   *  one-off destinations (verification, create forms) that aren't core
   *  sections. Nav-only. */
  secondary?: boolean;
};

export type NavGroup = "Overview" | "Pipeline" | "Property" | "Account";

/** Fixed render order for sidebar groups. */
export const NAV_GROUP_ORDER: NavGroup[] = ["Overview", "Pipeline", "Property", "Account"];

/** Groups items in the declared group order, dropping empty buckets. */
export function groupNav(items: NavItem[]): { group: NavGroup; items: NavItem[] }[] {
  return NAV_GROUP_ORDER.map((group) => ({
    group,
    items: items.filter((i) => (i.group ?? "Overview") === group),
  })).filter((g) => g.items.length > 0);
}

// Grouped rather than one flat list: 7-9 equal-weight links with no structure
// forced the user to read every label to find anything. "Pipeline" is the
// buy/sell journey in the order it actually happens (enquiry → offer → visit →
// close), which is also the order these statuses progress in.
export const BUYER_NAV: NavItem[] = [
  { href: "/dashboard/buyer", label: "Overview", description: "Your activity at a glance", Icon: OverviewIcon, exact: true, group: "Overview" },

  { href: "/dashboard/buyer/interests", label: "Interests", description: "Leads before any formal offer", Icon: HandshakeIcon, group: "Pipeline" },
  { href: "/dashboard/buyer/offers", label: "Offers", description: "Track & negotiate your offers", Icon: OfferIcon, group: "Pipeline" },
  { href: "/dashboard/buyer/site-visits", label: "Site Visits", description: "Requested & scheduled tours", Icon: CalendarIcon, group: "Pipeline" },
  { href: "/dashboard/buyer/closing", label: "Closing & Documents", description: "Track your deal to close", Icon: DocumentIcon, group: "Pipeline" },

  { href: "/dashboard/buyer/saved", label: "Saved", description: "Properties you've shortlisted", Icon: HeartIcon, group: "Property" },
  { href: "/dashboard/buyer/saved-searches", label: "Saved Searches", description: "Get alerted on new matches", Icon: BookmarkIcon, group: "Property" },
];

export const SELLER_NAV: NavItem[] = [
  { href: "/dashboard/seller", label: "Overview", description: "Your activity at a glance", Icon: OverviewIcon, exact: true, group: "Overview" },

  { href: "/dashboard/seller/interests", label: "Buyer Interests", description: "Leads before any formal offer", Icon: HeartIcon, group: "Pipeline" },
  { href: "/dashboard/seller/offers", label: "Offers", description: "Respond to buyer offers", Icon: OfferIcon, group: "Pipeline" },
  { href: "/dashboard/seller/site-visits", label: "Site Visits", description: "Who's touring your property", Icon: CalendarIcon, group: "Pipeline" },
  { href: "/dashboard/seller/deals", label: "Deals", description: "Closing progress & payments", Icon: HandshakeIcon, group: "Pipeline" },

  { href: "/dashboard/seller/listings", label: "My Listings", description: "Manage your submitted listings", Icon: BuildingIcon, group: "Property" },
  // Was reachable only from a button on the listings page.
  { href: "/dashboard/seller/listings/new", label: "Add Listing", description: "Submit a new property", Icon: PlusIcon, group: "Property", secondary: true },
  { href: "/dashboard/seller/plans", label: "Plans", description: "Boost your listing's visibility", Icon: SparkleIcon, group: "Property" },

  // KYC had NO nav entry at all — the only ways in were a banner that shows
  // exclusively while unapproved, and the listing wizard's blocked gate. A
  // seller wanting to check their verification status simply couldn't get here.
  { href: "/dashboard/seller/kyc", label: "Verification", description: "Your KYC status", Icon: ShieldIcon, group: "Account", secondary: true },
];

// Rendered separately, pinned to the bottom of the sidebar/drawer — not part
// of BUYER_NAV/SELLER_NAV so it doesn't also show up in the Overview page's
// "Jump to" quick-links grid (SectionLinks), which is for core dashboard
// sections, not account settings. Lives under the same /dashboard/{role}
// shell as everything else (not a standalone /profile route) so it opens
// with the sidebar/header intact instead of dropping the user onto the
// public marketing layout.
export function getProfileNavItem(role: UserRole): NavItem {
  return {
    href: `/dashboard/${role.toLowerCase()}/profile`,
    label: "Profile & Settings",
    description: "Manage your account details",
    Icon: UserIcon,
  };
}
