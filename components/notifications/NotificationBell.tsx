"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { getNotifications, markAllNotificationsRead, markNotificationRead } from "@/lib/api/notifications";
import type { AppNotification } from "@/types/notifications";

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short" });

export default function NotificationBell({ dark }: { dark?: boolean }) {
  const { user, token } = useAuth();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<AppNotification[] | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  function load() {
    if (!token) return;
    getNotifications(token, 8)
      .then((r) => {
        setItems(r.items);
        setUnreadCount(r.unreadCount);
      })
      .catch(() => {});
  }

  // fetch unread count on mount (and whenever the user logs in)
  useEffect(load, [token]);

  async function openPanel() {
    setOpen((o) => !o);
    if (!items) load();
  }

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

  if (!user) return null;

  return (
    <div className="relative">
      <button
        onClick={openPanel}
        aria-label="Notifications"
        className={`relative flex h-10 w-10 items-center justify-center rounded-full ${
          dark ? "bg-white/10 text-white" : "bg-white text-ink shadow-sm"
        }`}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-lime px-1 text-[10px] font-semibold text-ink">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <button aria-label="Close notifications" onClick={() => setOpen(false)} className="fixed inset-0 z-30 cursor-default" />
          <div className="absolute right-0 top-full z-40 mt-2 w-80 max-w-[90vw] rounded-2xl bg-white p-2 shadow-2xl ring-1 ring-ink/10">
            <div className="flex items-center justify-between px-3 py-2">
              <p className="text-sm font-medium text-ink">Notifications</p>
              {unreadCount > 0 && (
                <button onClick={readAll} className="text-xs font-medium text-ink/50 underline underline-offset-2 hover:text-ink">
                  Mark all read
                </button>
              )}
            </div>
            <div className="max-h-80 overflow-y-auto">
              {items === null ? (
                <p className="px-3 py-6 text-center text-xs text-body">Loading…</p>
              ) : items.length === 0 ? (
                <p className="px-3 py-6 text-center text-xs text-body">You&apos;re all caught up.</p>
              ) : (
                items.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => readOne(n)}
                    className={`block w-full rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-ink/5 ${
                      n.isRead ? "" : "bg-limepale/60"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-medium text-ink">{n.title}</p>
                      {!n.isRead && <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-lime" />}
                    </div>
                    <p className="mt-0.5 text-xs text-body">{n.message}</p>
                    <p className="mt-1 text-[10px] text-ink/40">{fmtDate(n.createdAt)}</p>
                  </button>
                ))
              )}
            </div>
            <Link
              href="/notifications"
              onClick={() => setOpen(false)}
              className="mt-1 block rounded-xl px-3 py-2 text-center text-xs font-medium text-ink/60 hover:bg-ink/5"
            >
              View all →
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
