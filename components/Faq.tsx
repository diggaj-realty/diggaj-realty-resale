"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const FAQS = [
  {
    q: "How does the cash back actually work?",
    a: "When you buy, sell, or finance with Diggaj Realty, we share our commission with you. Bundle multiple services and your cash back stacks — up to 75% of the buyer's agent commission back at closing, an average of ₹5 Lakh.",
  },
  {
    q: "Is there any cost to use Diggaj Realty?",
    a: "No. Our platform is free to browse and use. You only ever pay standard closing costs for the services you choose — there are no hidden fees or subscriptions.",
  },
  {
    q: "When do I receive my cash back?",
    a: "Your cash back is applied directly at closing, reducing what you owe out of pocket. In most states we can also issue it as a check shortly after the transaction completes.",
  },
  {
    q: "Can I use my own agent or lender?",
    a: "Absolutely. Diggaj Realty works great end-to-end, but you're always free to bring your own agent, lender, or title company — you'll just unlock less of the bundled cash back.",
  },
  {
    q: "Which states and cities are supported?",
    a: "We currently operate in most major Indian metros and are expanding every quarter. Search any address on our map — if we're live there, you'll see local listings and agents instantly.",
  },
  {
    q: "How do I get started?",
    a: "Create a free account, tell us what you're looking for, and we'll match you with a top local agent and lender. From tour to close, everything happens in one place.",
  },
];

function FaqItem({
  q,
  a,
  i,
  open,
  onToggle,
}: {
  q: string;
  a: string;
  i: number;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: 0.55, delay: 0.06 * i, ease: [0.25, 0.1, 0.25, 1] }}
      className="border-b border-white/10"
    >
      <button
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-6 py-6 text-left"
      >
        <span
          className={`flex items-baseline gap-3 text-base font-medium tracking-[-0.01em] transition-colors duration-200 md:text-xl ${
            open ? "text-lime" : "text-white"
          }`}
        >
          <span className="text-xs font-semibold text-white/30">
            0{i + 1}
          </span>
          {q}
        </span>
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors duration-200 ${
            open ? "bg-lime" : "bg-white/10"
          }`}
        >
          <motion.span
            animate={{ rotate: open ? 135 : 0 }}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            className={`text-lg leading-none ${open ? "text-ink" : "text-white"}`}
          >
            +
          </motion.span>
        </span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
            className="overflow-hidden"
          >
            <p className="max-w-xl pb-7 pl-7 text-sm leading-relaxed text-white/60">
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="bg-white px-3 py-3">
      <div className="relative overflow-clip rounded-[28px] bg-panel px-8 py-16 text-white md:px-14 md:py-20">
        {/* ambient lime glow */}
        <div className="pointer-events-none absolute -right-[15%] top-[-10%] h-[70vh] w-[70vh] rounded-full bg-[radial-gradient(circle,rgba(205,234,111,0.14)_0%,rgba(205,234,111,0.05)_45%,transparent_70%)]" />

        <div className="relative grid gap-14 md:grid-cols-[1fr_1.3fr] md:gap-10">
          {/* left: heading + floating image + support CTA */}
          <div className="flex flex-col">
            <motion.h2
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: 0.6 }}
              className="text-4xl font-medium tracking-[-0.02em] md:text-5xl"
            >
              Questions?
              <br />
              We&apos;ve got answers.
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="mt-4 max-w-xs text-sm leading-relaxed text-white/60"
            >
              Everything you need to know about buying, selling, and saving
              with Diggaj Realty.
            </motion.p>

            {/* floating tilted agent card, echoes ValueProp / HowItWorks pins */}
            <motion.div
              initial={{ opacity: 0, y: 24, rotate: -4 }}
              whileInView={{ opacity: 1, y: 0, rotate: -4 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="mt-10 flex w-fit items-center gap-3 rounded-2xl bg-white p-3 pr-5 shadow-2xl md:mt-14"
            >
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full">
                <Image
                  src="/img/agent-avatar.jpg"
                  alt="Support agent"
                  fill
                  sizes="48px"
                  className="object-cover"
                />
              </div>
              <div>
                <p className="text-xs font-semibold text-ink">
                  Still stuck? Ask a human.
                </p>
                <p className="text-[11px] text-ink/50">Replies in a few hours</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: 0.6, delay: 0.35 }}
              className="mt-6 w-fit"
            >
              <Link href="/contact" className="inline-block rounded-full bg-lime px-6 py-3 text-sm font-semibold text-ink">
                Contact us →
              </Link>
            </motion.div>
          </div>

          {/* right: accordion */}
          <div className="min-w-0 border-t border-white/10">
            {FAQS.map((item, i) => (
              <FaqItem
                key={item.q}
                q={item.q}
                a={item.a}
                i={i}
                open={openIndex === i}
                onToggle={() => setOpenIndex((v) => (v === i ? null : i))}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
