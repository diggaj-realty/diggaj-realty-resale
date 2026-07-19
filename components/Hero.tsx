"use client";

import Image from "next/image";
import { motion } from "framer-motion";

const rise = {
  hidden: { opacity: 0, y: 18 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: 0.15 * i, ease: [0.25, 0.1, 0.25, 1] as const },
  }),
};

function PricePin({ label, className }: { label: string; className?: string }) {
  return (
    <div className={`absolute ${className ?? ""}`}>
      <div className="rounded-full bg-white px-4 py-1.5 text-sm font-medium shadow-lg">
        {label}
      </div>
      <div className="mx-auto h-3 w-px bg-white/90" />
    </div>
  );
}

export default function Hero() {
  return (
    <section className="relative overflow-clip bg-cream">
      {/* nav */}
      <motion.nav
        variants={rise}
        initial="hidden"
        animate="show"
        custom={0}
        className="relative z-20 flex items-center justify-between px-8 pt-7 md:px-14"
      >
        <span className="text-xl font-semibold tracking-tight">Diggaj Realty</span>
        <div className="flex gap-3">
          <button className="rounded-full bg-panel px-5 py-2.5 text-sm text-white">
            Get help
          </button>
          <button className="rounded-full bg-white px-5 py-2.5 text-sm shadow-sm">
            Menu <span className="ml-1 align-middle">⋮</span>
          </button>
        </div>
      </motion.nav>

      {/* copy */}
      <div className="relative z-20 px-8 pt-14 md:px-14">
        <motion.h1
          variants={rise}
          initial="hidden"
          animate="show"
          custom={1}
          className="max-w-4xl text-5xl font-medium tracking-[-0.03em] md:text-7xl"
        >
          Your Home &amp; Savings
        </motion.h1>
        <motion.p
          variants={rise}
          initial="hidden"
          animate="show"
          custom={2}
          className="mt-8 max-w-md text-[15px] leading-relaxed text-ink/80"
        >
          All-in-one platform that simplifies your homebuying journey — from
          search to closing — and gives you cash back for every Diggaj Realty
          service you use.
        </motion.p>
        <motion.button
          variants={rise}
          initial="hidden"
          animate="show"
          custom={3}
          className="mt-8 rounded-full bg-panel px-6 py-3 text-sm text-white"
        >
          Get started
        </motion.button>
      </div>

      {/* house visual */}
      <div className="relative mt-[-40px] h-[440px] md:h-[580px]">
        <Image
          src="/img/hero-house.jpg"
          alt="Modern black house on a meadow"
          fill
          priority
          sizes="100vw"
          quality={82}
          className="object-cover object-[center_68%] [mask-image:linear-gradient(to_bottom,transparent_0%,black_26%)]"
        />

        {/* pins anchored to the house and the field */}
        <div className="absolute left-[24%] top-[74%] hidden md:block">
          <div className="drift" style={{ animationDelay: "0.8s" }}>
            <PricePin label="$427,000" />
          </div>
        </div>
        <div className="absolute left-[46%] top-[46%]">
          <div className="drift" style={{ animationDelay: "2.4s" }}>
            <PricePin label="$1,299,900" />
          </div>
        </div>

        {/* fanned listing cards — offset so both prices stay readable */}
        <motion.div
          variants={rise}
          initial="hidden"
          animate="show"
          custom={4}
          className="absolute right-[5%] top-[-100px] z-20 hidden md:block"
        >
          <div
            className="drift w-52 rounded-2xl bg-white p-2 shadow-xl [--drift-rot:-7deg]"
            style={{ animationDelay: "1.5s" }}
          >
            <div className="relative h-24 overflow-hidden rounded-xl">
              <Image src="/img/villa.jpg" alt="Listing" fill sizes="208px" className="object-cover" />
            </div>
            <p className="px-2 pb-1 pt-2 text-sm font-semibold">$897,000</p>
          </div>
          <div
            className="drift ml-36 mt-2 w-56 rounded-2xl bg-white p-2 shadow-xl [--drift-rot:5deg]"
            style={{ animationDelay: "0s" }}
          >
            <div className="relative h-28 overflow-hidden rounded-xl">
              <Image
                src="/img/interior-living.jpg"
                alt="Listing interior"
                fill
                sizes="224px"
                className="object-cover"
              />
            </div>
            <div className="px-2 pb-1 pt-2">
              <p className="text-base font-semibold">$1,299,900</p>
              <p className="text-xs text-body">3 bed · 3 bath · 2 031 sqft</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
