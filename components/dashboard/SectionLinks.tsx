import Link from "next/link";
import { ChevronRightIcon } from "@/components/dashboard/icons";
import type { NavItem } from "@/lib/dashboard/nav";

export default function SectionLinks({ items }: { items: NavItem[] }) {
  const sections = items.filter((i) => !i.exact);
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {sections.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="group flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-ink/5 transition-transform hover:-translate-y-0.5"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-limepale text-ink">
            <item.Icon />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-ink">{item.label}</p>
            <p className="truncate text-xs text-body">{item.description}</p>
          </div>
          <ChevronRightIcon className="shrink-0 text-ink/30 transition-transform group-hover:translate-x-0.5" />
        </Link>
      ))}
    </div>
  );
}
