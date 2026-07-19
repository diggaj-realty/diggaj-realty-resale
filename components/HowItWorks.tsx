"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

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

  return (
    <section ref={ref} className="relative h-[340vh] bg-white">
      <div className="sticky top-0 h-screen overflow-clip px-3 py-3">
        <div className="relative h-full overflow-clip rounded-[28px] bg-panel">
          {/* facade layer: image + cards travel together */}
          <motion.div style={{ y: facadeY }} className="absolute inset-x-0 top-0 h-[240%] will-change-transform">
            <Image
              src="/img/dusk-building.jpg"
              alt="Apartment building at night, windows lit"
              fill
              sizes="100vw"
              quality={80}
              className="object-cover opacity-95"
            />
            <div className="absolute inset-x-0 top-0 h-[30%] bg-gradient-to-b from-panel/90 via-panel/30 to-transparent" />

            {/* step 1 — pinned to the upper floors */}
            <div className="absolute left-[6%] top-[30%] z-20 w-64 rotate-[-5deg] rounded-2xl bg-lime p-5 shadow-2xl">
              <p className="text-[15px] font-semibold">Search smarter, tour easier</p>
              <p className="mt-2 text-xs leading-relaxed text-ink/70">
                Discover personalized listings and schedule home tours directly
                through our AI-powered platform.
              </p>
              <p className="mt-3 text-xs font-semibold">Explore listings →</p>
            </div>
            <div className="absolute right-[10%] top-[27%] z-20 w-32 rotate-[3deg] rounded-xl bg-white p-1.5 shadow-xl">
              <div className="relative h-16 overflow-hidden rounded-lg">
                <Image src="/img/interior2.jpg" alt="App preview" fill sizes="128px" className="object-cover object-[center_12%]" />
              </div>
            </div>

            {/* step 2 — pinned to the middle floors */}
            <div className="absolute right-[9%] top-[48%] z-20 w-64 rotate-[2deg] rounded-2xl bg-white p-5 shadow-2xl">
              <p className="text-[15px] font-semibold">Connect with an agent</p>
              <p className="mt-2 text-xs leading-relaxed text-ink/60">
                Get up to 75% of the buyer&apos;s agent commission back — an
                average of $8,000.
              </p>
              <p className="mt-3 text-xs font-semibold">Learn more →</p>
            </div>
            <div className="absolute right-[22%] top-[56%] z-20 h-16 w-16 overflow-hidden rounded-full bg-lime p-1 shadow-xl">
              <Image
                src="/img/agent.jpg"
                alt="Agent"
                fill
                sizes="64px"
                className="rounded-full object-cover object-[46%_20%] scale-[1.4]"
              />
            </div>

            {/* step 3 — pinned to the lower floors */}
            <div className="absolute left-[8%] top-[68%] z-20 w-64 rotate-[-3deg] rounded-2xl bg-white p-5 shadow-2xl">
              <p className="text-[15px] font-semibold">Close without the chaos</p>
              <p className="mt-2 text-xs leading-relaxed text-ink/60">
                Simplify your closing process with real estate, mortgage, and
                title services — all in one place.
              </p>
              <p className="mt-3 text-xs font-semibold">Connect with an agent →</p>
            </div>
            <div className="absolute left-[42%] top-[76%] z-20 w-36 rotate-[-4deg] rounded-xl bg-lime p-1.5 shadow-xl">
              <div className="relative h-16 overflow-hidden rounded-lg">
                <Image src="/img/interior-living.jpg" alt="Interior" fill sizes="144px" className="object-cover" />
              </div>
            </div>
            <div className="absolute right-[14%] top-[74%] z-20">
              <span className="flex items-center gap-2 rounded-full bg-lime px-4 py-2 text-xs font-semibold shadow-lg">
                Room 202 <span className="rounded-full bg-white/60 px-1.5">🔑</span>
              </span>
            </div>
          </motion.div>

          {/* pinned title — fades away as the facade starts moving */}
          <motion.div
            style={{ opacity: titleOpacity, y: titleY }}
            className="relative z-10 pt-20 text-center text-white"
          >
            <h2 className="text-4xl font-medium tracking-[-0.02em] md:text-6xl">
              How It Works?
            </h2>
            <p className="mt-4 text-sm text-white/70">
              Smart tools. Expert guidance. Real value.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
