"use client";

import Link from "next/link";
import Image from "next/image";
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
import { BUYER_NAV, SELLER_NAV, getProfileNavItem } from "@/lib/dashboard/nav";
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
  // Bumping this re-runs the summary fetch, so Overview can offer a real retry
  // instead of the user having to reload the page.
  const [summaryAttempt, setSummaryAttempt] = useState(0);

  function loadSummary(t: string) {
    authedGet<DashboardSummary>("/dashboard", t)
      .then((s) => {
        setSummary(s);
        setError(null);
      })
      .catch((err) => setError(err.message ?? "Failed to load dashboard."));
  }
  const [drawerOpen, setDrawerOpen] = useState(false);

  const navItems = role === "BUYER" ? BUYER_NAV : SELLER_NAV;
  const profileNavItem = getProfileNavItem(role);
  // Same boundary rule as DashboardNavList — a plain startsWith would match
  // "/saved-searches" against the "/saved" item too. Longest match wins so
  // "/listings/new" resolves to "Add Listing", not "My Listings".
  //
  // Profile is included explicitly and Deals falls back below: both are real
  // pages that aren't in navItems, and they used to render the generic heading
  // "Dashboard" with no sidebar item highlighted, leaving no positional cue.
  const titleCandidates = [...navItems, profileNavItem];
  const currentLabel = titleCandidates.reduce<string | null>((best, i) => {
    const hit = pathname === i.href || (!i.exact && pathname.startsWith(`${i.href}/`));
    if (!hit) return best;
    return best === null || i.href.length > (titleCandidates.find((c) => c.label === best)?.href.length ?? 0)
      ? i.label
      : best;
  }, null);

  // A dual-role account (roles: ["SELLER", "BUYER"]) can open either shell —
  // gate on membership in `roles`, not equality with the single legacy
  // `role` field, which only ever reflects the account's original role.
  const userRoles = user?.roles?.length ? user.roles : user ? [user.role] : [];
  const otherRole: UserRole | null =
    userRoles.length > 1 ? (userRoles.find((r) => r !== role) as UserRole) ?? null : null;

  useEffect(() => {
    if (loading) return;
    if (!user || !token) {
      router.replace(`/login/${role.toLowerCase()}`);
      return;
    }
    if (!userRoles.includes(role)) {
      router.replace(`/dashboard/${userRoles[0].toLowerCase()}`);
      return;
    }
    loadSummary(token);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, user, token, role, router, summaryAttempt]);

  // close the mobile drawer on route change — done during render (not an
  // effect) per react.dev's "adjusting state when a prop changes"
  const [lastPathname, setLastPathname] = useState(pathname);
  if (lastPathname !== pathname) {
    setLastPathname(pathname);
    if (drawerOpen) setDrawerOpen(false);
  }

  // Gated on `user` alone, NOT on `summary`/`error` — the /dashboard summary
  // only feeds the Overview page (which already renders fine with a null
  // summary, see BuyerOverviewPage/SellerOverviewPage). Blocking the whole
  // shell on it meant every route — Listings, Offers, a specific deal's
  // TransactionDetail — waited on an extra network round trip they never
  // needed, on top of their own panels' fetches. `!user` still gates this:
  // on logout (or a role change) `user` clears to null immediately but a
  // prior successful `summary` fetch lingers until the redirect effect above
  // actually navigates away, which would otherwise fall through to
  // `user!.name` below.
  if (loading || !user) {
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

  // Deliberately NO early return for `error` here. The /dashboard summary only
  // feeds the Overview page, but bailing out at the shell level meant one 5xx on
  // that single endpoint replaced the sidebar, header and every child route with
  // a bare red sentence — locking the user out of Listings, Offers and Deals
  // even though those endpoints were healthy. The error now travels down via
  // DashboardSummaryProvider so Overview alone degrades, with a retry.

  return (
    <div className="flex min-h-screen bg-cream">
      {/* Desktop sidebar — pure navigation.
          `sticky top-0 h-screen` is what makes the inner overflow-y-auto below
          actually work: without a bounded height the aside just grew to its
          content height, so the nav never scrolled on its own and the whole page
          scrolled instead. Now the sidebar stays put while <main> scrolls. */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-ink/10 bg-white lg:flex">
        <Link href="/" className="flex items-center gap-2.5 px-6 pb-2 pt-6 text-lg font-semibold tracking-tight text-ink">
          <Image
            src="/logo.png"
            alt="Diggaj Realty Logo"
            width={28}
            height={28}
            className="h-7 w-7 rounded-md object-contain"
          />
          <span>Diggaj Realty</span>
        </Link>
        <div className="flex items-center justify-between gap-2 px-6 pb-6">
          <p className="text-xs font-medium uppercase tracking-wide text-body">
            {role === "BUYER" ? "Buyer dashboard" : "Seller dashboard"}
          </p>
          {otherRole && (
            <Link
              href={`/dashboard/${otherRole.toLowerCase()}`}
              className="shrink-0 rounded-full bg-ink/5 px-3 py-1 text-[11px] font-medium text-ink/70 hover:bg-ink/10"
            >
              Switch to {otherRole === "BUYER" ? "buyer" : "seller"} →
            </Link>
          )}
        </div>
        {/* overscroll-contain: once this list hits its top or bottom, the scroll
            stops here instead of chaining on to the page behind it. */}
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain px-4 pb-4">
          <DashboardNavList items={navItems} />
          <div className="mt-auto border-t border-ink/10 pt-2">
            <DashboardNavList items={[profileNavItem]} />
          </div>
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
              <Link href="/" className="flex items-center gap-2.5">
                <Image
                  src="/logo.png"
                  alt="Diggaj Realty Logo"
                  width={28}
                  height={28}
                  className="h-7 w-7 rounded-md object-contain"
                />
                <span className="text-lg font-semibold tracking-tight text-ink">Diggaj Realty</span>
              </Link>
              <button onClick={() => setDrawerOpen(false)} aria-label="Close menu" className="text-ink/50">
                <CloseIcon />
              </button>
            </div>
            <div className="mb-4 mt-1 flex items-center justify-between gap-2">
              <p className="text-xs font-medium uppercase tracking-wide text-body">
                {role === "BUYER" ? "Buyer dashboard" : "Seller dashboard"}
              </p>
              {otherRole && (
                <Link
                  href={`/dashboard/${otherRole.toLowerCase()}`}
                  onClick={() => setDrawerOpen(false)}
                  className="shrink-0 rounded-full bg-ink/5 px-3 py-1 text-[11px] font-medium text-ink/70 hover:bg-ink/10"
                >
                  Switch →
                </Link>
              )}
            </div>
            {/* min-h-0 lets this flex child actually shrink so overflow engages;
                overscroll-contain stops the scroll leaking to the page behind. */}
            <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain">
              <DashboardNavList items={navItems} onNavigate={() => setDrawerOpen(false)} />
              <div className="mt-auto border-t border-ink/10 pt-2">
                <DashboardNavList items={[profileNavItem]} onNavigate={() => setDrawerOpen(false)} />
              </div>
            </div>
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
              <p className="truncate text-xs text-body">Welcome back, {user.name.split(" ")[0]}</p>
              <h1 className="truncate text-lg font-medium tracking-[-0.01em] text-ink">
                {currentLabel ?? "Dashboard"}
              </h1>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <NotificationBell />
            <AccountMenu role={role} />
          </div>
        </header>

        <main className="flex-1 px-5 py-8 lg:px-10 lg:py-10">
          <div className="mx-auto max-w-5xl">
            <DashboardSummaryProvider
              summary={summary}
              error={error}
              reload={() => setSummaryAttempt((n) => n + 1)}
            >
              {children}
            </DashboardSummaryProvider>
          </div>
        </main>
      </div>
    </div>
  );
}
