"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Nav from "@/components/Nav";
import { useAuth } from "@/lib/auth/AuthContext";
import { getNotifications, markAllNotificationsRead, markNotificationRead } from "@/lib/api/notifications";
import { RowSkeleton } from "@/components/Skeleton";
import type { AppNotification } from "@/types/notifications";

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

export default function NotificationsPage() {
  const { user, token, loading } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<AppNotification[] | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (!token) return;
    getNotifications(token, 50)
      .then((r) => {
        setItems(r.items);
        setUnreadCount(r.unreadCount);
      })
      .catch((e) => setError(e.message));
  }, [token]);

  async function readOne(n: AppNotification) {
    if (n.isRead || !token) return;
    setItems((prev) => prev?.map((x) => (x.id === n.id ? { ...x, isRead: true } : x)) ?? null);
    setUnreadCount((c) => Math.max(0, c - 1));
    try {
      await markNotificationRead(token, n.id);
    } catch {
      /* best-effort */
    }
  }

  async function readAll() {
    if (!token) return;
    setItems((prev) => prev?.map((x) => ({ ...x, isRead: true })) ?? null);
    setUnreadCount(0);
    try {
      await markAllNotificationsRead(token);
    } catch {
      /* best-effort */
    }
  }

  if (loading || !user) {
    return (
      <main className="min-h-screen bg-white">
        <Nav />
        <p className="px-8 py-16 text-sm text-body md:px-14">Loading…</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen overflow-x-clip bg-white">
      <div className="bg-cream pb-10">
        <Nav />
        <div className="flex flex-wrap items-center justify-between gap-4 px-8 pt-10 md:px-14">
          <div>
            <h1 className="text-4xl font-medium tracking-[-0.02em] text-ink md:text-5xl">Notifications</h1>
            <p className="mt-2 text-sm text-body">Everything that&apos;s changed on your account.</p>
          </div>
          {unreadCount > 0 && (
            <button onClick={readAll} className="rounded-full bg-panel px-5 py-2.5 text-xs font-medium text-white">
              Mark all read ({unreadCount})
            </button>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-8 py-10 md:px-14">
        {error && <p className="rounded-2xl bg-red-50 p-5 text-sm text-red-700">{error}</p>}
        {items === null && !error && (
          <div className="flex flex-col gap-3">
            <RowSkeleton />
            <RowSkeleton />
            <RowSkeleton />
          </div>
        )}
        {items?.length === 0 && (
          <p className="rounded-2xl bg-cream p-8 text-center text-sm text-body">
            No notifications yet — you&apos;ll see updates here as things happen on your account.
          </p>
        )}
        <div className="flex flex-col gap-2">
          {items?.map((n) => (
            <button
              key={n.id}
              onClick={() => readOne(n)}
              className={`rounded-2xl px-5 py-4 text-left ring-1 ring-ink/5 transition-colors ${
                n.isRead ? "bg-white" : "bg-limepale/50"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-medium text-ink">{n.title}</p>
                {!n.isRead && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-lime" />}
              </div>
              <p className="mt-1 text-sm text-body">{n.message}</p>
              <p className="mt-2 text-xs text-ink/40">{fmtDate(n.createdAt)}</p>
            </button>
          ))}
        </div>
      </div>
    </main>
  );
}
