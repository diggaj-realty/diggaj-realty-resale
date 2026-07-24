"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth/AuthContext";

const CHECK = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

function Checklist({ items, dark }: { items: string[]; dark?: boolean }) {
  return (
    <ul className="mt-6 space-y-3">
      {items.map((item, i) => (
        <motion.li
          key={item}
          initial={{ opacity: 0, x: -12 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.45, delay: 0.35 + i * 0.12 }}
          className={`flex items-center gap-3 text-sm ${dark ? "text-white/80" : "text-ink/75"}`}
        >
          <span
            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
              dark ? "bg-lime text-ink" : "bg-panel text-white"
            }`}
          >
            {CHECK}
          </span>
          {item}
        </motion.li>
      ))}
    </ul>
  );
}

export default function BuySell() {
  const { user } = useAuth();
  const buyerLoggedIn = user?.role === "BUYER";
  const sellerLoggedIn = user?.role === "SELLER";
  const buyerHref = buyerLoggedIn ? "/dashboard/buyer" : "/login/buyer";
  const sellerHref = sellerLoggedIn ? "/dashboard/seller" : "/login/seller";

  return (
    <section id="buy-sell" className="bg-white px-8 py-24 md:px-14">
      {/* header */}
      <div className="text-center">
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.6 }}
          className="text-4xl font-medium tracking-[-0.02em] md:text-5xl"
        >
          Built for both sides of the deal
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mx-auto mt-4 max-w-md text-sm text-body"
        >
          Whether you&apos;re finding your next home or selling your current
          one, Diggaj Realty backs you with the same smart tools and rewards.
        </motion.p>
      </div>

      {/* split cards — expand slightly on hover */}
      <div className="mt-14 flex flex-col gap-6 md:h-[540px] md:flex-row">
        {/* buyers */}
        <motion.div
          initial={{ opacity: 0, x: -48 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.65, ease: [0.25, 0.1, 0.25, 1] }}
          className="group relative flex-1 overflow-hidden rounded-[28px] bg-limepale transition-[flex-grow] duration-500 ease-out md:hover:flex-[1.35]"
        >
          <div className="relative z-10 flex h-full flex-col p-9 md:p-11">
            <span className="w-fit rounded-full bg-panel px-4 py-1.5 text-xs font-medium text-white">
              For Buyers
            </span>
            <h3 className="mt-5 max-w-sm text-3xl font-medium leading-snug tracking-[-0.02em] md:text-4xl">
              Find it, tour it, own it
            </h3>
            <Checklist
              items={[
                "AI-matched listings tuned to your taste",
                "Book home tours instantly, no phone tag",
                "Up to 75% of agent commission back",
              ]}
            />
            <div className="mt-auto flex flex-wrap items-center gap-x-5 gap-y-3 pt-8">
              <Link href="/listings" className="inline-block rounded-full bg-panel px-6 py-3 text-sm text-white">
                Start browsing →
              </Link>
              <Link href={buyerHref} className="text-sm font-medium text-ink underline underline-offset-4 hover:text-ink/70">
                {buyerLoggedIn ? "Go to your dashboard →" : "Buyer login →"}
              </Link>
            </div>
          </div>
          {/* image peeking from the corner */}
          <div className="absolute -bottom-10 -right-12 h-56 w-72 rotate-[-6deg] overflow-hidden rounded-[24px] shadow-2xl transition-transform duration-500 group-hover:rotate-[-2deg] group-hover:scale-[1.04] md:h-64 md:w-80">
            <Image src="/img/villa.jpg" alt="Home for buyers" fill sizes="320px" className="object-cover" />
            <span className="absolute left-4 top-4 rounded-full bg-white px-3 py-1.5 text-xs font-semibold shadow">
              ⌂ ₹8.9 Cr
            </span>
          </div>
        </motion.div>

        {/* sellers */}
        <motion.div
          initial={{ opacity: 0, x: 48 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.65, ease: [0.25, 0.1, 0.25, 1] }}
          className="group relative flex-1 overflow-hidden rounded-[28px] bg-panel text-white transition-[flex-grow] duration-500 ease-out md:hover:flex-[1.35]"
        >
          <div className="relative z-10 flex h-full flex-col p-9 md:p-11">
            <span className="w-fit rounded-full bg-lime px-4 py-1.5 text-xs font-semibold text-ink">
              For Sellers
            </span>
            <h3 className="mt-5 max-w-sm text-3xl font-medium leading-snug tracking-[-0.02em] md:text-4xl">
              List smarter, sell faster
            </h3>
            <Checklist
              dark
              items={[
                "AI pricing tuned to your neighborhood",
                "Your home featured to 10L+ active buyers",
                "One flat listing fee — no surprises",
              ]}
            />
            <div className="mt-auto flex flex-wrap items-center gap-x-5 gap-y-3 pt-8">
              <Link href="/contact" className="inline-block rounded-full bg-lime px-6 py-3 text-sm font-semibold text-ink">
                Get a free valuation →
              </Link>
              <Link href={sellerHref} className="text-sm font-medium text-lime underline underline-offset-4 hover:text-lime/70">
                {sellerLoggedIn ? "Go to your dashboard →" : "Seller login →"}
              </Link>
            </div>
          </div>
          {/* image peeking from the corner */}
          <div className="absolute -bottom-10 -right-12 h-56 w-72 rotate-[5deg] overflow-hidden rounded-[24px] shadow-2xl transition-transform duration-500 group-hover:rotate-[1deg] group-hover:scale-[1.04] md:h-64 md:w-80">
            <Image src="/img/footer-house.jpg" alt="Home for sellers" fill sizes="320px" className="object-cover" />
            <span className="absolute left-4 top-4 rounded-full bg-lime px-3 py-1.5 text-xs font-semibold text-ink shadow">
              ✓ Sold in 12 days
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
