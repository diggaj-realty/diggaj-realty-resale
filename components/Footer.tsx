"use client";

import Image from "next/image";
import Link from "next/link";
import { useInView } from "@/lib/useInView";

// Placeholder domains until real profile URLs are provided — set the
// matching NEXT_PUBLIC_SOCIAL_* env var per platform to swap one in.
const socials = [
  { label: "X", href: process.env.NEXT_PUBLIC_SOCIAL_X || "https://x.com" },
  { label: "f", href: process.env.NEXT_PUBLIC_SOCIAL_FACEBOOK || "https://facebook.com" },
  { label: "in", href: process.env.NEXT_PUBLIC_SOCIAL_LINKEDIN || "https://linkedin.com" },
  { label: "ig", href: process.env.NEXT_PUBLIC_SOCIAL_INSTAGRAM || "https://instagram.com" },
  { label: "yt", href: process.env.NEXT_PUBLIC_SOCIAL_YOUTUBE || "https://youtube.com" },
];
const links = [
  { label: "All Homes", href: "/listings" },
  { label: "Buy", href: "/#buy-sell" },
  { label: "Sell", href: "/#buy-sell" },
  { label: "Contact", href: "/contact" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
];

export default function Footer() {
  const { ref: headingRef, inView: headingInView } = useInView<HTMLHeadingElement>();
  const { ref: blurbRef, inView: blurbInView } = useInView<HTMLDivElement>();

  return (
    <section className="relative overflow-clip bg-white pt-24">
      {/* future CTA */}
      <div className="flex flex-col gap-8 px-8 md:flex-row md:items-start md:justify-between md:px-14">
        <h2
          ref={headingRef}
          className={`max-w-xl text-section font-medium leading-tight tracking-[-0.02em] transition-all duration-700 ease-out ${
            headingInView ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
          }`}
        >
          The Future of Homebuying Is Here
        </h2>
        <div
          ref={blurbRef}
          className={`max-w-xs transition-all delay-150 duration-700 ease-out ${
            blurbInView ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
          }`}
        >
          <p className="text-lead text-body">
            Discover a smarter way to buy real estate with AI. Explore homes
            and experience next-gen homebuying.
          </p>
          <Link href="/listings" className="mt-5 inline-block rounded-full bg-panel px-5 py-2.5 text-xs text-white">
            Get started
          </Link>
        </div>
      </div>

      {/* footer brand block */}
      <div className="mt-20 px-8 pb-12 md:px-14">
        <div className="flex items-end gap-4 border-b border-ink/10 pb-6">
          {/* Deliberately viewport-relative so the wordmark keeps spanning the
              page, but clamped at both ends — raw 9vw hit 230px on a 2560px
              monitor. */}
          <span className="text-[clamp(2.25rem,11vw,3.75rem)] font-medium leading-[0.9] tracking-[-0.04em] md:text-[clamp(3.5rem,9vw,11rem)]">
            Diggaj Realty
          </span>
          <div className="relative mb-2 hidden h-16 w-28 shrink-0 overflow-hidden rounded-full md:block">
            <Image src="/img/interior-living.jpg" alt="Interior" fill sizes="112px" className="object-cover" />
          </div>
        </div>
        {/* pr reserves the bottom-right corner that the fixed floating AI button
            occupies, so the last nav link isn't sitting underneath it */}
        <div className="mt-6 flex flex-col items-start justify-between gap-6 md:flex-row md:items-center md:pr-20">
          <div className="flex flex-wrap items-center gap-3">
            {socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noreferrer"
                aria-label={s.label}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-ink/5 text-xs font-semibold text-ink/70 transition-colors hover:bg-lime hover:text-ink"
              >
                {s.label}
              </a>
            ))}
          </div>
          <nav className="flex min-w-0 flex-wrap gap-x-6 gap-y-2 text-xs text-ink/70 lg:gap-x-8">
            {links.map((l) => (
              <Link key={l.label} href={l.href} className="hover:text-ink">
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </section>
  );
}
