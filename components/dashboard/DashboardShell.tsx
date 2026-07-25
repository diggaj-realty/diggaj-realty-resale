"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { authedGet } from "@/lib/api/authed";
import { Skeleton } from "@/components/Skeleton";
import NotificationBell from "@/components/notifications/NotificationBell";
import AccountMenu from "@/components/dashboard/AccountMenu";
import DashboardNavList from "@/components/dashboard/DashboardNavList";
import { DashboardSummaryProvider } from "@/components/dashboard/DashboardSummaryContext";
import { MenuIcon, CloseIcon } from "@/components/dashboard/icons";
import { BUYER_NAV, SELLER_NAV } from "@/lib/dashboard/nav";
import type { DashboardSummary } from "@/types/dashboard";
import type { UserRole } from "@/types/auth";

export default function DashboardShell({
  role,
  children,
}: {
  role: UserRole;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, token, loading } = useAuth();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const navItems = role === "BUYER" ? BUYER_NAV : SELLER_NAV;
  const currentLabel = navItems.find((i) => (i.exact ? pathname === i.href : pathname.startsWith(i.href)))?.label;

  useEffect(() => {
    if (loading) return;
    if (!user || !token) {
      router.replace(`/login/${role.toLowerCase()}`);
      return;
    }
    if (user.role !== role) {
      router.replace(`/dashboard/${user.role.toLowerCase()}`);
      return;
    }
    authedGet<DashboardSummary>("/dashboard", token)
      .then(setSummary)
      .catch((err) => setError(err.message ?? "Failed to load dashboard."));
  }, [loading, user, token, role, router]);

  // close the mobile drawer on route change — done during render (not an
  // effect) per react.dev's "adjusting state when a prop changes"
  const [lastPathname, setLastPathname] = useState(pathname);
  if (lastPathname !== pathname) {
    setLastPathname(pathname);
    if (drawerOpen) setDrawerOpen(false);
  }

  if (loading || (!error && !summary)) {
    return (
      <div className="flex min-h-screen bg-cream">
        <div className="hidden w-64 shrink-0 border-r border-ink/10 bg-white lg:block" />
        <div className="flex-1 px-5 py-8 lg:px-10 lg:py-10">
          <div className="mx-auto max-w-5xl">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="mt-2 h-8 w-64" />
            <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-ink/5">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="mt-3 h-7 w-12" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-screen w-full items-center justify-center bg-cream px-8">
        <p className="text-sm text-red-700">{error}</p>
      </main>
    );
  }

  return (
    <div className="flex min-h-screen bg-cream">
      {/* Desktop sidebar — pure navigation */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-ink/10 bg-white lg:flex">
        <Link href="/" className="px-6 pb-2 pt-6 text-lg font-semibold tracking-tight text-ink">
          Diggaj Realty
        </Link>
        <p className="px-6 pb-6 text-xs font-medium uppercase tracking-wide text-body">
          {role === "BUYER" ? "Buyer dashboard" : "Seller dashboard"}
        </p>
        <div className="flex-1 overflow-y-auto px-4">
          <DashboardNavList items={navItems} />
        </div>
      </aside>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            aria-label="Close menu"
            onClick={() => setDrawerOpen(false)}
            className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
          />
          <div className="absolute left-0 top-0 flex h-full w-72 max-w-[85vw] flex-col bg-white p-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold tracking-tight text-ink">Diggaj Realty</span>
              <button onClick={() => setDrawerOpen(false)} aria-label="Close menu" className="text-ink/50">
                <CloseIcon />
              </button>
            </div>
            <p className="mb-4 mt-1 text-xs font-medium uppercase tracking-wide text-body">
              {role === "BUYER" ? "Buyer dashboard" : "Seller dashboard"}
            </p>
            <DashboardNavList items={navItems} onNavigate={() => setDrawerOpen(false)} />
          </div>
        </div>
      )}

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-3 border-b border-ink/10 bg-white px-5 py-4 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              onClick={() => setDrawerOpen(true)}
              aria-label="Open menu"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink/5 text-ink lg:hidden"
            >
              <MenuIcon />
            </button>
            <div className="min-w-0">
              <p className="truncate text-xs text-body">Welcome back, {user!.name.split(" ")[0]}</p>
              <h1 className="truncate text-lg font-medium tracking-[-0.01em] text-ink">
                {currentLabel ?? "Dashboard"}
              </h1>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <NotificationBell />
            <AccountMenu />
          </div>
        </header>

        <main className="flex-1 px-5 py-8 lg:px-10 lg:py-10">
          <div className="mx-auto max-w-5xl">
            <DashboardSummaryProvider summary={summary}>{children}</DashboardSummaryProvider>
          </div>
        </main>
      </div>
    </div>
  );
}
