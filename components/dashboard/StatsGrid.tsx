import {
  OfferIcon,
  HandshakeIcon,
  BuildingIcon,
  ShieldIcon,
  WalletIcon,
  SparkleIcon,
} from "@/components/dashboard/icons";
import type { StatMetric } from "@/types/dashboard";

const TONE_BG: Record<string, string> = {
  green: "bg-limepale text-ink",
  gold: "bg-amber-100 text-amber-900",
  purple: "bg-violet-100 text-violet-900",
  blue: "bg-sky-100 text-sky-900",
  red: "bg-red-100 text-red-900",
};

// Best-effort icon per known stat label — falls back to a generic sparkle.
const ICON_BY_LABEL: Record<string, typeof OfferIcon> = {
  "Pending Offers": OfferIcon,
  "Accepted Offers": HandshakeIcon,
  "Active Deals": HandshakeIcon,
  "Properties Available": BuildingIcon,
  "Live Listings": BuildingIcon,
  "Under Verification": ShieldIcon,
  "Portfolio Value": WalletIcon,
};

export default function StatsGrid({ stats }: { stats: StatMetric[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((s) => {
        const Icon = ICON_BY_LABEL[s.label] ?? SparkleIcon;
        return (
          <div key={s.label} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-ink/5">
            <div className="flex items-center gap-3">
              <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${TONE_BG[s.tone] ?? "bg-cream text-ink"}`}>
                <Icon />
              </span>
              <div className="min-w-0">
                <p className="text-2xl font-semibold leading-none text-ink">{s.value}</p>
                <p className="mt-1.5 truncate text-xs text-body">{s.label}</p>
              </div>
            </div>
            <p className="mt-3 text-xs text-body">{s.hint}</p>
          </div>
        );
      })}
    </div>
  );
}
