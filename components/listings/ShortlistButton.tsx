"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { hasRole } from "@/lib/auth/roles";
import { authedSend } from "@/lib/api/authed";
import { getShortlist } from "@/lib/api/buyer";

export default function ShortlistButton({ propertyId }: { propertyId: string }) {
  const { user, token } = useAuth();
  const router = useRouter();
  const isBuyer = hasRole(user, "BUYER");
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  // hydrate current membership for logged-in buyers
  useEffect(() => {
    if (!isBuyer || !token) return;
    getShortlist(token)
      .then((r) => setSaved(r.items.some((p) => p.id === propertyId)))
      .catch(() => {});
  }, [isBuyer, token, propertyId]);

  async function toggle() {
    if (!isBuyer || !token) {
      router.push("/login/buyer");
      return;
    }
    setBusy(true);
    const next = !saved;
    setSaved(next); // optimistic
    try {
      await authedSend(`/shortlists${next ? "" : `/${propertyId}`}`, token, {
        method: next ? "POST" : "DELETE",
        body: next ? { propertyId } : undefined,
      });
    } catch {
      setSaved(!next); // revert
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={busy}
      aria-pressed={saved}
      aria-label={isBuyer ? (saved ? "Saved" : "Save") : "Save to shortlist"}
      className={`inline-flex h-11 w-11 items-center justify-center gap-2 rounded-full ring-1 transition-colors disabled:opacity-60 sm:h-auto sm:w-auto sm:px-5 sm:py-2.5 sm:text-sm sm:font-medium ${
        saved
          ? "bg-lime text-ink ring-lime"
          : "bg-white text-ink ring-ink/15 hover:bg-cream"
      }`}
    >
      <svg
        width="16" height="16" viewBox="0 0 24 24"
        fill={saved ? "currentColor" : "none"}
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden
      >
        <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z" />
      </svg>
      <span className="hidden sm:inline">{isBuyer ? (saved ? "Saved" : "Save") : "Save to shortlist"}</span>
    </button>
  );
}
