"use client";

import { useId, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { submitLead } from "@/lib/api/leads";
import type { LeadInput } from "@/lib/api/leads";

/**
 * The site's single lead-capture form, used by /contact, the three project
 * microsites (both inline and in their popups) and the public marketing
 * surfaces.
 *
 * Two things this deliberately does that the first version didn't:
 *
 *  - Every field has a real <label>, not a placeholder standing in for one.
 *    A placeholder is not an accessible name, and it disappears the moment
 *    someone types — which on autofill means the user can no longer tell what
 *    is in which box. Placeholders here are hints only.
 *  - Fields are drawn at real contrast (solid fill, visible border) rather
 *    than a 5% tint on a 10% ring, which rendered as blank space on both the
 *    light and dark backgrounds and did not read as an input at all.
 *
 * `compact` drops the message textarea for tight placements (sticky bar,
 * listing sidebar). The API treats `message` as optional so those still post
 * cleanly; the full form keeps it required.
 */
export default function LeadForm({
  dark,
  subject = "General inquiry",
  cta = "Send message",
  endpoint = "/api/leads",
  requirePhone = false,
  compact = false,
  card = false,
  source,
}: {
  dark?: boolean;
  subject?: string;
  cta?: string;
  endpoint?: string;
  requirePhone?: boolean;
  /** Name + email + phone only, no message. For sidebars and sticky bars. */
  compact?: boolean;
  /** Wrap the form in its own panel. Off by default — the microsites already
   *  sit inside a dark panel and would otherwise be double-framed. */
  card?: boolean;
  /** Which surface this form is — reported to the lead email so placements
   *  can be compared against each other. */
  source?: string;
}) {
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [lastInput, setLastInput] = useState<LeadInput | null>(null);
  const uid = useId();

  // Solid fill and a border you can actually see. The old bg-ink/5 + ring-ink/10
  // sat ~2% off the page background.
  const field = dark
    ? "w-full rounded-2xl bg-white/10 px-5 py-3.5 text-sm text-white ring-1 ring-white/25 placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-lime"
    : "w-full rounded-2xl bg-white px-5 py-3.5 text-sm text-ink shadow-sm ring-1 ring-ink/15 placeholder:text-ink/45 focus:outline-none focus:ring-2 focus:ring-lime";

  const labelCls = `mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.1em] ${
    dark ? "text-white/70" : "text-ink/60"
  }`;

  const req = (
    <span aria-hidden className={dark ? "text-lime" : "text-ink/40"}>
      {" "}
      *
    </span>
  );

  async function send(input: LeadInput) {
    setState("sending");
    setError(null);
    try {
      await submitLead(input, endpoint);
      setLastInput(input);
      setState("sent");
    } catch (e) {
      setLastInput(input);
      setError(e instanceof Error ? e.message : "Failed to send message");
      setState("error");
    }
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    send({
      name: String(form.get("name") ?? "").trim(),
      email: String(form.get("email") ?? "").trim(),
      phone: String(form.get("phone") ?? "").trim() || undefined,
      message: String(form.get("message") ?? "").trim(),
      subject,
      source,
      page: typeof window !== "undefined" ? window.location.href : undefined,
      referrer: typeof document !== "undefined" ? document.referrer || undefined : undefined,
    });
  }

  function retry() {
    if (lastInput) send(lastInput);
  }

  const shell = card
    ? dark
      ? "rounded-[28px] bg-white/[0.07] p-6 ring-1 ring-white/15 sm:p-8"
      : "rounded-[28px] bg-white p-6 shadow-lg ring-1 ring-ink/10 sm:p-8"
    : "";

  return (
    <div className={`relative ${shell}`}>
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
            className="flex flex-col gap-4"
          >
            <input type="hidden" name="subject" value={subject} />

            {/* The failure banner sits above the form rather than replacing it.
                Swapping the whole form out hid the thing the user had just
                filled in, which made a transient network error feel like lost
                work. */}
            {state === "error" && (
              <div
                role="alert"
                className={`flex flex-col gap-3 rounded-2xl px-5 py-4 text-sm ${
                  dark
                    ? "bg-red-500/15 text-white ring-1 ring-red-400/40"
                    : "bg-red-50 text-ink ring-1 ring-red-200"
                }`}
              >
                <span>
                  <strong className="font-semibold">Couldn&apos;t send that.</strong> {error}
                </span>
                <button
                  type="button"
                  onClick={retry}
                  className="self-start rounded-full bg-lime px-4 py-2 text-xs font-semibold text-ink"
                >
                  Try again
                </button>
              </div>
            )}

            <div className={compact ? "flex flex-col gap-4" : "grid gap-4 sm:grid-cols-2"}>
              <div>
                <label htmlFor={`${uid}-name`} className={labelCls}>
                  Full name{req}
                </label>
                <input
                  required
                  id={`${uid}-name`}
                  name="name"
                  autoComplete="name"
                  placeholder="e.g. Rijan Rayamajhi"
                  defaultValue={lastInput?.name}
                  className={field}
                />
              </div>
              <div>
                <label htmlFor={`${uid}-email`} className={labelCls}>
                  Email address{req}
                </label>
                <input
                  required
                  id={`${uid}-email`}
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  defaultValue={lastInput?.email}
                  className={field}
                />
              </div>
            </div>

            <div>
              <label htmlFor={`${uid}-phone`} className={labelCls}>
                Phone number
                {requirePhone ? (
                  req
                ) : (
                  <span className={dark ? "text-white/40" : "text-ink/35"}> (optional)</span>
                )}
              </label>
              <input
                id={`${uid}-phone`}
                name="phone"
                type="tel"
                autoComplete="tel"
                required={requirePhone}
                placeholder="+91 98765 43210"
                defaultValue={lastInput?.phone}
                className={field}
              />
            </div>

            {!compact && (
              <div>
                <label htmlFor={`${uid}-message`} className={labelCls}>
                  What are you looking for?{req}
                </label>
                <textarea
                  required
                  id={`${uid}-message`}
                  name="message"
                  rows={4}
                  placeholder="Budget, preferred locality, timeline — anything that helps us shortlist."
                  defaultValue={lastInput?.message ?? ""}
                  className={`${field} resize-none`}
                />
              </div>
            )}

            <button
              type="submit"
              disabled={state === "sending"}
              className="mt-1 flex w-full items-center justify-center gap-2.5 rounded-full bg-lime px-6 py-4 text-sm font-semibold text-ink shadow-md transition-transform hover:-translate-y-px disabled:translate-y-0 disabled:opacity-60"
            >
              {state === "sending" && (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-ink/25 border-t-ink" />
              )}
              {state === "sending" ? "Sending…" : cta}
            </button>

            <p className={`text-xs ${dark ? "text-white/45" : "text-ink/45"}`}>
              No spam. We only use these details to respond to your enquiry.
            </p>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
