"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

// gray pins scattered around the map — first wave
const grayPins = [
  { label: "$427,000", cls: "left-[12%] top-[18%]" },
  { label: "$580,750", cls: "left-[19%] top-[30%]" },
  { label: "$385,000", cls: "right-[9%] top-[44%]" },
  { label: "$312,500", cls: "left-[22%] bottom-[20%]" },
  { label: "$427,000", cls: "left-[11%] bottom-[10%]" },
  { label: "$512,000", cls: "right-[10%] bottom-[12%]" },
];

// lime pin + photo card pairs — pop in together as one unit, like the video
const listingCards = [
  {
    price: "$125,456",
    img: "/img/interior-living.jpg",
    cls: "right-[14%] top-[12%]",
    rot: "rotate-[3deg]",
    delay: 0.55,
  },
  {
    price: "$122,345",
    img: "/img/interior-kitchen.jpg",
    cls: "left-[7%] top-[52%]",
    rot: "rotate-[-4deg]",
    delay: 0.7,
  },
  {
    price: "$125,456",
    img: "/img/interior2.jpg",
    cls: "right-[24%] bottom-[16%]",
    rot: "rotate-[2deg]",
    delay: 0.85,
  },
];

function MapTexture() {
  // real dark city map (Carto dark tiles, Paris)
  return (
    <>
      <Image
        src="/img/map-dark.jpg"
        alt=""
        fill
        aria-hidden
        sizes="100vw"
        quality={78}
        className="object-cover"
      />
      {/* soft vignette so the copy stays readable */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,16,16,0.72)_0%,rgba(16,16,16,0.15)_60%,transparent_100%)]" />
    </>
  );
}

// video behavior: elements fade in place — gentle rise, no bounce
const pop = {
  hidden: { opacity: 0, y: 14, scale: 0.94 },
  show: (delay: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.55, delay, ease: [0.25, 0.1, 0.25, 1] as const },
  }),
};

export default function ExploreMap() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  // gentle parallax: the map texture pans slower than the panel while scrolling through
  const mapY = useTransform(scrollYProgress, [0, 1], ["-6%", "6%"]);
  const mapScale = useTransform(scrollYProgress, [0, 0.5], [1.08, 1]);

  return (
    <section className="bg-white px-3 pb-3">
      <div ref={ref} className="relative min-h-[86vh] overflow-clip rounded-[28px] bg-panel">
        <motion.div style={{ y: mapY, scale: mapScale }} className="absolute inset-[-8%] will-change-transform">
          <MapTexture />
        </motion.div>

        {/* centered copy */}
        <div className="relative z-10 flex min-h-[86vh] flex-col items-center justify-center px-6 text-center text-white">
          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-4xl font-medium tracking-[-0.02em] md:text-6xl"
          >
            Explore Nearby Homes
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="mt-4 max-w-xs text-sm text-white/70"
          >
            Browse available homes near you and explore listings in your
            favorite areas.
          </motion.p>
          <motion.button
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-8 rounded-full bg-white px-6 py-3 text-sm font-medium text-ink shadow-lg"
          >
            Get started
          </motion.button>
        </div>

        {/* wave 1 — gray pins */}
        {grayPins.map((p, i) => (
          <motion.div
            key={i}
            variants={pop}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.4 }}
            custom={0.1 * i}
            className={`absolute z-10 ${p.cls}`}
          >
            <div className="bob" style={{ animationDelay: `${i * 0.6}s` }}>
              <span className="rounded-full bg-[#2a2a2a] px-3.5 py-1.5 text-xs font-medium text-white shadow-lg ring-1 ring-white/10">
                {p.label}
              </span>
            </div>
          </motion.div>
        ))}

        {/* wave 2 — lime pin + photo card pairs, popping in as one unit */}
        {listingCards.map((c, i) => (
          <motion.div
            key={i}
            variants={pop}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.4 }}
            custom={c.delay}
            className={`absolute z-10 hidden md:block ${c.cls}`}
          >
            <div className="bob" style={{ animationDelay: `${1 + i * 0.8}s` }}>
              <div className={`relative w-40 ${c.rot} rounded-xl bg-white p-1.5 shadow-2xl`}>
                <div className="relative h-20 overflow-hidden rounded-lg">
                  <Image
                    src={c.img}
                    alt="Listing"
                    fill
                    sizes="160px"
                    className={`object-cover ${c.img === "/img/interior2.jpg" ? "object-[center_10%]" : ""}`}
                  />
                </div>
                <span className="absolute -right-6 -top-3 flex items-center gap-1 rounded-full bg-lime px-3 py-1.5 text-xs font-semibold text-ink shadow-lg">
                  ⌂ {c.price}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
