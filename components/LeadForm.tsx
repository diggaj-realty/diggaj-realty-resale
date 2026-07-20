"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

// Static-site friendly: swap SIMULATE for a Formspree/Web3Forms endpoint
// (e.g. fetch("https://formspree.io/f/XXXX", {...})) to receive real emails.
const SIMULATE = true;

export default function LeadForm({
  dark,
  subject = "General inquiry",
  cta = "Send message",
}: {
  dark?: boolean;
  subject?: string;
  cta?: string;
}) {
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");

  const field = dark
    ? "w-full rounded-2xl bg-white/5 px-5 py-3.5 text-sm text-white ring-1 ring-white/10 placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-lime"
    : "w-full rounded-2xl bg-ink/5 px-5 py-3.5 text-sm text-ink ring-1 ring-ink/10 placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-lime";

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("sending");
    if (SIMULATE) {
      await new Promise((r) => setTimeout(r, 900));
    }
    setState("sent");
  }

  return (
    <div className="relative">
      <AnimatePresence mode="wait">
        {state === "sent" ? (
          <motion.div
            key="sent"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className={`flex flex-col items-center rounded-[24px] px-8 py-14 text-center ${
              dark ? "bg-white/5 ring-1 ring-white/10" : "bg-limepale"
            }`}
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-lime text-2xl text-ink">
              ✓
            </span>
            <p className={`mt-5 text-xl font-medium ${dark ? "text-white" : "text-ink"}`}>
              Message sent
            </p>
            <p className={`mt-2 max-w-xs text-sm ${dark ? "text-white/60" : "text-body"}`}>
              An agent will get back to you within a few hours. Keep an eye on
              your inbox.
            </p>
            <button
              onClick={() => setState("idle")}
              className={`mt-6 text-xs font-semibold underline underline-offset-4 ${
                dark ? "text-lime" : "text-ink"
              }`}
            >
              Send another
            </button>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.25 }}
            onSubmit={onSubmit}
            className="flex flex-col gap-3"
          >
            <input type="hidden" name="subject" value={subject} />
            <div className="grid gap-3 sm:grid-cols-2">
              <input required name="name" placeholder="Full name" className={field} />
              <input
                required
                name="email"
                type="email"
                placeholder="Email address"
                className={field}
              />
            </div>
            <input name="phone" type="tel" placeholder="Phone (optional)" className={field} />
            <textarea
              required
              name="message"
              rows={4}
              placeholder="Tell us what you're looking for…"
              defaultValue=""
              className={`${field} resize-none`}
            />
            <button
              type="submit"
              disabled={state === "sending"}
              className="mt-1 rounded-full bg-lime px-6 py-3.5 text-sm font-semibold text-ink disabled:opacity-60"
            >
              {state === "sending" ? "Sending…" : cta}
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
