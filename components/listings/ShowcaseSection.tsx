"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { propertyHref } from "@/lib/slug";
import { isElite } from "@/lib/badge";
import GatedPrice from "@/components/listings/GatedPrice";
import type { Property } from "@/types/api";

function Card({ home }: { home: Property }) {
  const cover = home.photos[0]?.url;
  const elite = isElite(home);
  const meta = `${home.bhk ?? "—"} bed · ${home.bathrooms ?? "—"} bath · ${home.areaSqft.toLocaleString("en-IN")} sqft`;

  return (
    <Link
      href={propertyHref(home)}
      className="group relative block h-[56vh] w-[78vw] shrink-0 overflow-hidden rounded-[24px] bg-cream md:h-[62vh] md:w-[460px]"
    >
      {cover ? (
        <Image
          src={cover}
          alt={home.title}
          fill
          sizes="(max-width: 768px) 78vw, 460px"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-sm text-body">
          No photo yet
        </div>
      )}
      <div className="absolute right-4 top-4 flex items-center gap-2">
        {elite && (
          <span className="rounded-full bg-panel px-3 py-1.5 text-xs font-semibold text-lime shadow ring-1 ring-lime/30">
            ✦ Elite
          </span>
        )}
        <div
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <GatedPrice property={home} variant="chip" className="text-xs font-semibold text-ink" />
        </div>
      </div>
      {home.videoUrl && (
        <span className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full bg-black/55 px-3 py-1.5 text-xs font-medium text-white backdrop-blur">
          ▶ Video
        </span>
      )}
      {/* bottom gradient + copy */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent p-6 pt-16 text-white">
        <p className="text-xl font-medium tracking-[-0.01em]">{home.title}</p>
        <p className="mt-1 text-xs text-white/75">{meta}</p>
      </div>
    </Link>
  );
}

export default function ShowcaseSection({ homes }: { homes: Property[] }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  // the track glides left as you scroll down — scrubbed and reversible
  const x = useTransform(scrollYProgress, [0.05, 0.95], ["0%", "-58%"]);
  const counter = useTransform(scrollYProgress, (v) =>
    String(Math.min(homes.length, Math.max(1, Math.ceil(v * homes.length)))).padStart(2, "0")
  );
  const barScale = useTransform(scrollYProgress, [0.05, 0.95], [0, 1]);

  return (
    <section ref={ref} className="relative h-[300vh] bg-cream">
      <div className="sticky top-0 flex h-screen flex-col justify-center overflow-clip">
        {/* track */}
        <motion.div
          style={{ x }}
          className="flex w-max items-center gap-7 pl-8 will-change-transform md:pl-14"
        >
          {/* intro block rides the track */}
          <div className="w-[70vw] shrink-0 pr-6 md:w-96">
            <motion.h2
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: 0.6 }}
              className="text-4xl font-medium tracking-[-0.02em] md:text-6xl"
            >
              Homes worth the scroll
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="mt-5 max-w-xs text-sm leading-relaxed text-body"
            >
              A hand-picked strip of standout architecture — keep scrolling and
              the collection glides by.
            </motion.p>
            <motion.span
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-8 inline-block rounded-full bg-panel px-5 py-2.5 text-xs text-white"
            >
              Scroll →
            </motion.span>
          </div>

          {homes.map((h) => (
            <Card key={h.id} home={h} />
          ))}

          {/* end cap: nudge to listings */}
          <div className="flex h-[56vh] w-64 shrink-0 items-center justify-center md:h-[62vh]">
            <Link href="/listings" className="rounded-full bg-lime px-6 py-3 text-sm font-semibold text-ink shadow-lg">
              View all homes →
            </Link>
          </div>
        </motion.div>

        {/* progress + counter */}
        <div className="absolute bottom-10 left-8 flex items-center gap-4 md:left-14">
          <span className="flex items-baseline text-sm font-medium tabular-nums">
            <motion.span>{counter}</motion.span>
            <span className="text-ink/40">&nbsp;/&nbsp;{String(homes.length).padStart(2, "0")}</span>
          </span>
          <div className="h-px w-40 bg-ink/15">
            <motion.div
              style={{ scaleX: barScale, transformOrigin: "left" }}
              className="h-full bg-ink"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
