"use client";

import { TextField, NumberField, TextAreaField } from "../fields";
import type { ListingFormState } from "../formState";

export default function BasicsStep({
  value,
  update,
}: {
  value: ListingFormState;
  update: (patch: Partial<ListingFormState>) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <TextField
        label="Title"
        value={value.title}
        onChange={(v) => update({ title: v })}
        placeholder="Spacious 3BHK in Whitefield, ready to move"
      />
      <TextAreaField
        label="Description"
        optional
        value={value.description}
        onChange={(v) => update({ description: v })}
        placeholder="Tell buyers what makes this home worth a look…"
      />
      <TextField
        label="Location"
        value={value.location}
        onChange={(v) => update({ location: v })}
        placeholder="Prestige Lakeside, Whitefield, Bengaluru"
      />

      <div className="grid grid-cols-2 gap-4">
        <NumberField
          label="Area (sq ft)"
          value={value.areaSqft}
          onChange={(v) => update({ areaSqft: v })}
          placeholder="1200"
        />
        <NumberField
          label="Configuration (BHK)"
          value={value.bhk}
          onChange={(v) => update({ bhk: v })}
          placeholder="3"
        />
      </div>

      <NumberField
        label="Asking price (₹)"
        value={value.askingPrice}
        onChange={(v) => update({ askingPrice: v })}
        placeholder="8500000"
      />
    </div>
  );
}
