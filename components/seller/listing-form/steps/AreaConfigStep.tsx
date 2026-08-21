"use client";

import { NumberField, SelectField } from "../fields";
import type { ListingFormState } from "../formState";
import { FURNISHING, FACING, FACING_LABEL } from "@/lib/propertyEnums";

export default function AreaConfigStep({
  value,
  update,
}: {
  value: ListingFormState;
  update: (patch: Partial<ListingFormState>) => void;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-sm font-medium text-ink">Area breakdown</p>
        <p className="mt-1 text-xs text-body">
          RERA requires carpet area to be disclosed separately from built-up/super built-up.
        </p>
        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <NumberField
            label="Carpet area (sq ft)"
            optional
            value={value.carpetAreaSqft}
            onChange={(v) => update({ carpetAreaSqft: v })}
          />
          <NumberField
            label="Built-up area (sq ft)"
            optional
            value={value.builtUpAreaSqft}
            onChange={(v) => update({ builtUpAreaSqft: v })}
          />
          <NumberField
            label="Super built-up (sq ft)"
            optional
            value={value.superBuiltUpAreaSqft}
            onChange={(v) => update({ superBuiltUpAreaSqft: v })}
          />
        </div>
      </div>

      <div>
        <p className="text-sm font-medium text-ink">Configuration</p>
        <div className="mt-3 grid grid-cols-2 gap-4">
          <NumberField
            label="Bathrooms"
            optional
            value={value.bathrooms}
            onChange={(v) => update({ bathrooms: v })}
          />
          <NumberField
            label="Balconies"
            optional
            value={value.balconies}
            onChange={(v) => update({ balconies: v })}
          />
          <SelectField
            label="Furnishing"
            optional
            value={value.furnishing}
            onChange={(v) => update({ furnishing: v })}
            options={FURNISHING.map((f) => ({ value: f, label: f.replace(/_/g, " ") }))}
          />
          <SelectField
            label="Facing"
            optional
            value={value.facing}
            onChange={(v) => update({ facing: v })}
            options={FACING.map((f) => ({ value: f, label: FACING_LABEL[f] }))}
          />
          <NumberField
            label="Floor number"
            optional
            value={value.floorNumber}
            onChange={(v) => update({ floorNumber: v })}
          />
          <NumberField
            label="Total floors"
            optional
            value={value.totalFloors}
            onChange={(v) => update({ totalFloors: v })}
          />
          <NumberField
            label="Age (years)"
            optional
            value={value.ageYears}
            onChange={(v) => update({ ageYears: v })}
            placeholder="0 for new construction"
          />
        </div>
      </div>

      <div>
        <p className="text-sm font-medium text-ink">Parking</p>
        <div className="mt-3 grid grid-cols-2 gap-4">
          <NumberField
            label="Covered spots"
            optional
            value={value.parkingCovered}
            onChange={(v) => update({ parkingCovered: v })}
          />
          <NumberField
            label="Open spots"
            optional
            value={value.parkingOpen}
            onChange={(v) => update({ parkingOpen: v })}
          />
        </div>
      </div>
    </div>
  );
}
