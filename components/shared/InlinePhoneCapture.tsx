"use client";

import { useState } from "react";

/** A single inline phone-number prompt, reused wherever the backend responds
 *  that a phone number is needed before an action can proceed (Google
 *  sign-in with no phone, raising interest with no phone on file, the
 *  post-save "contact me" prompt). No client-side format validation or
 *  normalization — the server does both and returns its own message on a
 *  bad format, surfaced via `error`. */
export default function InlinePhoneCapture({
  prompt,
  submitting,
  error,
  onSubmit,
  onCancel,
}: {
  prompt: string;
  submitting: boolean;
  error?: string | null;
  onSubmit: (phone: string) => void;
  onCancel?: () => void;
}) {
  const [phone, setPhone] = useState("");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(phone);
      }}
      className="flex flex-col gap-2"
    >
      <p className="text-sm text-ink">{prompt}</p>
      <input
        required
        type="tel"
        autoFocus
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="98765 43210"
        className="rounded-xl border border-ink/10 bg-white px-4 py-3 text-sm outline-none focus:border-ink/30"
      />
      {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-full bg-panel px-6 py-3 text-sm font-medium text-white transition-transform hover:-translate-y-px disabled:opacity-60"
        >
          {submitting ? "Please wait…" : "Continue"}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full px-6 py-3 text-sm font-medium text-body underline underline-offset-4"
          >
            Not now
          </button>
        )}
      </div>
    </form>
  );
}
