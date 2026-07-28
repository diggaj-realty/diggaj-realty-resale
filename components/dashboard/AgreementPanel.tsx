"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { price } from "@/lib/listings";
import StatusBadge from "@/components/dashboard/StatusBadge";
import { initiateSignature } from "@/lib/api/dealCompliance";
import type { DealAgreement } from "@/types/transaction";

const ENDED = ["CANCELLED", "EXPIRED"];

/** The current (latest-version) agreement and its signature state. A signed
 *  agreement version is never edited — a new version means a fresh signing
 *  round — so this always renders the newest version only; the caller
 *  should note when older versions exist rather than showing them as if
 *  still current. A party may only initiate their OWN signature; actually
 *  completing one (SIGNED) requires a verified provider callback, staff-only
 *  today until a real signing provider is wired up. */
export default function AgreementPanel({
  dealId,
  agreement,
  viewerId,
  onChanged,
}: {
  dealId: string;
  agreement: DealAgreement;
  viewerId: string | undefined;
  onChanged?: () => void;
}) {
  const { token } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mySignature = agreement.signatures.find((s) => s.userId === viewerId) ?? null;
  const canInitiate = !!mySignature && mySignature.status !== "SIGNED" && !ENDED.includes(agreement.status);

  async function start() {
    if (!token || !mySignature) return;
    setBusy(true);
    setError(null);
    try {
      await initiateSignature(token, dealId, agreement.id);
      onChanged?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to start signing");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-ink/5">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm font-medium text-ink">Agreement v{agreement.version}</p>
        <StatusBadge status={agreement.status} />
      </div>
      {agreement.agreedAmount != null && (
        <p className="mt-2 text-sm text-body">
          Agreed amount: <span className="font-semibold text-ink">{price(agreement.agreedAmount)}</span>
        </p>
      )}
      {agreement.documentUrl && (
        <a
          href={agreement.documentUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-block text-xs font-medium text-ink underline underline-offset-2"
        >
          View agreement document →
        </a>
      )}

      <div className="mt-3 grid grid-cols-2 gap-3 border-t border-ink/5 pt-3">
        <div>
          <p className="text-[11px] text-body">Buyer</p>
          <p className={`text-sm ${agreement.buyerSigned ? "text-ink" : "text-ink/50"}`}>
            {agreement.buyerSigned ? "✓ Signed" : "⏳ Awaiting signature"}
          </p>
        </div>
        <div>
          <p className="text-[11px] text-body">Seller</p>
          <p className={`text-sm ${agreement.sellerSigned ? "text-ink" : "text-ink/50"}`}>
            {agreement.sellerSigned ? "✓ Signed" : "⏳ Awaiting signature"}
          </p>
        </div>
      </div>

      {canInitiate && (
        <div className="mt-4 border-t border-ink/5 pt-4">
          <button
            onClick={start}
            disabled={busy || mySignature?.status === "INITIATED"}
            className="rounded-full bg-panel px-4 py-2 text-xs font-medium text-white disabled:opacity-50"
          >
            {mySignature?.status === "INITIATED" ? "Signing started…" : busy ? "Starting…" : "Start signing"}
          </button>
          {error && <p className="mt-2 text-xs text-red-700">{error}</p>}
        </div>
      )}
    </div>
  );
}
