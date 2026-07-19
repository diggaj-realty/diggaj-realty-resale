"use client";

import Image from "next/image";
import { motion } from "framer-motion";

const LISTINGS = [
  {
    img: "/img/villa.jpg",
    title: "The Pinnacle at Highland Park",
    price: "$897,000",
    address: "123 Maple Street, New York",
    beds: 5,
    baths: 2,
    badge: "For Sale",
  },
  {
    img: "/img/listing-aframe.jpg",
    title: "Birchwood A-Frame Retreat",
    price: "$649,900",
    address: "789 Forest Lane, Denver, CO",
    beds: 3,
    baths: 2,
    badge: "For Sale",
  },
  {
    img: "/img/hero-house.jpg",
    title: "The Meadow Longhouse",
    price: "$1,299,900",
    address: "123 Serenity Drive, Austin, TX",
    beds: 5,
    baths: 3,
    badge: "For Sale",
  },
  {
    img: "/img/house2.jpg",
    title: "Aurora Ridge Residence",
    price: "$2,490,000",
    address: "42 Hillside Court, Seattle, WA",
    beds: 6,
    baths: 4,
    badge: "New",
  },
  {
    img: "/img/footer-house.jpg",
    title: "Fernwood Valley Estate",
    price: "$1,150,000",
    address: "17 Riverbend Road, Portland, OR",
    beds: 4,
    baths: 3,
    badge: "For Sale",
  },
  {
    img: "/img/listing-woods.jpg",
    title: "The Gable House",
    price: "$785,500",
    address: "5 Cedar Hollow, Boulder, CO",
    beds: 4,
    baths: 2,
    badge: "For Sale",
  },
];

function BedIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M2 11V5a1 1 0 0 1 1-1h18a1 1 0 0 1 1 1v6" />
      <path d="M2 11h20v7" />
      <path d="M2 11v7" />
      <path d="M6 8h5v3" />
    </svg>
  );
}

function BathIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M4 12h16a1 1 0 0 1 1 1 6 6 0 0 1-6 6H9a6 6 0 0 1-6-6 1 1 0 0 1 1-1Z" />
      <path d="M5 12V5a2 2 0 0 1 4 0" />
    </svg>
  );
}

const rise = {
  hidden: { opacity: 0, y: 28 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay: 0.08 * i, ease: [0.25, 0.1, 0.25, 1] as const },
  }),
};

export default function Listings() {
  return (
    <section className="bg-white px-8 py-24 md:px-14">
      {/* header */}
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <motion.h2
            variants={rise}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.6 }}
            custom={0}
            className="text-4xl font-medium tracking-[-0.02em] md:text-5xl"
          >
            Featured Listings
          </motion.h2>
          <motion.p
            variants={rise}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.6 }}
            custom={1}
            className="mt-3 max-w-sm text-sm text-body"
          >
            Hand-picked homes on the market right now — every one eligible for
            commission cash back.
          </motion.p>
        </div>
        <motion.button
          variants={rise}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.6 }}
          custom={2}
          className="w-fit rounded-full bg-panel px-6 py-3 text-sm text-white"
        >
          View all homes →
        </motion.button>
      </div>

      {/* grid */}
      <div className="mt-14 grid gap-x-7 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
        {LISTINGS.map((l, i) => (
          <motion.article
            key={l.title}
            variants={rise}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.25 }}
            custom={i % 3}
            className="group cursor-pointer"
          >
            {/* image */}
            <div className="relative aspect-[10/9] overflow-hidden rounded-[20px]">
              <Image
                src={l.img}
                alt={l.title}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
              />
              <span
                className={`absolute left-4 top-4 rounded-full px-4 py-1.5 text-xs font-medium shadow ${
                  l.badge === "New" ? "bg-lime text-ink" : "bg-white text-ink"
                }`}
              >
                {l.badge}
              </span>
              {/* hover arrow chip */}
              <span className="absolute bottom-4 right-4 flex h-10 w-10 translate-y-3 items-center justify-center rounded-full bg-lime text-ink opacity-0 shadow-lg transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                ↗
              </span>
            </div>

            {/* meta */}
            <div className="mt-4 flex items-center gap-2 text-xs text-body">
              <span className="flex items-center gap-1.5">
                <BedIcon /> {l.beds} Bedrooms
              </span>
              <span className="text-ink/25">·</span>
              <span className="flex items-center gap-1.5">
                <BathIcon /> {l.baths} Bathroom
              </span>
            </div>

            <h3 className="mt-2 text-2xl font-medium tracking-[-0.02em] transition-colors duration-300 group-hover:text-ink/70">
              {l.title}
            </h3>

            <p className="mt-1.5 text-sm">
              <span className="font-semibold">{l.price}</span>
              <span className="mx-2 text-ink/25">·</span>
              <span className="text-body">{l.address}</span>
            </p>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
