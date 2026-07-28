"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import StatusBadge from "@/components/dashboard/StatusBadge";
import { initiateIdentityVerification } from "@/lib/api/dealCompliance";
import type { IdentityVerificationSummary } from "@/types/transaction";

const RETRIABLE = ["PENDING", "FAILED", "EXPIRED"];

/** Per-deal identity verification, independent for buyer and seller —
 *  distinct from seller KYC and from uploading an ID document. A party can
 *  only ever start their own verification (never the other party's); actual
 *  completion requires a verified provider callback, which today is a
 *  staff-only manual step until a real provider is wired up. */
export default function IdentityVerificationPanel({
  dealId,
  summary,
  viewerId,
  buyerId,
  sellerId,
  onChanged,
}: {
  dealId: string;
  summary: IdentityVerificationSummary;
  viewerId: string | undefined;
  buyerId: string;
  sellerId: string;
  onChanged?: () => void;
}) {
  const { token } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const buyerRecord = summary.verifications.find((v) => v.userId === buyerId) ?? null;
  const sellerRecord = summary.verifications.find((v) => v.userId === sellerId) ?? null;
  const myRecord = viewerId === buyerId ? buyerRecord : viewerId === sellerId ? sellerRecord : null;
  const canStart = (viewerId === buyerId || viewerId === sellerId) && (!myRecord || RETRIABLE.includes(myRecord.status));

  async function start() {
    if (!token) return;
    setBusy(true);
    setError(null);
    try {
      await initiateIdentityVerification(token, dealId);
      onChanged?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to start verification");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-ink/5">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-[11px] text-body">Buyer</p>
          <div className="mt-1">
            <StatusBadge status={buyerRecord?.status ?? "PENDING"} />
          </div>
        </div>
        <div>
          <p className="text-[11px] text-body">Seller</p>
          <div className="mt-1">
            <StatusBadge status={sellerRecord?.status ?? "PENDING"} />
          </div>
        </div>
      </div>

      {myRecord?.status === "FAILED" && myRecord.remarks && (
        <p className="mt-3 text-xs text-red-800">Reason: {myRecord.remarks}</p>
      )}

      {canStart && (
        <div className="mt-4 border-t border-ink/5 pt-4">
          <button
            onClick={start}
            disabled={busy}
            className="rounded-full bg-panel px-4 py-2 text-xs font-medium text-white disabled:opacity-50"
          >
            {busy ? "Starting…" : myRecord ? "Retry verification" : "Verify my identity"}
          </button>
          {error && <p className="mt-2 text-xs text-red-700">{error}</p>}
        </div>
      )}
    </div>
  );
}
