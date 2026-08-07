"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import LeadForm from "@/components/LeadForm";

const SESSION_KEY = "sobha-one-world-lead-popup-shown";

/** Fires once, 7s after the page mounts, and never again this session — same
 *  pattern as Brigade Granada's LeadPopup. */
export default function LeadPopup() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY)) return;
    const t = setTimeout(() => {
      setOpen(true);
      sessionStorage.setItem(SESSION_KEY, "1");
    }, 7000);
    return () => clearTimeout(t);
  }, []);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 px-4 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.25 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md rounded-[28px] bg-panel p-8"
          >
            <button
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/70 transition-colors hover:bg-white/20"
            >
              ✕
            </button>

            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-lime">
              Before you go
            </span>
            <h2 className="mt-3 text-xl font-medium tracking-[-0.02em] text-white">
              Get the Sobha One World price sheet
            </h2>
            <p className="mt-3 text-sm text-white/60">
              Leave your details and an agent will send configurations, pricing and the payment
              plan.
            </p>

            <div className="mt-7">
              <LeadForm
                dark
                subject="Sobha One World: popup enquiry"
                cta="Send me the details"
                endpoint="/api/leads/sobha-one-world-hoskote"
                requirePhone
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
