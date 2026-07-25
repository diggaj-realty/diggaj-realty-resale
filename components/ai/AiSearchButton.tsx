"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { SparkleIcon, CloseIcon } from "@/components/dashboard/icons";

const AiSearchPanel = dynamic(() => import("@/components/ai/AiSearchPanel"), { ssr: false });

const GREETING_SEEN_KEY = "diggaj_ai_greeting_seen";
const GREETING_SHOW_DELAY_MS = 1500;
const GREETING_AUTO_HIDE_MS = 10000;

export default function AiSearchButton({ floating = false }: { floating?: boolean }) {
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
    <div className={floating ? undefined : "relative"}>
      {showGreeting && (
        <div
          className={
            floating
              ? "fixed bottom-24 right-6 z-40 w-64"
              : "absolute right-0 top-full z-40 mt-3 w-64"
          }
        >
          <div className="relative rounded-2xl bg-white p-4 pr-8 shadow-2xl ring-1 ring-ink/10">
            {/* tail — a rotated square tucked behind the card's edge,
                pointing at whichever button this bubble belongs to */}
            <div
              className={
                floating
                  ? "absolute -bottom-1.5 right-7 h-3 w-3 rotate-45 bg-white ring-1 ring-ink/10"
                  : "absolute -top-1.5 right-7 h-3 w-3 rotate-45 bg-white ring-1 ring-ink/10"
              }
            />
            <button
              onClick={() => setShowGreeting(false)}
              aria-label="Dismiss"
              className="absolute right-2 top-2 z-10 flex h-6 w-6 items-center justify-center rounded-full text-ink/40 hover:bg-ink/5 hover:text-ink"
            >
              <CloseIcon className="h-3.5 w-3.5" />
            </button>
            <button onClick={openPanel} className="relative z-10 block w-full text-left">
              <p className="text-sm font-medium text-ink">👋 Looking for a home?</p>
              <p className="mt-1 text-xs text-body">Ask our AI — it searches real listings for you.</p>
            </button>
          </div>
        </div>
      )}
      <button
        onClick={openPanel}
        aria-label="AI Search"
        className={
          floating
            // Same dark-panel + lime + ring treatment as the Elite badge
            // (ListingCard), circular rather than a pill.
            ? "fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-panel text-lime shadow-2xl ring-1 ring-lime/30 transition-transform hover:-translate-y-1"
            : "rounded-full bg-panel px-4 py-2.5 text-sm text-white transition-transform hover:-translate-y-px md:px-5"
        }
      >
        {floating ? <SparkleIcon className="h-6 w-6" /> : "✦ AI Search"}
      </button>
      {open && <AiSearchPanel onClose={() => setOpen(false)} />}
    </div>
  );
}
