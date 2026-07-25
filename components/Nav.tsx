"use client";

import Link from "next/link";
import { useState } from "react";
import dynamic from "next/dynamic";
import { useAuth } from "@/lib/auth/AuthContext";
import NotificationBell from "@/components/notifications/NotificationBell";
import AiSearchButton from "@/components/ai/AiSearchButton";

// framer-motion (the drawer's slide/stagger animation) is only ever needed
// once someone actually opens the mobile menu, so it's dynamically imported
// and mounted for the first time on that click rather than shipped with
// every page load — see `mounted` below.
const NavMobileMenu = dynamic(() => import("@/components/NavMobileMenu"), { ssr: false });

export default function Nav({
  showActionButton = true,
}: {
  // The home page replaces this slot entirely with a floating AI button
  // elsewhere on the page (see HeroSection), so it hides both "Get help"
  // and the inline AI Search pill here rather than showing both at once.
  showActionButton?: boolean;
} = {}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { user, loading } = useAuth();
  const dashboardHref = user ? `/dashboard/${user.role.toLowerCase()}` : "/login";

  return (
    <>
      <nav className="relative z-30 flex items-center justify-between px-5 pt-7 md:px-14">
        <Link href="/" className="text-lg font-semibold tracking-tight text-ink md:text-xl">
          Diggaj Realty
        </Link>
        <div className="flex items-center gap-2 md:gap-3">
          {!loading && user && <NotificationBell />}
          {!loading && (
            <Link
              href={dashboardHref}
              className="hidden rounded-full bg-panel px-5 py-2.5 text-sm text-white transition-transform hover:-translate-y-px sm:inline-block"
            >
              {user ? "Dashboard" : "Login"}
            </Link>
          )}
          {/* Shown to everyone, not just logged-in users — anonymous
              visitors get a free preview of the chat before it asks them
              to sign in, so this can't be gated behind login. */}
          {showActionButton && !loading && <AiSearchButton />}
          <button
            onClick={() => {
              setMounted(true);
              setOpen(true);
            }}
            className="rounded-full bg-white px-4 py-2.5 text-sm text-ink shadow-sm md:px-5"
          >
            Menu <span className="ml-1 align-middle">⋮</span>
          </button>
        </div>
      </nav>

      {mounted && (
        <NavMobileMenu
          open={open}
          onClose={() => setOpen(false)}
          user={user}
          loading={loading}
          dashboardHref={dashboardHref}
        />
      )}
    </>
  );
}
