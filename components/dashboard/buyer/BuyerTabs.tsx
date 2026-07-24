"use client";

import { useState } from "react";
import {
  SavedPanel,
  OffersPanel,
  VisitsPanel,
  SearchesPanel,
  ClosingPanel,
} from "@/components/dashboard/buyer/panels";

const TABS = [
  { key: "saved", label: "Saved", Panel: SavedPanel },
  { key: "offers", label: "Offers & Negotiation", Panel: OffersPanel },
  { key: "visits", label: "Site Visits", Panel: VisitsPanel },
  { key: "searches", label: "Saved Searches", Panel: SearchesPanel },
  { key: "closing", label: "Closing & Documents", Panel: ClosingPanel },
] as const;

export default function BuyerTabs() {
  const [active, setActive] = useState<(typeof TABS)[number]["key"]>("saved");
  const ActivePanel = TABS.find((t) => t.key === active)!.Panel;

  return (
    <div>
      <div className="-mx-5 flex gap-2 overflow-x-auto border-b border-ink/10 px-5 pb-3 [scrollbar-width:none] sm:-mx-8 sm:px-8 md:mx-0 md:flex-wrap md:px-0 [&::-webkit-scrollbar]:hidden">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setActive(t.key)}
            className={`shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              active === t.key ? "bg-panel text-white" : "text-ink/60 hover:bg-ink/5"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="mt-6">
        <ActivePanel />
      </div>
    </div>
  );
}
