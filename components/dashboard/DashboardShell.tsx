"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { authedGet } from "@/lib/api/authed";
import { Skeleton, RowSkeleton } from "@/components/Skeleton";
import type { DashboardSummary } from "@/types/dashboard";
import type { UserRole } from "@/types/auth";

const TONE_CLASS: Record<string, string> = {
  green: "bg-limepale text-ink",
  gold: "bg-amber-100 text-amber-900",
  purple: "bg-violet-100 text-violet-900",
  blue: "bg-sky-100 text-sky-900",
  red: "bg-red-100 text-red-900",
};

export default function DashboardShell({
  role,
  children,
}: {
  role: UserRole;
  children: (summary: DashboardSummary) => React.ReactNode;
}) {
  const router = useRouter();
  const { user, token, loading, logout } = useAuth();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  if (loading || (!error && !summary)) {
    return (
      <main className="min-h-screen w-full overflow-x-clip bg-cream px-5 py-16 sm:px-8 md:px-14">
        <div className="mx-auto max-w-5xl">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="mt-2 h-8 w-64" />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-ink/5">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="mt-3 h-7 w-12" />
                <Skeleton className="mt-3 h-5 w-24 rounded-full" />
              </div>
            ))}
          </div>
          <div className="mt-12 space-y-3">
            <Skeleton className="h-9 w-full max-w-md rounded-full" />
            <RowSkeleton />
            <RowSkeleton />
          </div>
        </div>
      </main>
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
    <main className="min-h-screen w-full overflow-x-clip bg-cream px-5 py-16 sm:px-8 md:px-14">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-body">
              {role === "BUYER" ? "Buyer dashboard" : "Seller dashboard"}
            </p>
            <h1 className="mt-1 text-3xl font-medium tracking-[-0.02em] text-ink">
              Welcome back, {user!.name.split(" ")[0]}
            </h1>
          </div>
          <button
            onClick={() => {
              logout();
              router.push("/");
            }}
            className="w-fit shrink-0 rounded-full bg-white px-5 py-2.5 text-sm text-ink shadow-sm"
          >
            Log out
          </button>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {summary!.stats.map((s) => (
            <div key={s.label} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-ink/5">
              <p className="text-xs text-body">{s.label}</p>
              <p className="mt-2 text-2xl font-medium text-ink">{s.value}</p>
              <span className={`mt-3 inline-block rounded-full px-2.5 py-1 text-xs ${TONE_CLASS[s.tone] ?? "bg-cream text-ink"}`}>
                {s.hint}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-12">{children(summary!)}</div>
      </div>
    </main>
  );
}
