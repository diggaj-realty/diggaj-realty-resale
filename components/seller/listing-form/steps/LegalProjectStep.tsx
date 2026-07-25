"use client";

import { TextField, NumberField, SelectField } from "../fields";
import type { ListingFormState } from "../formState";
import { POSSESSION_STATUS, OWNERSHIP_TYPE } from "@/lib/propertyEnums";

export default function LegalProjectStep({
  value,
  update,
}: {
  value: ListingFormState;
  update: (patch: Partial<ListingFormState>) => void;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-sm font-medium text-ink">Legal &amp; possession</p>
        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <SelectField
            label="Possession status"
            optional
            value={value.possessionStatus}
            onChange={(v) => update({ possessionStatus: v })}
            options={POSSESSION_STATUS.map((p) => ({ value: p, label: p.replace(/_/g, " ") }))}
          />
          {value.possessionStatus === "UNDER_CONSTRUCTION" && (
            <TextField
              label="Possession date"
              optional
              type="date"
              value={value.possessionDate}
              onChange={(v) => update({ possessionDate: v })}
            />
          )}
          <SelectField
            label="Ownership type"
            optional
            value={value.ownershipType}
            onChange={(v) => update({ ownershipType: v })}
            options={OWNERSHIP_TYPE.map((o) => ({ value: o, label: o.replace(/_/g, " ") }))}
          />
          <TextField
            label="RERA ID"
            optional
            value={value.reraId}
            onChange={(v) => update({ reraId: v })}
            placeholder="PRM/KA/RERA/..."
          />
          <NumberField
            label="Maintenance (₹/month)"
            optional
            value={value.maintenanceMonthly}
            onChange={(v) => update({ maintenanceMonthly: v })}
          />
          <label className="flex items-center gap-2.5 text-sm text-ink">
            <input
              type="checkbox"
              checked={value.priceNegotiable}
              onChange={(e) => update({ priceNegotiable: e.target.checked })}
              className="h-4 w-4 accent-lime"
            />
            Price is negotiable
          </label>
        </div>
      </div>

      <div>
        <p className="text-sm font-medium text-ink">Builder &amp; project</p>
        <p className="mt-1 text-xs text-body">Helps buyers searching for a specific project or society.</p>
        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextField
            label="Project name"
            optional
            value={value.projectName}
            onChange={(v) => update({ projectName: v })}
            placeholder="Prestige Lakeside Habitat"
          />
          <TextField
            label="Builder name"
            optional
            value={value.builderName}
            onChange={(v) => update({ builderName: v })}
            placeholder="Prestige Group"
          />
        </div>
      </div>
    </div>
  );
}
