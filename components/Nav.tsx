"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const MENU = [
  { label: "Home", href: "/" },
  { label: "Listings", href: "/listings" },
  { label: "Buy", href: "/#buy-sell" },
  { label: "Sell", href: "/#buy-sell" },
  { label: "FAQ", href: "/#faq" },
  { label: "Contact", href: "/contact" },
];

export default function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <nav className="relative z-30 flex items-center justify-between px-8 pt-7 md:px-14">
        <Link href="/" className="text-xl font-semibold tracking-tight text-ink">
          Diggaj Realty
        </Link>
        <div className="flex gap-3">
          <Link
            href="/contact"
            className="rounded-full bg-panel px-5 py-2.5 text-sm text-white transition-transform hover:-translate-y-px"
          >
            Get help
          </Link>
          <button
            onClick={() => setOpen(true)}
            className="rounded-full bg-white px-5 py-2.5 text-sm text-ink shadow-sm"
          >
            Menu <span className="ml-1 align-middle">⋮</span>
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-panel p-8 text-white md:p-12"
            >
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold tracking-tight">
                  Diggaj Realty
                </span>
                <button
                  onClick={() => setOpen(false)}
                  aria-label="Close menu"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-lg"
                >
                  ✕
                </button>
              </div>

              <div className="mt-14 flex flex-col gap-1">
                {MENU.map((item, i) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 + i * 0.06, duration: 0.4 }}
                  >
                    <Link
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className="group flex items-center justify-between border-b border-white/10 py-4 text-2xl font-medium tracking-[-0.02em] transition-colors hover:text-lime"
                    >
                      {item.label}
                      <span className="text-lime opacity-0 transition-opacity group-hover:opacity-100">
                        →
                      </span>
                    </Link>
                  </motion.div>
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.4 }}
                className="mt-auto flex items-center gap-3 rounded-2xl bg-white/5 p-4 ring-1 ring-white/10"
              >
                <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full">
                  <Image src="/img/agent-avatar.jpg" alt="Agent" fill sizes="44px" className="object-cover" />
                </div>
                <div>
                  <p className="text-sm font-medium">Talk to an agent</p>
                  <p className="text-xs text-white/50">Avg. ₹5L cash back</p>
                </div>
                <Link
                  href="/contact"
                  onClick={() => setOpen(false)}
                  className="ml-auto rounded-full bg-lime px-4 py-2 text-xs font-semibold text-ink"
                >
                  Contact
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
