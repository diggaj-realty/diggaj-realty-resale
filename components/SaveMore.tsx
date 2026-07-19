"use client";

import Image from "next/image";
import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  type MotionValue,
} from "framer-motion";

const TIERS = [
  {
    n: "01",
    title: "Buy with Diggaj Realty",
    body: "Purchase your home through our agents and get 25% of the buyer's agent commission back at closing.",
    tag: "Realty",
    img: "/img/villa.jpg",
  },
  {
    n: "02",
    title: "Add Mortgage Services",
    body: "Finance through us too and your cash back doubles — one team for the whole journey.",
    tag: "+ Mortgage",
    img: "/img/skyline.jpg",
  },
  {
    n: "03",
    title: "Close with Title Services",
    body: "Bundle everything and unlock the maximum reward — an average of $8,000 back in your pocket.",
    tag: "+ Title",
    img: "/img/agent.jpg",
  },
];

// each tier owns a window of the scroll story
const WINDOWS: [number, number][] = [
  [0.02, 0.36],
  [0.36, 0.68],
  [0.68, 1],
];

function TierCard({
  progress,
  window: [a, b],
  last,
  tier,
}: {
  progress: MotionValue<number>;
  window: [number, number];
  last: boolean;
  tier: (typeof TIERS)[number];
}) {
  const inPad = (b - a) * 0.22;
  const opacity = useTransform(
    progress,
    last ? [a, a + inPad] : [a, a + inPad, b - inPad, b],
    last ? [0, 1] : [0, 1, 1, 0]
  );
  const y = useTransform(
    progress,
    last ? [a, a + inPad] : [a, a + inPad, b - inPad, b],
    last ? [70, 0] : [70, 0, 0, -70]
  );
  const rotate = useTransform(
    progress,
    last ? [a, a + inPad] : [a, a + inPad, b - inPad, b],
    last ? [3, 0] : [3, 0, 0, -3]
  );

  return (
    <div className="absolute inset-x-0 top-1/2 -translate-y-1/2">
      <motion.div
        style={{ opacity, y, rotate }}
        className="overflow-hidden rounded-[24px] bg-white shadow-2xl will-change-transform"
      >
        <div className="relative h-44 md:h-52">
          <Image src={tier.img} alt="" fill sizes="380px" className="object-cover" />
          <span className="absolute left-4 top-4 rounded-full bg-lime px-3 py-1.5 text-xs font-semibold text-ink shadow">
            {tier.tag}
          </span>
          <span className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-panel/80 text-xs font-semibold text-white">
            {tier.n}
          </span>
        </div>
        <div className="p-6">
          <p className="text-lg font-semibold text-ink">{tier.title}</p>
          <p className="mt-2 text-sm leading-relaxed text-body">{tier.body}</p>
        </div>
      </motion.div>
    </div>
  );
}

export default function SaveMore() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  // the headline number climbs 25 → 50 → 75 in steps, softened by a spring
  const rawPct = useTransform(scrollYProgress, [0.08, 0.34, 0.4, 0.66, 0.72, 1], [25, 25, 50, 50, 75, 75]);
  const springPct = useSpring(rawPct, { stiffness: 90, damping: 18 });
  const pctText = useTransform(springPct, (v) => `${Math.round(v)}`);

  // progress rail fill
  const railScale = useTransform(scrollYProgress, [0.05, 0.95], [0, 1]);

  // ambient glow breathes with the story
  const glowScale = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1.15, 0.95]);

  const subline = useTransform(springPct, (v): string =>
    v < 42 ? "with Diggaj Realty" : v < 68 ? "adding Mortgage" : "with the full bundle"
  );

  return (
    <section ref={ref} className="relative h-[320vh] bg-white">
      <div className="sticky top-0 h-screen px-3 py-3">
        <div className="relative h-full overflow-clip rounded-[28px] bg-panel text-white">
          {/* ambient lime glow behind the number */}
          <motion.div
            style={{ scale: glowScale }}
            className="pointer-events-none absolute -left-[10%] top-1/2 h-[110vh] w-[110vh] -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(205,234,111,0.14)_0%,rgba(205,234,111,0.05)_45%,transparent_70%)] will-change-transform"
          />

          {/* heading */}
          <div className="relative z-10 pt-14 text-center">
            <motion.h2
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: 0.6 }}
              className="text-4xl font-medium tracking-[-0.02em] md:text-5xl"
            >
              Save more
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="mx-auto mt-3 max-w-xs text-sm text-white/60"
            >
              Stack our services — watch your commission cash back climb
            </motion.p>
          </div>

          {/* progress rail */}
          <div className="absolute left-8 top-1/2 z-10 hidden h-56 w-px -translate-y-1/2 bg-white/15 md:block">
            <motion.div
              style={{ scaleY: railScale, transformOrigin: "top" }}
              className="h-full w-full bg-lime"
            />
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="absolute -left-[11px] flex h-6 w-6 items-center justify-center rounded-full bg-panel text-[9px] font-semibold text-white/70 ring-1 ring-white/20"
                style={{ top: `${i * 50 - 4}%` }}
              >
                0{i + 1}
              </span>
            ))}
          </div>

          {/* stage */}
          <div className="relative z-10 mx-auto flex h-[calc(100%-180px)] max-w-6xl items-center gap-8 px-8 md:px-16">
            {/* giant counting percentage */}
            <div className="flex-1">
              <div className="flex items-start leading-none">
                <motion.span className="text-[26vw] font-medium tracking-[-0.05em] text-lime md:text-[15rem]">
                  {pctText}
                </motion.span>
                <span className="mt-4 text-[8vw] font-medium text-lime md:mt-8 md:text-7xl">%</span>
              </div>
              <p className="mt-2 text-lg text-white/80 md:text-2xl">
                commission back{" "}
                <motion.span className="text-lime">{subline}</motion.span>
              </p>
              <div className="mt-6 flex items-center gap-3">
                <span className="rounded-full bg-lime px-4 py-2 text-xs font-semibold text-ink shadow-lg">
                  ⌂ Avg. $8,000 back
                </span>
                <span className="rounded-full bg-white/10 px-4 py-2 text-xs text-white/80 ring-1 ring-white/15">
                  Paid at closing
                </span>
              </div>
            </div>

            {/* swapping tier cards */}
            <div className="relative hidden h-full w-[380px] shrink-0 md:block">
              {TIERS.map((t, i) => (
                <TierCard
                  key={t.n}
                  progress={scrollYProgress}
                  window={WINDOWS[i]}
                  last={i === TIERS.length - 1}
                  tier={t}
                />
              ))}
            </div>
          </div>

          {/* drifting lime badges */}
          <div className="drift absolute right-[8%] top-[16%] z-10 hidden md:block" style={{ animationDelay: "1s" }}>
            <span className="rounded-full bg-white/10 px-4 py-2 text-xs text-white/80 ring-1 ring-white/15">
              💰 Cash back
            </span>
          </div>
          <div className="drift absolute bottom-[10%] left-[14%] z-10 hidden md:block" style={{ animationDelay: "3s" }}>
            <span className="rounded-full bg-lime px-4 py-2 text-xs font-semibold text-ink shadow-lg">
              ✓ No hidden fees
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
