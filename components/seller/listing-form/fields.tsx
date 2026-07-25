"use client";

const inputClass =
  "rounded-xl border border-ink/10 bg-white px-4 py-3 text-sm outline-none focus:border-ink/30";

export function TextField({
  label,
  value,
  onChange,
  placeholder,
  optional,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  optional?: boolean;
  type?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-sm text-ink">
      {label} {optional && <span className="font-normal text-body">(optional)</span>}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={inputClass}
      />
    </label>
  );
}

export function NumberField({
  label,
  value,
  onChange,
  placeholder,
  optional,
  min = 0,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  optional?: boolean;
  min?: number;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-sm text-ink">
      {label} {optional && <span className="font-normal text-body">(optional)</span>}
      <input
        type="number"
        min={min}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={inputClass}
      />
    </label>
  );
}

export function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
  optional,
  rows = 4,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  optional?: boolean;
  rows?: number;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-sm text-ink">
      {label} {optional && <span className="font-normal text-body">(optional)</span>}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className={`${inputClass} resize-none`}
      />
    </label>
  );
}

export function SelectField<T extends string>({
  label,
  value,
  onChange,
  options,
  optional,
}: {
  label: string;
  value: T | "";
  onChange: (v: T | "") => void;
  options: { value: T; label: string }[];
  optional?: boolean;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-sm text-ink">
      {label} {optional && <span className="font-normal text-body">(optional)</span>}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T | "")}
        className={`${inputClass} appearance-none`}
      >
        <option value="">Select…</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
