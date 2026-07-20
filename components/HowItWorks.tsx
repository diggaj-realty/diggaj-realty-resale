"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { LISTINGS, price } from "@/lib/listings";

const STEPS = [
  {
    n: "01",
    title: "Search smarter, tour easier",
    body: "Discover personalized listings and schedule home tours directly through our AI-powered platform.",
    cta: "Explore listings",
    href: "/listings",
    slug: "meadow-longhouse",
    window: [0.06, 0.36] as const,
  },
  {
    n: "02",
    title: "Connect with an agent",
    body: "Get up to 75% of the buyer's agent commission back — an average of ₹5 Lakh.",
    cta: "Learn more",
    href: "/#buy-sell",
    slug: "pinnacle-highland-park",
    window: [0.36, 0.66] as const,
  },
  {
    n: "03",
    title: "Close without the chaos",
    body: "Simplify your closing process with real estate, mortgage, and title services — all in one place.",
    cta: "Talk to an agent",
    href: "/contact",
    slug: "aurora-ridge",
    window: [0.66, 0.96] as const,
  },
];

export default function HowItWorks() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  // The facade layer is 240% of the panel height. Cards live INSIDE it,
  // pinned to floors of the building, so they ride the pan and exit
  // through the top exactly like annotations stuck to the architecture.
  const facadeY = useTransform(scrollYProgress, [0, 1], ["0%", "-58%"]);

  const titleOpacity = useTransform(scrollYProgress, [0.1, 0.24], [1, 0]);
  const titleY = useTransform(scrollYProgress, [0.1, 0.24], [0, -80]);

  // progress rail fill — shows scroll position through the steps
  const railScale = useTransform(scrollYProgress, [0.03, 0.98], [0, 1]);

  return (
    <section ref={ref} className="relative h-[340vh] bg-white">
      <div className="sticky top-0 h-screen overflow-clip px-3 py-3">
        <div className="relative h-full overflow-clip rounded-[28px] bg-panel">
          {/* facade layer: image + cards travel together */}
          <motion.div style={{ y: facadeY }} className="absolute inset-x-0 top-0 h-[240%] will-change-transform">
            <Image
              src="/img/building-hero.jpg"
              alt="Modern building facade"
              fill
              sizes="100vw"
              quality={80}
              className="object-cover opacity-95"
            />
            <div className="absolute inset-x-0 top-0 h-[30%] bg-gradient-to-b from-panel/90 via-panel/30 to-transparent" />

            {/* step 1 + its property */}
            <StepCard step={STEPS[0]} progress={scrollYProgress} className="left-[6%] top-[29%] -rotate-[5deg]" />
            <PropertyCard slug={STEPS[0].slug} className="right-[8%] top-[26%] rotate-[3deg]" />

            {/* step 2 + its property */}
            <StepCard step={STEPS[1]} progress={scrollYProgress} className="right-[8%] top-[48%] rotate-[2deg]" />
            <PropertyCard slug={STEPS[1].slug} className="left-[8%] top-[47%] -rotate-[3deg]" />

            {/* step 3 + its property */}
            <StepCard step={STEPS[2]} progress={scrollYProgress} className="left-[7%] top-[68%] -rotate-[3deg]" />
            <PropertyCard slug={STEPS[2].slug} className="right-[9%] top-[70%] rotate-[4deg]" />
          </motion.div>

          {/* pinned title — fades away as the facade starts moving */}
          <motion.div
            style={{ opacity: titleOpacity, y: titleY }}
            className="relative z-10 pt-20 text-center text-white"
          >
            <h2 className="text-4xl font-medium tracking-[-0.02em] md:text-6xl">
              How It Works
            </h2>
            <p className="mt-4 text-sm text-white/70">
              Three steps from search to keys in hand.
            </p>
          </motion.div>

          {/* step progress rail — always visible, shows where you are */}
          <div className="pointer-events-none absolute inset-x-0 bottom-8 z-30 flex justify-center">
            <div className="flex items-center gap-3 rounded-full bg-black/30 px-5 py-2.5 backdrop-blur">
              <div className="relative h-1 w-32 overflow-hidden rounded-full bg-white/20 sm:w-48">
                <motion.div
                  style={{ scaleX: railScale, transformOrigin: "left" }}
                  className="h-full w-full rounded-full bg-lime"
                />
              </div>
              <div className="flex gap-1.5 text-[11px] font-medium text-white/70">
                {STEPS.map((s) => (
                  <span key={s.n}>{s.n}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function StepCard({
  step,
  progress,
  className,
}: {
  step: (typeof STEPS)[number];
  progress: ReturnType<typeof useScroll>["scrollYProgress"];
  className: string;
}) {
  const [a, b] = step.window;
  const highlight = useTransform(progress, [a, (a + b) / 2, b], [0.55, 1, 0.55]);

  return (
    <motion.div
      style={{ opacity: highlight }}
      className={`absolute z-20 w-64 rounded-2xl bg-white p-5 shadow-2xl ${className}`}
    >
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-lime text-[11px] font-bold text-ink">
        {step.n}
      </span>
      <p className="mt-3 text-[15px] font-semibold text-ink">{step.title}</p>
      <p className="mt-2 text-xs leading-relaxed text-ink/60">{step.body}</p>
      <Link href={step.href} className="mt-3 inline-block text-xs font-semibold text-ink underline underline-offset-4">
        {step.cta} →
      </Link>
    </motion.div>
  );
}

// same UI as the Hero: price pill → stem → peek card
function PropertyCard({ slug, className }: { slug: string; className: string }) {
  const l = LISTINGS.find((x) => x.slug === slug)!;
  return (
    <div className={`absolute z-20 hidden md:block ${className}`}>
      <div className="flex justify-center">
        <span className="rounded-full bg-lime px-4 py-1.5 text-sm font-medium text-ink shadow-lg">
          {price(l.price)}
        </span>
      </div>
      <div className="mx-auto h-3 w-px bg-white/90" />

      <div className="mt-2 w-60">
        <Link
          href={`/listings/${l.slug}`}
          className="block overflow-hidden rounded-2xl bg-white p-2 shadow-2xl transition-transform hover:-translate-y-1"
        >
          <div className="relative h-28 overflow-hidden rounded-xl">
            <Image src={l.img} alt={l.title} fill sizes="240px" className="object-cover" />
            <span className="absolute left-2 top-2 rounded-full bg-lime px-2.5 py-1 text-[10px] font-semibold text-ink">
              {l.badge}
            </span>
          </div>
          <div className="px-2 pb-1.5 pt-2">
            <p className="truncate text-sm font-semibold text-ink">{l.title}</p>
            <p className="mt-0.5 text-xs text-body">
              {l.beds} bed · {l.baths} bath · {l.city}
            </p>
            <p className="mt-1.5 text-xs font-semibold text-ink">View home →</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
