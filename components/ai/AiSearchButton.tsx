"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { SparkleIcon, CloseIcon } from "@/components/dashboard/icons";
import type { AiPropertyContext } from "@/types/ai";

const AiSearchPanel = dynamic(() => import("@/components/ai/AiSearchPanel"), { ssr: false });

const GREETING_SEEN_KEY = "diggaj_ai_greeting_seen";
const GREETING_SHOW_DELAY_MS = 1500;
const GREETING_AUTO_HIDE_MS = 10000;

export default function AiSearchButton({
  floating = false,
  propertyContext,
}: {
  floating?: boolean;
  propertyContext?: AiPropertyContext;
}) {
  const [open, setOpen] = useState(false);
  const [showGreeting, setShowGreeting] = useState(false);

  // Once per browser session (not every page navigation), whichever variant
  // of this button mounts first — header pill or the home page's floating
  // circle — surfaces a dismissible greeting so first-time visitors notice
  // the AI assistant exists at all, rather than relying on them spotting a
  // small button on their own.
  useEffect(() => {
    if (sessionStorage.getItem(GREETING_SEEN_KEY)) return;
    const showTimer = setTimeout(() => {
      sessionStorage.setItem(GREETING_SEEN_KEY, "1");
      setShowGreeting(true);
    }, GREETING_SHOW_DELAY_MS);
    return () => clearTimeout(showTimer);
  }, []);

  useEffect(() => {
    if (!showGreeting) return;
    const hideTimer = setTimeout(() => setShowGreeting(false), GREETING_AUTO_HIDE_MS);
    return () => clearTimeout(hideTimer);
  }, [showGreeting]);

  function openPanel() {
    setShowGreeting(false);
    setOpen(true);
  }

  return (
    <div className={floating ? undefined : "relative w-full"}>
      {showGreeting && (
        <div
          className={
            floating
              ? "fixed bottom-24 right-6 z-40 w-72"
              : "absolute right-0 top-full z-40 mt-3 w-72"
          }
        >
          <div className="relative overflow-hidden rounded-2xl bg-panel p-4 pr-8 shadow-2xl ring-1 ring-white/10">
            {/* tail — a rotated square tucked behind the card's edge,
                pointing at whichever button this bubble belongs to */}
            <div
              className={
                floating
                  ? "absolute -bottom-1.5 right-7 h-3 w-3 rotate-45 bg-panel ring-1 ring-white/10"
                  : "absolute -top-1.5 right-7 h-3 w-3 rotate-45 bg-panel ring-1 ring-white/10"
              }
            />
            {/* ambient glow, echoes the header pill's lime accent */}
            <div className="pointer-events-none absolute -left-6 -top-8 h-24 w-24 rounded-full bg-lime/20 blur-2xl" />

            <button
              onClick={() => setShowGreeting(false)}
              aria-label="Dismiss"
              className="absolute right-2 top-2 z-10 flex h-6 w-6 items-center justify-center rounded-full text-white/40 hover:bg-white/10 hover:text-white"
            >
              <CloseIcon className="h-3.5 w-3.5" />
            </button>

            <button onClick={openPanel} className="relative z-10 flex w-full items-start gap-3 text-left">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-lime text-ink">
                <SparkleIcon className="h-4 w-4" />
              </span>
              <span className="min-w-0">
                {propertyContext ? (
                  <>
                    <p className="text-sm font-medium text-white">Want the highlights?</p>
                    <p className="mt-1 text-xs leading-relaxed text-white/60">
                      Ask our smart assistant anything about this home — it answers in seconds. Powered by AI.
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-medium text-white">Need help finding a home?</p>
                    <p className="mt-1 text-xs leading-relaxed text-white/60">
                      Just tell us your city and budget — our smart assistant finds real listings in seconds. Powered by AI.
                    </p>
                  </>
                )}
                <span className="mt-2.5 inline-flex items-center gap-1 rounded-full bg-lime px-3 py-1.5 text-[11px] font-semibold text-ink">
                  Try it now →
                </span>
              </span>
            </button>
          </div>
        </div>
      )}
      <button
        onClick={openPanel}
        aria-label={floating ? "Get help finding a home" : "AI Search"}
        className={
          floating
            // A labelled pill, not a bare icon: a lone sparkle reads as an ad
            // to dismiss for users with no AI mental model. Words ("Get help")
            // say what it does; the dark-panel + lime + ring echoes the Elite
            // badge (ListingCard). No `relative` here — `fixed` itself is the
            // containing block for the absolute attention dot, and adding
            // `relative` would override `fixed` (Tailwind orders it later),
            // dropping the button out of the floating layer into page flow.
            ? "fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-panel px-5 py-3.5 text-sm font-semibold text-lime shadow-2xl ring-1 ring-lime/30 transition-transform hover:-translate-y-1"
            : // Quiet tertiary, full width. This was a solid dark pill, which
              // read as a third primary action next to "Make an offer" and gave
              // the stack no hierarchy at all.
              "w-full rounded-full bg-ink/5 px-5 py-3 text-sm font-medium text-ink ring-1 ring-ink/10 transition-colors hover:bg-ink/10"
        }
      >
        {floating ? (
          <>
            {/* Gentle attention cue — a quiet pulsing dot, not a timed popup.
                Stops animating under prefers-reduced-motion. */}
            <span className="pointer-events-none absolute -right-1 -top-1 flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-lime opacity-75 motion-reduce:hidden" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-lime ring-2 ring-panel" />
            </span>
            <SparkleIcon className="h-5 w-5" />
            Get help
          </>
        ) : propertyContext ? (
          "✦ Ask AI about this home"
        ) : (
          "✦ AI Search"
        )}
      </button>
      {open && <AiSearchPanel onClose={() => setOpen(false)} propertyContext={propertyContext} />}
    </div>
  );
}
