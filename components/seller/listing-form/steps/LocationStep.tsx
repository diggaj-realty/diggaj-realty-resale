"use client";

import { TextField } from "../fields";
import type { ListingFormState } from "../formState";
import { CANONICAL_CITIES } from "@/lib/cities";
import LocationMapPicker from "@/components/seller/LocationMapPicker";

export default function LocationStep({
  value,
  update,
  mapsApiKey,
}: {
  value: ListingFormState;
  update: (patch: Partial<ListingFormState>) => void;
  mapsApiKey?: string;
}) {
  return (
    <div className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5 text-sm text-ink">
        City <span className="font-normal text-body">(optional)</span>
        <select
          value={value.city}
          onChange={(e) => update({ city: e.target.value })}
          className="appearance-none rounded-xl border border-ink/10 bg-white px-4 py-3 text-sm outline-none focus:border-ink/30"
        >
          <option value="">Select…</option>
          {CANONICAL_CITIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </label>

      <div className="grid grid-cols-2 gap-4">
        <TextField
          label="Locality"
          optional
          value={value.locality}
          onChange={(v) => update({ locality: v })}
          placeholder="Whitefield"
        />
      </div>

      <div>
        <p className="text-sm text-ink">
          Map pin <span className="font-normal text-body">(optional)</span>
        </p>
        <div className="mt-1.5">
          <LocationMapPicker
            apiKey={mapsApiKey}
            lat={value.latitude}
            lng={value.longitude}
            onChange={(lat, lng) => update({ latitude: lat, longitude: lng })}
          />
        </div>
      </div>
    </div>
  );
}
