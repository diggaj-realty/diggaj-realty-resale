"use client";

import Image from "next/image";
import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";

const SENTENCE =
  "Whether you're buying your first home, investing in your next one, or selling to move on, Diggaj Realty verifies every resale listing, negotiates on your behalf, and pays you back at closing.";

function Word({
  progress,
  range,
  children,
}: {
  progress: MotionValue<number>;
  range: [number, number];
  children: string;
}) {
  const opacity = useTransform(progress, range, [0.18, 1]);
  return <motion.span style={{ opacity }}>{children}</motion.span>;
}

const inView = {
  hidden: { opacity: 0, y: 20 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay: 0.2 * i, ease: [0.25, 0.1, 0.25, 1] as const },
  }),
};

export default function ValueProp() {
  const textRef = useRef<HTMLHeadingElement>(null);
  const { scrollYProgress } = useScroll({
    target: textRef,
    offset: ["start 0.85", "end 0.4"],
  });

  const words = SENTENCE.split(" ");

  return (
    <section className="bg-white px-8 py-24 md:px-14">
      <motion.span
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ duration: 0.5 }}
        className="mb-8 inline-block rounded-full bg-limepale px-4 py-1.5 text-xs font-semibold text-ink"
      >
        Why Diggaj Realty
      </motion.span>
      {/* scroll-scrubbed word-by-word reveal */}
      <h2
        ref={textRef}
        className="flex max-w-4xl flex-wrap gap-x-[0.28em] gap-y-1 text-feature font-medium tracking-[-0.02em] text-ink"
      >
        {words.map((word, i) => (
          <Word
            key={i}
            progress={scrollYProgress}
            range={[i / words.length, (i + 1) / words.length]}
          >
            {word}
          </Word>
        ))}
      </h2>

      <div className="mt-16 flex flex-col items-start gap-10 md:flex-row md:items-center">
        <motion.div
          variants={inView}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.5 }}
          custom={1}
          className="relative"
        >
          <div className="relative h-40 w-64 max-w-full overflow-hidden rounded-[48px]">
            <Image src="/img/interior-kitchen.jpg" alt="Interior" fill sizes="256px" className="object-cover" />
          </div>
          <span className="absolute -top-3 left-2 flex items-center gap-1.5 rounded-full bg-lime px-3 py-1.5 text-xs font-semibold shadow">
            <span>⌂</span> ₹1.2 Cr
          </span>
        </motion.div>

        <motion.div
          variants={inView}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.5 }}
          custom={2}
          className="relative"
        >
          <div className="relative h-40 w-64 max-w-full overflow-hidden rounded-[48px]">
            <Image src="/img/house2.jpg" alt="Modern home" fill sizes="256px" className="object-cover" />
          </div>
          <span className="absolute -bottom-3 left-8 rounded-full bg-panel px-3.5 py-1.5 text-xs font-medium text-white shadow">
            ▦ 10L+ properties
          </span>
        </motion.div>

        <motion.p
          variants={inView}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.5 }}
          custom={3}
          className="max-w-xs text-lead text-body"
        >
          Every listing is verified against real market comps and backed by
          a dedicated agent, with no juggling providers and no hidden fees at close.
        </motion.p>
      </div>
    </section>
  );
}
