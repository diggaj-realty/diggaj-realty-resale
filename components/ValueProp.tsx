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
  "Diggaj Realty brings buying, selling, and financing together in one platform — making every home journey seamless, transparent, and rewarding.";

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
      {/* scroll-scrubbed word-by-word reveal */}
      <h2
        ref={textRef}
        className="flex max-w-4xl flex-wrap gap-x-[0.28em] gap-y-1 text-3xl font-medium leading-snug tracking-[-0.02em] text-ink md:text-[44px] md:leading-[1.25]"
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
          <div className="relative h-40 w-64 overflow-hidden rounded-[48px]">
            <Image src="/img/interior-kitchen.jpg" alt="Interior" fill sizes="256px" className="object-cover" />
          </div>
          <span className="absolute -top-3 left-2 flex items-center gap-1.5 rounded-full bg-lime px-3 py-1.5 text-xs font-semibold shadow">
            <span>⌂</span> $122,345
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
          <div className="relative h-40 w-64 overflow-hidden rounded-[48px]">
            <Image src="/img/house2.jpg" alt="Modern home" fill sizes="256px" className="object-cover" />
          </div>
          <span className="absolute -bottom-3 left-8 rounded-full bg-panel px-3.5 py-1.5 text-xs font-medium text-white shadow">
            ▦ 1M properties
          </span>
        </motion.div>

        <motion.p
          variants={inView}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.5 }}
          custom={3}
          className="max-w-xs text-sm leading-relaxed text-body"
        >
          Say goodbye to multiple providers and hidden fees. Close with
          confidence and maximize your investment.
        </motion.p>
      </div>
    </section>
  );
}
