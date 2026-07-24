"use client";

import { useRouter } from "next/navigation";
import { price } from "@/lib/listings";
import { isElite } from "@/lib/badge";
import { useAuth } from "@/lib/auth/AuthContext";
import type { Property } from "@/types/api";

function LockIcon({ size = 13 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

/** Renders children only when the property's price is visible to the current
 *  viewer (non-Elite, or Elite + logged in). Keeps price-derived figures like
 *  cash-back estimates from leaking to locked visitors. */
export function PriceUnlocked({ property, children }: { property: Property; children: React.ReactNode }) {
  const { user } = useAuth();
  const locked = isElite(property) && !user;
  if (locked) return null;
  return <>{children}</>;
}

/** Inverse of PriceUnlocked — renders children only for locked visitors. */
export function PriceLocked({ property, children }: { property: Property; children: React.ReactNode }) {
  const { user } = useAuth();
  const locked = isElite(property) && !user;
  if (!locked) return null;
  return <>{children}</>;
}

type Variant = "plain" | "chip" | "hero";

export default function GatedPrice({
  property,
  className,
  variant = "plain",
}: {
  property: Property;
  /** Text-sizing / color classes applied to the unlocked price rendering. */
  className?: string;
  /**
   * plain — unlocked: bare text; locked: a dark "Login to view" lock pill.
   *         For card price rows and the detail sidebar.
   * chip  — unlocked: lime price pill; locked: dark lock pill of the same footprint.
   *         For image overlays (showcase cards, hero map pins).
   * hero  — unlocked: large bare text; locked: a framed "Login to view price" panel.
   *         For the listing detail page headline price.
   */
  variant?: Variant;
}) {
  const { user } = useAuth();
  const router = useRouter();
  const locked = isElite(property) && !user;
  const goLogin = () => router.push("/login");

  // ── Unlocked ──────────────────────────────────────────────
  if (!locked) {
    if (variant === "chip") {
      return (
        <span className={`inline-flex items-center rounded-full bg-lime px-4 py-1.5 shadow ${className ?? ""}`}>
          {price(property.askingPrice)}
        </span>
      );
    }
    return <p className={className}>{price(property.askingPrice)}</p>;
  }

  // ── Locked ────────────────────────────────────────────────
  // The real price is never placed in the DOM while locked.
  if (variant === "chip") {
    return (
      <button
        onClick={goLogin}
        className={`inline-flex items-center gap-1.5 rounded-full bg-ink/90 px-3.5 py-1.5 font-medium text-white shadow backdrop-blur transition-colors hover:bg-ink ${className ?? ""}`}
      >
        <LockIcon size={12} />
        Login to view
      </button>
    );
  }

  if (variant === "hero") {
    return (
      <button
        onClick={goLogin}
        className="group inline-flex items-center gap-3 rounded-2xl bg-ink px-5 py-3.5 text-left text-white transition-transform hover:-translate-y-px"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-lime text-ink">
          <LockIcon size={16} />
        </span>
        <span className="leading-tight">
          <span className="block text-base font-medium">Login to view price</span>
          <span className="block text-xs text-white/55">Exclusive to registered buyers</span>
        </span>
      </button>
    );
  }

  // plain
  return (
    <button
      onClick={goLogin}
      className="inline-flex items-center gap-1.5 rounded-full bg-ink px-3.5 py-1.5 text-sm font-medium text-white transition-transform hover:-translate-y-px"
    >
      <LockIcon size={13} />
      Login to view
    </button>
  );
}
