"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const socials = [
  { label: "X", href: "https://x.com" },
  { label: "f", href: "https://facebook.com" },
  { label: "in", href: "https://linkedin.com" },
  { label: "ig", href: "https://instagram.com" },
  { label: "yt", href: "https://youtube.com" },
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
  const marqueeRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: marqueeRef,
    offset: ["start end", "end start"],
  });
  // wordmark scrubs horizontally with scroll
  const marqueeX = useTransform(scrollYProgress, [0, 1], ["2%", "-28%"]);
  // the house card starts as a squat centered pill and expands to
  // near-full-bleed as it passes through the viewport — the video's key move
  const cardWidth = useTransform(scrollYProgress, [0.12, 0.6], ["34%", "96%"]);
  const cardHeight = useTransform(scrollYProgress, [0.12, 0.6], ["15rem", "26rem"]);
  const cardRadius = useTransform(scrollYProgress, [0.12, 0.6], ["120px", "40px"]);
  const imageScale = useTransform(scrollYProgress, [0.12, 0.6], [1.25, 1]);

  return (
    <section className="relative overflow-clip bg-white pt-24">
      {/* future CTA */}
      <div className="flex flex-col gap-8 px-8 md:flex-row md:items-start md:justify-between md:px-14">
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.6 }}
          className="max-w-xl text-4xl font-medium leading-tight tracking-[-0.02em] md:text-5xl"
        >
          The Future of Homebuying Is Here
        </motion.h2>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="max-w-xs"
        >
          <p className="text-sm leading-relaxed text-body">
            Discover a smarter way to buy real estate with AI. Explore homes
            and experience next-gen homebuying.
          </p>
          <Link href="/listings" className="mt-5 inline-block rounded-full bg-panel px-5 py-2.5 text-xs text-white">
            Get started
          </Link>
        </motion.div>
      </div>

      {/* scroll-scrubbed wordmark passing behind the house card */}
      <div ref={marqueeRef} className="relative mt-16">
        <div className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 select-none overflow-hidden">
          <motion.div style={{ x: marqueeX }} className="flex w-max whitespace-nowrap will-change-transform">
            {Array.from({ length: 10 }).map((_, i) => (
              <span
                key={i}
                className="px-5 text-3xl font-medium tracking-tight text-ink/60 md:text-4xl"
              >
                Diggaj Realty
              </span>
            ))}
          </motion.div>
        </div>
        <motion.div
          style={{ width: cardWidth, height: cardHeight, borderRadius: cardRadius }}
          className="relative mx-auto min-w-[320px] overflow-hidden shadow-2xl will-change-[width,height,border-radius]"
        >
          <motion.div style={{ scale: imageScale }} className="absolute inset-0">
            <Image src="/img/footer-house.jpg" alt="Modern home" fill sizes="100vw" quality={82} className="object-cover" />
          </motion.div>
        </motion.div>
      </div>

      {/* footer brand block */}
      <div className="mt-24 px-8 pb-12 md:px-14">
        <div className="flex items-end gap-4 border-b border-ink/10 pb-6">
          <span className="text-[13vw] font-medium leading-[0.9] tracking-[-0.04em] md:text-[9vw]">
            Diggaj Realty
          </span>
          <div className="relative mb-2 hidden h-16 w-28 shrink-0 overflow-hidden rounded-full md:block">
            <Image src="/img/interior-living.jpg" alt="Interior" fill sizes="112px" className="object-cover" />
          </div>
        </div>
        <div className="mt-6 flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div className="flex gap-3">
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
          <nav className="flex flex-wrap gap-x-8 gap-y-2 text-xs text-ink/70">
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
