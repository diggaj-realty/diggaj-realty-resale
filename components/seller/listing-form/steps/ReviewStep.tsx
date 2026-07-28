"use client";

import Image from "next/image";
import { price } from "@/lib/listings";
import type { ListingFormState } from "../formState";

function Row({ label, value }: { label: string; value: string | number | null | undefined }) {
  if (value == null || value === "") return null;
  return (
    <div className="flex justify-between gap-4 border-b border-ink/5 py-2 text-sm last:border-0">
      <span className="text-body">{label}</span>
      <span className="text-right font-medium text-ink">{value}</span>
    </div>
  );
}

export default function ReviewStep({ value }: { value: ListingFormState }) {
  return (
    <div>
      <p className="text-sm font-medium text-ink">Review your listing</p>

      {value.photoUrls.length > 0 && (
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {value.photoUrls.slice(0, 6).map((url) => (
            <div key={url} className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-cream">
              <Image src={url} alt="" fill sizes="80px" className="object-cover" />
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 rounded-2xl bg-cream px-4 py-1">
        <Row label="Title" value={value.title} />
        <Row label="Type" value={value.type} />
        <Row label="Location" value={value.location} />
        <Row label="Area" value={value.areaSqft ? `${value.areaSqft} sq ft` : null} />
        <Row label="Configuration" value={value.bhk ? `${value.bhk} BHK` : null} />
        <Row label="Asking price" value={value.askingPrice ? price(Number(value.askingPrice)) : null} />
        <Row label="City" value={value.city} />
        <Row label="Locality" value={value.locality} />
        <Row label="Furnishing" value={value.furnishing} />
        <Row label="Facing" value={value.facing} />
        <Row label="Possession" value={value.possessionStatus} />
        <Row label="Ownership" value={value.ownershipType} />
        <Row label="RERA ID" value={value.reraId} />
        <Row label="Project" value={value.projectName} />
        <Row label="Builder" value={value.builderName} />
        <Row label="Photos" value={value.photoUrls.length ? `${value.photoUrls.length} uploaded` : null} />
        <Row label="Amenities" value={value.amenities.length ? `${value.amenities.length} selected` : null} />
      </div>

      <div className="mt-4 rounded-2xl bg-amber-50 px-4 py-3 text-xs text-amber-900 ring-1 ring-amber-200">
        Your listing will be submitted as a <strong>draft</strong> and reviewed by our team before it
        goes live, usually within 24 hours. You&apos;ll be notified either way.
      </div>
    </div>
  );
}
