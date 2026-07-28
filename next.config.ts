import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Both of these are barrel-export packages: a single named import pulls the
  // whole module graph in unless the compiler rewrites it to deep imports.
  // recharts is the single largest thing in the client bundle (~360KB) and
  // framer-motion is on the marketing critical path (Hero + Nav).
  experimental: {
    optimizePackageImports: ["recharts", "framer-motion"],
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
