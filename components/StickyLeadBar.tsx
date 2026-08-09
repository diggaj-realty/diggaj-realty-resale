"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

/**
 * A dismissible sticky CTA that points at the page's own lead form.
 *
 * The microsites already had a mobile-only "From ₹X / Book now" bar; the main
 * site had nothing of the kind, so once a visitor scrolled past a section
 * there was no route to a form until the footer. This is the generalized
 * version: it stays out of the way until the visitor is demonstrably reading
 * (past `showAfter` of the page), then stays reachable from anywhere.
 *
 * Deliberately a link to an on-page form rather than a modal — an interstitial
 * that appears on scroll is exactly the pattern Google penalizes, and the
 * microsite popups already cover the interrupt case.
 */
export default function StickyLeadBar({
  label,
  cta = "Enquire now",
  href = "#lead",
  storageKey,
  showAfter = 0.35,
}: {
  label: string;
  cta?: string;
  href?: string;
  /** sessionStorage key, so a dismissal sticks for the rest of the session. */
  storageKey: string;
  /** Fraction of scrollable height before it appears. */
  showAfter?: number;
}) {
  const [visible, setVisible] = useState(false);
  // Read lazily rather than in an effect: an effect would cascade a second
  // render, and there's no hydration mismatch to worry about because the bar
  // renders nothing until `visible` flips, which only ever happens on scroll.
  const [dismissed, setDismissed] = useState(
    () => typeof window !== "undefined" && sessionStorage.getItem(storageKey) === "1"
  );

  useEffect(() => {
    function onScroll() {
      const scrollable = document.body.scrollHeight - window.innerHeight;
      if (scrollable <= 0) return;
      setVisible(window.scrollY / scrollable > showAfter);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [showAfter]);

  function dismiss() {
    setDismissed(true);
    sessionStorage.setItem(storageKey, "1");
  }

  return (
    <AnimatePresence>
      {visible && !dismissed && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed inset-x-3 bottom-3 z-40 flex items-center gap-4 rounded-full bg-panel/95 px-5 py-3 shadow-2xl ring-1 ring-white/10 backdrop-blur md:inset-x-auto md:left-1/2 md:w-auto md:-translate-x-1/2 md:px-6"
        >
          <span className="min-w-0 flex-1 truncate text-xs text-white/70 md:flex-none md:text-sm">
            {label}
          </span>
          <a
            href={href}
            className="shrink-0 rounded-full bg-lime px-5 py-2.5 text-xs font-semibold text-ink transition-transform hover:-translate-y-px md:text-sm"
          >
            {cta}
          </a>
          <button
            type="button"
            onClick={dismiss}
            aria-label="Dismiss"
            className="shrink-0 text-lg leading-none text-white/40 transition-colors hover:text-white"
          >
            ✕
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
