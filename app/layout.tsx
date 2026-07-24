import type { Metadata } from "next";
import { Inter } from "next/font/google";
import SmoothScroll from "@/components/SmoothScroll";
import { AuthProvider } from "@/lib/auth/AuthContext";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Diggaj Realty — Your Home & Savings",
  description:
    "All-in-one platform that simplifies your homebuying journey and gives you cash back for every Diggaj Realty service you use.",
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
