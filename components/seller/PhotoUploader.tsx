"use client";

import Image from "next/image";
import { useState } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { uploadPropertyMedia } from "@/lib/api/seller";

const MAX_PHOTOS = 15; // mirrors AppConfig.maxPhotosPerListing (not exposed via public API)

export default function PhotoUploader({
  photoUrls,
  onChange,
}: {
  photoUrls: string[];
  onChange: (urls: string[]) => void;
}) {
  const { token } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [error, setError] = useState<string | null>(null);

  const remaining = MAX_PHOTOS - photoUrls.length;

  async function handleFiles(files: FileList | null) {
    if (!files || !token || remaining <= 0) return;
    const toUpload = Array.from(files).slice(0, remaining);
    setUploading(true);
    setError(null);
    setProgress({ done: 0, total: toUpload.length });
    const uploaded: string[] = [];
    try {
      for (const file of toUpload) {
        const { url } = await uploadPropertyMedia(token, file);
        uploaded.push(url);
        setProgress((p) => ({ ...p, done: p.done + 1 }));
      }
      onChange([...photoUrls, ...uploaded]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Some photos failed to upload");
      if (uploaded.length) onChange([...photoUrls, ...uploaded]);
    } finally {
      setUploading(false);
    }
  }

  function remove(index: number) {
    onChange(photoUrls.filter((_, i) => i !== index));
  }
  function move(index: number, dir: -1 | 1) {
    const next = [...photoUrls];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-ink">Photos</p>
        <span className="text-xs text-body">
          {photoUrls.length}/{MAX_PHOTOS}
        </span>
      </div>

      {photoUrls.length > 0 && (
        <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
          {photoUrls.map((url, i) => (
            <div key={url} className="group relative aspect-square overflow-hidden rounded-xl bg-cream">
              <Image src={url} alt={`Photo ${i + 1}`} fill sizes="150px" className="object-cover" />
              {i === 0 && (
                <span className="absolute left-1.5 top-1.5 rounded-full bg-lime px-2 py-0.5 text-[10px] font-semibold text-ink">
                  Cover
                </span>
              )}
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-black/60 px-1.5 py-1 opacity-0 transition-opacity group-hover:opacity-100">
                <div className="flex gap-0.5">
                  <button
                    type="button"
                    onClick={() => move(i, -1)}
                    disabled={i === 0}
                    className="rounded px-1.5 py-0.5 text-xs text-white disabled:opacity-30"
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    onClick={() => move(i, 1)}
                    disabled={i === photoUrls.length - 1}
                    className="rounded px-1.5 py-0.5 text-xs text-white disabled:opacity-30"
                  >
                    →
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => remove(i)}
                  className="rounded px-1.5 py-0.5 text-xs text-white"
                  aria-label="Remove photo"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {remaining > 0 && (
        <label className="mt-3 flex cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-ink/15 px-4 py-6 text-center hover:border-ink/30">
          <span className="text-sm font-medium text-ink">
            {uploading ? `Uploading ${progress.done}/${progress.total}…` : "Add photos"}
          </span>
          <span className="text-xs text-body">Up to {remaining} more · JPG/PNG</span>
          <input
            type="file"
            accept="image/*"
            multiple
            disabled={uploading}
            onChange={(e) => handleFiles(e.target.files)}
            className="hidden"
          />
        </label>
      )}

      {error && <p className="mt-2 text-xs text-red-700">{error}</p>}
    </div>
  );
}
