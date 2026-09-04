import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Both of these are barrel-export packages: a single named import pulls the
  // whole module graph in unless the compiler rewrites it to deep imports.
  // recharts is the single largest thing in the client bundle (~360KB) and
  // framer-motion is on the marketing critical path (Hero + Nav).
  experimental: {
    optimizePackageImports: ["recharts", "framer-motion"],
  },
  // Ad creatives (RCS/paid campaigns) point at /myhna-vistara-gunjur, which was
  // never a real route. 308 it onto the canonical microsite instead of serving
  // those clicks a 404; Next carries the query string (?source=RCSAd) over on
  // its own, so campaign attribution survives the hop.
  async redirects() {
    return [
      { source: "/myhna-vistara-gunjur", destination: "/myhna-vistara", permanent: true },
      // The legal pages moved to keyword-matching slugs; keep the old paths alive
      // for anything already indexed or linked externally.
      { source: "/terms", destination: "/terms-and-condition", permanent: true },
      { source: "/privacy", destination: "/privacy-policy", permanent: true },
    ];
  },
  images: {
    // Next's default deviceSizes jump 1200 → 1920, and it always rounds UP. So a
    // 1440px laptop (and the 1536 `2xl` breakpoint) downloaded the 1920-wide
    // variant — for the full-bleed hero that's 369KB instead of ~200KB, a third
    // of it thrown away by the browser's own downscale. These two widths are
    // among the most common desktop viewports there are.
    deviceSizes: [640, 750, 828, 1080, 1200, 1440, 1536, 1920, 2048, 3840],
    qualities: [75, 80, 82],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
