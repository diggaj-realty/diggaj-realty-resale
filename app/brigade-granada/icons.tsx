import type { ReactNode } from "react";

/* Page-local icon set.
 *
 * Same visual contract as components/dashboard/icons.tsx — 24-unit viewBox,
 * currentColor stroke at 1.7, round caps — but this page needs ~26 icons where
 * that file's fully-expanded-per-icon style would run to 300 lines, so the
 * shared <svg> wrapper is factored out here. Server-safe: no hooks, no state,
 * so it imports cleanly into the static page and into data.ts. */

type IconProps = { className?: string };

function Ico({
  className = "",
  size = 18,
  children,
}: IconProps & { size?: number; children: ReactNode }) {
  return (
    <svg
      className={`shrink-0 ${className}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {children}
    </svg>
  );
}

/* ── Project facts ─────────────────────────────────────────────────────── */

export const AcreIcon = (p: IconProps) => (
  <Ico {...p}>
    <path d="M3 6.5 9 4l6 2.5L21 4v13.5L15 20l-6-2.5L3 20z" />
    <path d="M9 4v13.5" />
    <path d="M15 6.5V20" />
  </Ico>
);

export const LayersIcon = (p: IconProps) => (
  <Ico {...p}>
    <path d="m12 2.5 8.5 4.75L12 12 3.5 7.25z" />
    <path d="m3.5 12 8.5 4.75L20.5 12" />
    <path d="m3.5 16.5 8.5 4.75 8.5-4.75" />
  </Ico>
);

export const GridIcon = (p: IconProps) => (
  <Ico {...p}>
    <rect x="3" y="3" width="7.5" height="7.5" rx="1.2" />
    <rect x="13.5" y="3" width="7.5" height="7.5" rx="1.2" />
    <rect x="3" y="13.5" width="7.5" height="7.5" rx="1.2" />
    <rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.2" />
  </Ico>
);

export const BedIcon = (p: IconProps) => (
  <Ico {...p}>
    <path d="M3 18v-7h13a4 4 0 0 1 4 4v3" />
    <path d="M3 11V6" />
    <path d="M3 18h18" />
    <circle cx="7.5" cy="8.5" r="1.5" />
  </Ico>
);

export const KeyIcon = (p: IconProps) => (
  <Ico {...p}>
    <circle cx="7.5" cy="15.5" r="4" />
    <path d="m10.5 12.5 8-8" />
    <path d="m15 8 2.5 2.5" />
    <path d="m18 5 2.5 2.5" />
  </Ico>
);

export const FlagIcon = (p: IconProps) => (
  <Ico {...p}>
    <path d="M5 21V4" />
    <path d="M5 4.5h11l-2 4 2 4H5" />
  </Ico>
);

/* ── Mixed-use components ──────────────────────────────────────────────── */

export const HotelIcon = (p: IconProps) => (
  <Ico {...p}>
    <path d="M4 17h16" />
    <path d="M5.5 17a6.5 6.5 0 0 1 13 0" />
    <path d="M12 10.5V7.5" />
    <circle cx="12" cy="5.8" r="1.3" />
    <path d="M3 20.5h18" />
  </Ico>
);

export const TowerIcon = (p: IconProps) => (
  <Ico {...p}>
    <rect x="6" y="2.5" width="12" height="18.5" rx="1.2" />
    <path d="M9.5 6h1M13.5 6h1M9.5 10h1M13.5 10h1M9.5 14h1M13.5 14h1" />
    <path d="M3 21h18" />
  </Ico>
);

export const ShopIcon = (p: IconProps) => (
  <Ico {...p}>
    <path d="M5.5 8h13l-1 12.5h-11z" />
    <path d="M9 8V6a3 3 0 0 1 6 0v2" />
  </Ico>
);

/* ── Amenity groups ────────────────────────────────────────────────────── */

export const TrophyIcon = (p: IconProps) => (
  <Ico {...p}>
    <path d="M8 4h8v5a4 4 0 0 1-8 0z" />
    <path d="M8 5.5H5.5a2.5 2.5 0 0 0 2.5 4.2" />
    <path d="M16 5.5h2.5a2.5 2.5 0 0 1-2.5 4.2" />
    <path d="M12 13v4" />
    <path d="M8.5 20.5h7" />
  </Ico>
);

export const LeafIcon = (p: IconProps) => (
  <Ico {...p}>
    <path d="M4 20c0-9 6-15 16-16 1 10-5 16-13 16H4z" />
    <path d="M4 20c4-6 8-9 13-11" />
  </Ico>
);

export const DiceIcon = (p: IconProps) => (
  <Ico {...p}>
    <rect x="3.5" y="3.5" width="17" height="17" rx="3" />
    <circle cx="8.5" cy="8.5" r="1.1" fill="currentColor" stroke="none" />
    <circle cx="12" cy="12" r="1.1" fill="currentColor" stroke="none" />
    <circle cx="15.5" cy="15.5" r="1.1" fill="currentColor" stroke="none" />
  </Ico>
);

export const CoffeeIcon = (p: IconProps) => (
  <Ico {...p}>
    <path d="M4 8h13v6a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z" />
    <path d="M17 9.5h1.5a2.5 2.5 0 0 1 0 5H17" />
    <path d="M7 4.5v1M11 4.5v1" />
  </Ico>
);

export const ShieldIcon = (p: IconProps) => (
  <Ico {...p}>
    <path d="M12 2 4 5v6c0 5 3.4 8.5 8 11 4.6-2.5 8-6 8-11V5l-8-3Z" />
  </Ico>
);

/* ── Connectivity groups ───────────────────────────────────────────────── */

export const TrainIcon = (p: IconProps) => (
  <Ico {...p}>
    <rect x="5" y="3.5" width="14" height="12" rx="3" />
    <path d="M5 10h14" />
    <circle cx="9" cy="12.8" r="0.9" />
    <circle cx="15" cy="12.8" r="0.9" />
    <path d="m8.5 15.5-2 5" />
    <path d="m15.5 15.5 2 5" />
    <path d="M6.5 20.5h11" />
  </Ico>
);

export const BriefcaseIcon = (p: IconProps) => (
  <Ico {...p}>
    <rect x="2.5" y="7" width="19" height="13" rx="2" />
    <path d="M9 7V5.5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2V7" />
    <path d="M2.5 12.5h19" />
  </Ico>
);

export const CapIcon = (p: IconProps) => (
  <Ico {...p}>
    <path d="m2.5 8.5 9.5-4 9.5 4-9.5 4z" />
    <path d="M7 10.8V16c0 1.4 2.2 2.5 5 2.5s5-1.1 5-2.5v-5.2" />
    <path d="M21.5 8.5V14" />
  </Ico>
);

export const CrossIcon = (p: IconProps) => (
  <Ico {...p}>
    <path d="M10 3.5h4V10h6.5v4H14v6.5h-4V14H3.5v-4H10z" />
  </Ico>
);


/* ── Specification rows ────────────────────────────────────────────────── */

export const FrameIcon = (p: IconProps) => (
  <Ico {...p}>
    <rect x="3.5" y="3.5" width="17" height="17" rx="1.5" />
    <path d="M3.5 9h17M3.5 15h17M9 3.5v17M15 3.5v17" />
  </Ico>
);

export const FloorIcon = (p: IconProps) => (
  <Ico {...p}>
    <path d="M2.5 17 12 12.2 21.5 17 12 21.8z" />
    <path d="M2.5 12 12 7.2 21.5 12" />
    <path d="M12 2.5v4.7" />
  </Ico>
);

export const StoveIcon = (p: IconProps) => (
  <Ico {...p}>
    <rect x="3.5" y="6" width="17" height="14" rx="2" />
    <path d="M3.5 11h17" />
    <circle cx="8" cy="8.5" r="0.9" />
    <circle cx="12" cy="8.5" r="0.9" />
    <path d="M8 15h8" />
    <path d="M6.5 3.5v2.5M17.5 3.5v2.5" />
  </Ico>
);

export const DropletIcon = (p: IconProps) => (
  <Ico {...p}>
    <path d="M12 3.5s6 6.2 6 10a6 6 0 0 1-12 0c0-3.8 6-10 6-10Z" />
  </Ico>
);

export const DoorIcon = (p: IconProps) => (
  <Ico {...p}>
    <path d="M5 21V4a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v17" />
    <path d="M3 21h18" />
    <circle cx="15.5" cy="12" r="1" />
  </Ico>
);

export const BoltIcon = (p: IconProps) => (
  <Ico {...p}>
    <path d="M13.5 2.5 5 13.5h5l-1.5 8L19 10.5h-5.5z" />
  </Ico>
);

export const LiftIcon = (p: IconProps) => (
  <Ico {...p}>
    <rect x="4.5" y="2.5" width="15" height="19" rx="2" />
    <path d="M12 2.5v19" />
    <path d="M8.25 10.5v-4m-1.5 1.5 1.5-1.5 1.5 1.5" />
    <path d="M15.75 13.5v4m1.5-1.5-1.5 1.5-1.5-1.5" />
  </Ico>
);

export const CompassIcon = (p: IconProps) => (
  <Ico {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="m15.5 8.5-5 2-2 5 5-2z" />
  </Ico>
);

/* ── Utility ───────────────────────────────────────────────────────────── */

export const PinIcon = (p: IconProps) => (
  <Ico {...p}>
    <path d="M12 21.5s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11Z" />
    <circle cx="12" cy="10.5" r="2.5" />
  </Ico>
);

export const CheckIcon = (p: IconProps) => (
  <Ico {...p} size={14}>
    <path d="m5 12.5 4.5 4.5L19 7" />
  </Ico>
);


