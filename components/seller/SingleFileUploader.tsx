"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { uploadPropertyMedia } from "@/lib/api/seller";

export default function SingleFileUploader({
  label,
  hint,
  accept,
  url,
  onChange,
}: {
  label: string;
  hint: string;
  accept: string;
  url: string | undefined;
  onChange: (url: string | undefined) => void;
}) {
  const { token } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File | null) {
    if (!file || !token) return;
    setBusy(true);
    setError(null);
    try {
      const { url } = await uploadPropertyMedia(token, file);
      onChange(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <p className="text-sm font-medium text-ink">{label}</p>
      {url ? (
        <div className="mt-2 flex items-center justify-between rounded-xl bg-cream px-4 py-3 text-sm">
          <span className="truncate text-ink/70">✓ Uploaded</span>
          <button
            type="button"
            onClick={() => onChange(undefined)}
            className="shrink-0 text-xs font-medium text-ink/50 underline underline-offset-2"
          >
            Remove
          </button>
        </div>
      ) : (
        <label className="mt-2 flex cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-ink/15 px-4 py-5 text-center hover:border-ink/30">
          <span className="text-sm font-medium text-ink">{busy ? "Uploading…" : "Upload"}</span>
          <span className="text-xs text-body">{hint}</span>
          <input
            type="file"
            accept={accept}
            disabled={busy}
            onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
            className="hidden"
          />
        </label>
      )}
      {error && <p className="mt-2 text-xs text-red-700">{error}</p>}
    </div>
  );
}
