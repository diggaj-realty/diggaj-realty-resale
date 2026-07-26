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
      {/* `key={pathname}` forces a full destroy/recreate of the Lenis
          instance on every route change. Without it, navigating between two
          pages that both render LenisScroll (e.g. one property detail page
          to another) keeps the SAME instance mounted — its internal virtual
          scroll offset survives the navigation and fights Next's own
          scroll-to-top, so the new page can render already scrolled down to
          wherever the previous page's scroll happened to be (e.g. its
          Locality/Map section). */}
      {!excluded && <LenisScroll key={pathname} />}
      {children}
    </>
  );
}
