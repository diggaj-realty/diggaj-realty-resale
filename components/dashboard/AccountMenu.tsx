"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { UserIcon, LogoutIcon } from "@/components/dashboard/icons";

export default function AccountMenu() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  if (!user) return null;
  const initial = user.name.trim().charAt(0).toUpperCase() || "?";

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Account menu"
        className="flex h-10 w-10 items-center justify-center rounded-full bg-panel text-sm font-semibold text-white"
      >
        {initial}
      </button>
      {open && (
        <>
          <button aria-label="Close account menu" onClick={() => setOpen(false)} className="fixed inset-0 z-30 cursor-default" />
          <div className="absolute right-0 top-full z-40 mt-2 w-56 rounded-2xl bg-white p-2 shadow-2xl ring-1 ring-ink/10">
            <div className="px-3 py-2">
              <p className="truncate text-sm font-medium text-ink">{user.name}</p>
              <p className="truncate text-xs text-body">{user.email}</p>
            </div>
            <div className="my-1 h-px bg-ink/5" />
            <Link
              href="/profile"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-ink/70 hover:bg-ink/5"
            >
              <UserIcon /> Profile &amp; Settings
            </Link>
            <button
              onClick={() => {
                logout();
                router.push("/");
              }}
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm text-ink/70 hover:bg-ink/5"
            >
              <LogoutIcon /> Log out
            </button>
          </div>
        </>
      )}
    </div>
  );
}
