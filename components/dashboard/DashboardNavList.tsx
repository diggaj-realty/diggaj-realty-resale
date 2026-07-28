"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { groupNav, type NavItem } from "@/lib/dashboard/nav";

export default function DashboardNavList({
  items,
  onNavigate,
}: {
  items: NavItem[];
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const groups = groupNav(items);

  // Longest matching href wins, so "/listings/new" doesn't also light up
  // "/listings". A plain per-item startsWith highlighted both.
  const activeHref = items.reduce<string | null>((best, item) => {
    const hit =
      pathname === item.href || (!item.exact && pathname.startsWith(`${item.href}/`));
    if (!hit) return best;
    return best === null || item.href.length > best.length ? item.href : best;
  }, null);

  return (
    <nav className="flex flex-col gap-5">
      {groups.map(({ group, items: groupItems }) => (
        <div key={group}>
          {/* The single-item Overview bucket needs no heading above it. */}
          {group !== "Overview" && (
            <p className="mb-1.5 px-3.5 text-[10px] font-semibold uppercase tracking-wider text-ink/35">
              {group}
            </p>
          )}
          <div className="flex flex-col gap-1">
            {groupItems.map((item) => {
              const active = item.href === activeHref;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${
                    active ? "bg-panel text-white" : "text-ink/70 hover:bg-ink/5"
                  }`}
                >
                  <item.Icon className={active ? "text-lime" : "text-ink/40"} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}
