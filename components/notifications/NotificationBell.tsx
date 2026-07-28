"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { Skeleton } from "@/components/Skeleton";
import { getNotifications, markAllNotificationsRead, markNotificationRead } from "@/lib/api/notifications";
import type { AppNotification } from "@/types/notifications";

/** Relative for anything inside a week, absolute beyond it. A notification list
 *  is read as "what just happened", and a plain "28 Jul" on something five
 *  minutes old answered the wrong question. Safe from hydration mismatch: the
 *  component returns null until there's a user, so this never runs on the
 *  server. */
function fmtWhen(iso: string) {
  const ms = Date.now() - new Date(iso).getTime();
  const min = Math.round(ms / 60000);
  if (min < 1) return "Just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const days = Math.round(hr / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
}

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
        {/* ring in the surrounding colour separates the badge from the bell
            glyph behind it instead of the two touching */}
        {unreadCount > 0 && (
          <span
            className={`absolute -right-0.5 -top-0.5 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-lime px-1 text-[10px] font-semibold text-ink ring-2 ${
              dark ? "ring-panel" : "ring-white"
            }`}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <button aria-label="Close notifications" onClick={() => setOpen(false)} className="fixed inset-0 z-30 cursor-default" />
          {/* Below `sm:`, anchor to the viewport instead of the button —
              `absolute right-0` alone can push this off-screen on a narrow
              phone if the bell isn't the page's right-most element (e.g.
              there's a menu button further right in Nav.tsx). */}
          <div className="fixed inset-x-2 top-20 z-40 overflow-hidden rounded-[20px] bg-white shadow-2xl ring-1 ring-ink/10 sm:absolute sm:inset-x-auto sm:top-full sm:right-0 sm:mt-2 sm:w-[360px] sm:max-w-[90vw]">
            <div className="flex items-center justify-between gap-2 border-b border-ink/5 px-4 py-3">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-ink">Notifications</p>
                {unreadCount > 0 && (
                  <span className="rounded-full bg-lime px-2 py-0.5 text-[10px] font-semibold text-ink">
                    {unreadCount} new
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={readAll}
                  className="shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium text-ink/55 transition-colors hover:bg-ink/5 hover:text-ink"
                >
                  Mark all read
                </button>
              )}
            </div>
            {/* data-lenis-prevent: without it, scrolling this list scrolls the
                page behind the dropdown instead. */}
            <div
              data-lenis-prevent
              className="max-h-[22rem] divide-y divide-ink/5 overflow-y-auto overscroll-contain"
            >
              {items === null ? (
                // Skeleton rows rather than a "Loading…" line, so the panel
                // doesn't visibly resize once the real list lands.
                <div className="divide-y divide-ink/5">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="flex gap-2.5 px-4 py-3.5">
                      <Skeleton className="mt-1 h-2 w-2 shrink-0 rounded-full" />
                      <div className="min-w-0 flex-1 space-y-2">
                        <Skeleton className="h-3 w-2/5" />
                        <Skeleton className="h-3 w-4/5" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : items.length === 0 ? (
                <div className="flex flex-col items-center px-4 py-10 text-center">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-limepale text-ink">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden>
                      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
                      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                    </svg>
                  </span>
                  <p className="mt-3 text-sm font-medium text-ink">You&apos;re all caught up</p>
                  <p className="mt-1 text-xs text-body">
                    Updates on your interests, offers and visits land here.
                  </p>
                </div>
              ) : (
                items.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => readOne(n)}
                    className={`flex w-full gap-2.5 px-4 py-3.5 text-left transition-colors hover:bg-ink/[0.03] ${
                      n.isRead ? "" : "bg-limepale/40"
                    }`}
                  >
                    {/* Dot lives in a fixed-width gutter that read rows also
                        reserve, so every title starts on the same x — with the
                        dot inline, read and unread titles didn't line up. */}
                    <span
                      className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                        n.isRead ? "bg-transparent" : "bg-lime ring-2 ring-lime/30"
                      }`}
                      aria-hidden
                    />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-baseline justify-between gap-3">
                        {/* Title now outranks the message instead of both being
                            text-xs and distinguishable only by weight. */}
                        <span
                          className={`text-[13px] leading-snug ${
                            n.isRead ? "font-medium text-ink/75" : "font-semibold text-ink"
                          }`}
                        >
                          {n.title}
                        </span>
                        <span className="shrink-0 whitespace-nowrap text-[10px] text-ink/40">
                          {fmtWhen(n.createdAt)}
                        </span>
                      </span>
                      {/* Clamped: one long message could otherwise take the
                          whole panel and bury everything under it. */}
                      <span className="mt-1 line-clamp-2 block text-xs leading-relaxed text-body">
                        {n.message}
                      </span>
                    </span>
                  </button>
                ))
              )}
            </div>
            <Link
              href="/notifications"
              onClick={() => setOpen(false)}
              className="block border-t border-ink/5 px-4 py-3 text-center text-xs font-medium text-ink/60 transition-colors hover:bg-ink/[0.03] hover:text-ink"
            >
              View all notifications →
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
