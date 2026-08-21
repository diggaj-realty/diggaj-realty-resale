"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";
import { loginHrefWithReturn } from "@/lib/auth/redirectIntent";

// Anonymous visitors get a short taste of the tour, then it locks — long
// enough to see it's a real video, short enough that the value is behind login.
const PREVIEW_SECONDS = 3;

function LockIcon({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

/**
 * Property video tour with a login gate. Logged-in buyers watch in full;
 * anonymous visitors get a ~3s preview, after which the video pauses, blurs,
 * and a "log in to keep watching" overlay takes over. The gate is enforced on
 * `timeupdate` (actual watched seconds, so it can't be skipped past by seeking)
 * rather than a wall-clock timer that would fire even while paused.
 */
export default function GatedVideo({ src, poster }: { src: string; poster?: string }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [previewUsed, setPreviewUsed] = useState(false);

  // Only gate once auth has resolved and there's genuinely no session. `locked`
  // is derived — if the session appears (e.g. logged in and came back), the
  // gate lifts on its own without an effect clearing state.
  const gated = !loading && !user;
  const locked = gated && previewUsed;

  function handleTimeUpdate() {
    if (!gated || previewUsed) return;
    const v = videoRef.current;
    if (v && v.currentTime >= PREVIEW_SECONDS) {
      v.pause();
      setPreviewUsed(true);
    }
  }

  return (
    <div className="relative overflow-hidden rounded-[24px] bg-black">
      <span className="absolute left-4 top-4 z-10 rounded-full bg-black/55 px-3.5 py-1.5 text-xs font-medium text-white backdrop-blur">
        ▶ Video tour
      </span>
      <video
        ref={videoRef}
        // Hide the native controls once locked so the preview can't be scrubbed
        // past the overlay.
        controls={!locked}
        poster={poster}
        onTimeUpdate={handleTimeUpdate}
        className={`aspect-video w-full transition duration-300 ${locked ? "scale-105 blur-lg" : ""}`}
      >
        <source src={src} />
      </video>

      {locked && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-black/50 px-6 text-center backdrop-blur-sm">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-lime text-ink">
            <LockIcon />
          </span>
          <p className="text-base font-medium text-white">Log in to watch the full tour</p>
          <p className="max-w-xs text-sm text-white/70">
            Video tours are for registered buyers — it&apos;s free to sign up.
          </p>
          <Link
            href={loginHrefWithReturn("/login", pathname)}
            className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-lime px-5 py-2.5 text-sm font-semibold text-ink transition-transform hover:-translate-y-px"
          >
            Log in to keep watching →
          </Link>
        </div>
      )}
    </div>
  );
}
