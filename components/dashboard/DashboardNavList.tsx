"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavItem } from "@/lib/dashboard/nav";

export default function DashboardNavList({
  items,
  onNavigate,
}: {
  items: NavItem[];
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1">
      {items.map((item) => {
        // A plain startsWith would also match "/saved-searches" against the
        // "/saved" item's href — require an exact match or a real path
        // segment boundary (a trailing "/") after the prefix.
        const active = pathname === item.href || (!item.exact && pathname.startsWith(`${item.href}/`));
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${
              active ? "bg-panel text-white" : "text-ink/70 hover:bg-ink/5"
            }`}
          >
            <item.Icon className={active ? "text-lime" : "text-ink/40"} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
