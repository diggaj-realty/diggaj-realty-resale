"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";

const LenisScroll = dynamic(() => import("@/components/LenisScroll"), { ssr: false });

// Routes with their own internal scroll containers (dashboard) or no benefit
// from document-level smooth scroll (legal text) skip Lenis entirely — its JS
// chunk is then never fetched for these routes either, not just unused.
const EXCLUDED_PREFIXES = ["/dashboard", "/terms", "/privacy"];

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const excluded = EXCLUDED_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  return (
    <>
      {!excluded && <LenisScroll />}
      {children}
    </>
  );
}
