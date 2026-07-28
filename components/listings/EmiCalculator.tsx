"use client";

import { useMemo, useState } from "react";
import { price } from "@/lib/listings";

function Slider({
  label,
  value,
  min,
  max,
  step,
  suffix,
  display,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  suffix?: string;
  display: string;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-body">{label}</span>
        <span className="font-semibold text-ink">
          {display}
          {suffix}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 w-full accent-lime"
      />
    </div>
  );
}

export default function EmiCalculator({
  askingPrice,
  maintenanceMonthly,
}: {
  askingPrice: number;
  maintenanceMonthly?: number | null;
}) {
  const [downPct, setDownPct] = useState(20);
  const [rate, setRate] = useState(8.5);
  const [years, setYears] = useState(20);

  const { emi, loan, down, totalInterest, totalPayable } = useMemo(() => {
    const down = Math.round((askingPrice * downPct) / 100);
    const loan = askingPrice - down;
    const r = rate / 12 / 100;
    const n = years * 12;
    const emiRaw =
      r === 0 ? loan / n : (loan * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const emi = Math.round(emiRaw);
    const totalPayable = emi * n;
    const totalInterest = totalPayable - loan;
    return { emi, loan, down, totalInterest, totalPayable };
  }, [askingPrice, downPct, rate, years]);

  return (
    <div className="rounded-[24px] bg-cream p-6">
      <p className="text-sm font-medium text-ink">EMI calculator</p>

      <div className="mt-3 rounded-2xl bg-white p-4 text-center ring-1 ring-ink/5">
        <p className="text-xs text-body">Estimated monthly EMI</p>
        <p className="mt-1 text-3xl font-medium tracking-[-0.02em] text-ink">
          {price(emi)}
          <span className="text-base text-body">/mo</span>
        </p>
      </div>

      <div className="mt-5 space-y-4">
        <Slider
          label="Down payment"
          value={downPct}
          min={10}
          max={90}
          step={5}
          suffix="%"
          display={`${downPct}`}
          onChange={setDownPct}
        />
        <Slider
          label="Interest rate"
          value={rate}
          min={6}
          max={12}
          step={0.1}
          suffix="%"
          display={rate.toFixed(1)}
          onChange={setRate}
        />
        <Slider
          label="Loan tenure"
          value={years}
          min={5}
          max={30}
          step={1}
          suffix=" yr"
          display={`${years}`}
          onChange={setYears}
        />
      </div>

      <dl className="mt-5 space-y-2 border-t border-ink/10 pt-4 text-xs text-body">
        <div className="flex justify-between">
          <dt>Down payment</dt>
          <dd className="font-medium text-ink">{price(down)}</dd>
        </div>
        <div className="flex justify-between">
          <dt>Loan amount</dt>
          <dd className="font-medium text-ink">{price(loan)}</dd>
        </div>
        <div className="flex justify-between">
          <dt>Total interest</dt>
          <dd className="font-medium text-ink">{price(totalInterest)}</dd>
        </div>
        <div className="flex justify-between">
          <dt>Total payable</dt>
          <dd className="font-medium text-ink">{price(totalPayable)}</dd>
        </div>
        {maintenanceMonthly != null && (
          <div className="flex justify-between">
            <dt>Maintenance</dt>
            <dd className="font-medium text-ink">{price(maintenanceMonthly)}/mo</dd>
          </div>
        )}
      </dl>

      <p className="mt-4 text-[11px] leading-relaxed text-ink/40">
        Indicative only. Actual EMI depends on your bank, credit profile, and final rate; talk to a
        Diggaj lending partner for a precise quote.
      </p>
    </div>
  );
}
