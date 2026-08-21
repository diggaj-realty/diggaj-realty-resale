import type { Metadata } from "next";
import { Inter } from "next/font/google";
import SmoothScroll from "@/components/SmoothScroll";
import { AuthProvider } from "@/lib/auth/AuthContext";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const SITE_URL = "https://diggajrealty.com";
const SITE_TITLE = "Diggaj Realty: Your Home & Savings";
const SITE_DESCRIPTION =
  "All-in-one platform that simplifies your homebuying journey with verified listings and a dedicated advisor at every step.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_TITLE, template: "%s | Diggaj Realty" },
  description: SITE_DESCRIPTION,
  verification: {
    google: "B9xKsgEwmCdwWO-yqD-2WITe7UFLG2yq2RbeVxfAEZE",
  },
  openGraph: {
    type: "website",
    siteName: "Diggaj Realty",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    images: [{ url: "/img/hero-house.jpg", width: 1200, height: 630, alt: "Diggaj Realty" }],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <head>
        {/* Warm up connections to the API + image CDN before the first fetch/image. */}
        <link rel="preconnect" href="https://diggaj-realty-resale-admin.vercel.app" crossOrigin="" />
        <link rel="preconnect" href="https://zgadjucdqocbyntijbvy.supabase.co" crossOrigin="" />
        <link rel="dns-prefetch" href="https://zgadjucdqocbyntijbvy.supabase.co" />
      </head>
      <body className="min-h-full">
        <AuthProvider>
          <SmoothScroll>{children}</SmoothScroll>
        </AuthProvider>
      </body>
    </html>
  );
}
