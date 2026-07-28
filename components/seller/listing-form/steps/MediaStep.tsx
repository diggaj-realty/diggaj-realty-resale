"use client";

import PhotoUploader from "@/components/seller/PhotoUploader";
import SingleFileUploader from "@/components/seller/SingleFileUploader";
import type { ListingFormState } from "../formState";

export default function MediaStep({
  value,
  update,
}: {
  value: ListingFormState;
  update: (patch: Partial<ListingFormState>) => void;
}) {
  return (
    <div className="flex flex-col gap-6">
      <PhotoUploader photoUrls={value.photoUrls} onChange={(urls) => update({ photoUrls: urls })} />

      <SingleFileUploader
        label="Video tour"
        hint="Optional: a short walkthrough video"
        accept="video/*"
        url={value.videoUrl}
        onChange={(url) => update({ videoUrl: url })}
      />

      <SingleFileUploader
        label="Floor plan"
        hint="Optional: an image of the layout"
        accept="image/*"
        url={value.floorPlanUrl}
        onChange={(url) => update({ floorPlanUrl: url })}
      />
    </div>
  );
}
