"use client";

import { useEffect, useState } from "react";
import { getAmenities, FALLBACK_AMENITIES } from "@/lib/api/amenities";
import type { ListingFormState } from "../formState";

export default function AmenitiesStep({
  value,
  update,
}: {
  value: ListingFormState;
  update: (patch: Partial<ListingFormState>) => void;
}) {
  const [options, setOptions] = useState<string[] | null>(null);

  useEffect(() => {
    getAmenities()
      .then((list) => setOptions(list.length > 0 ? list.map((a) => a.name) : FALLBACK_AMENITIES))
      .catch(() => setOptions(FALLBACK_AMENITIES));
  }, []);

  function toggle(name: string) {
    update({
      amenities: value.amenities.includes(name)
        ? value.amenities.filter((a) => a !== name)
        : [...value.amenities, name],
    });
  }

  return (
    <div>
      <p className="text-sm font-medium text-ink">Amenities</p>
      <p className="mt-1 text-xs text-body">Select everything that applies; buyers filter by these.</p>
      {options === null ? (
        <p className="mt-4 text-sm text-body">Loading…</p>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {options.map((name) => {
            const active = value.amenities.includes(name);
            return (
              <button
                key={name}
                type="button"
                onClick={() => toggle(name)}
                className={`rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${
                  active ? "bg-panel text-white" : "bg-ink/5 text-ink/70 hover:bg-ink/10"
                }`}
              >
                {active ? "✓ " : ""}
                {name}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
