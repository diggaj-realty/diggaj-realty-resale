"use client";

import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import type { AuthUser } from "@/types/auth";

const MENU = [
  { label: "Home", href: "/" },
  { label: "Listings", href: "/listings" },
  { label: "Buy", href: "/#buy-sell" },
  { label: "Sell", href: "/#buy-sell" },
  { label: "FAQ", href: "/#faq" },
  { label: "Contact", href: "/contact" },
];

export default function NavMobileMenu({
  open,
  onClose,
  user,
  loading,
  dashboardHref,
}: {
  open: boolean;
  onClose: () => void;
  user: AuthUser | null;
  loading: boolean;
  dashboardHref: string;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          // Lenis swallows wheel events document-wide, so without this the
          // drawer's own scrolling silently scrolls the page behind it instead.
          // Lenis checks the whole composedPath, so one attribute on the
          // overlay root covers every child.
          data-lenis-prevent
          className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
            onClick={(e) => e.stopPropagation()}
            // overflow-y-auto: the drawer is h-full but its content (nav links +
            // account block) is taller than a short laptop viewport, so it needs
            // its own scroll rather than being clipped.
            className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col overflow-y-auto overscroll-contain bg-panel p-8 text-white md:p-12"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Image
                  src="/logo.png"
                  alt="Diggaj Realty Logo"
                  width={32}
                  height={32}
                  className="h-8 w-8 rounded-lg object-contain"
                />
                <span className="text-lg font-semibold tracking-tight">
                  Diggaj Realty
                </span>
              </div>
              <button
                onClick={onClose}
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
                    onClick={onClose}
                    className="group flex items-center justify-between border-b border-white/10 py-4 text-2xl font-medium tracking-[-0.02em] transition-colors hover:text-lime"
                  >
                    {item.label}
                    <span className="text-lime opacity-0 transition-opacity group-hover:opacity-100">
                      →
                    </span>
                  </Link>
                </motion.div>
              ))}
              {!loading && (
                <motion.div
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 + MENU.length * 0.06, duration: 0.4 }}
                >
                  <Link
                    href={dashboardHref}
                    onClick={onClose}
                    className="group flex items-center justify-between border-b border-white/10 py-4 text-2xl font-medium tracking-[-0.02em] text-lime transition-colors hover:text-white"
                  >
                    {user ? "Dashboard" : "Login"}
                    <span className="opacity-0 transition-opacity group-hover:opacity-100">→</span>
                  </Link>
                </motion.div>
              )}
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
                <p className="text-xs text-white/50">Replies within a few hours</p>
              </div>
              <Link
                href="/contact"
                onClick={onClose}
                className="ml-auto rounded-full bg-lime px-4 py-2 text-xs font-semibold text-ink"
              >
                Contact
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
