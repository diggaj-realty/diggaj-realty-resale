"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import StatusBadge from "@/components/dashboard/StatusBadge";
import { fmtDate } from "@/components/dashboard/shared";
import { requestDocument, cancelDocumentRequest } from "@/lib/api/documentRequests";
import type { DocumentRequest } from "@/types/transaction";
import type { UserRole } from "@/types/auth";

const OPEN_STATUSES = ["PENDING_AGENT_REVIEW", "FORWARDED_TO_OWNER"];

/** Cross-party document requests — never a direct buyer↔seller channel;
 *  every request lands on the deal's advisor first. This side of the app can
 *  only request a document and, while still open, withdraw one it made
 *  itself — reviewing (reject/forward/share) is advisor-only. Once an advisor
 *  shares an existing approved document, it simply appears in the document
 *  checklist above (access-grant aware) — no separate viewer here. */
export default function DocumentRequestPanel({
  dealId,
  viewerRole,
  viewerId,
  requests,
  onChanged,
}: {
  dealId: string;
  viewerRole: UserRole;
  viewerId: string | undefined;
  requests: DocumentRequest[];
  onChanged?: () => void;
}) {
  const { token } = useAuth();
  const [open, setOpen] = useState(false);
  const [docType, setDocType] = useState("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !docType.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      await requestDocument(token, dealId, docType.trim(), reason.trim() || undefined);
      setDocType("");
      setReason("");
      setOpen(false);
      onChanged?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit request");
    } finally {
      setSubmitting(false);
    }
  }

  async function cancel(requestId: string) {
    if (!token) return;
    setBusyId(requestId);
    try {
      await cancelDocumentRequest(token, dealId, requestId);
      onChanged?.();
    } finally {
      setBusyId(null);
    }
  }

  const counterpartLabel = viewerRole === "BUYER" ? "seller" : "buyer";

  return (
    <div className="flex flex-col gap-3">
      {requests.length === 0 && !open && <p className="text-sm text-body">No document requests yet.</p>}

      {requests.map((r) => {
        const mine = r.requestedById === viewerId;
        const cancellable = mine && OPEN_STATUSES.includes(r.status);
        return (
          <div key={r.id} className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-ink/5">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-ink">{r.docType}</p>
                <p className="text-xs text-body">
                  {mine ? `Requested from the ${counterpartLabel}` : "Requested from you"}
                </p>
              </div>
              <StatusBadge status={r.status} />
            </div>
            {r.reason && <p className="mt-2 text-xs text-body">&ldquo;{r.reason}&rdquo;</p>}
            {r.status === "REJECTED" && r.reviewRemarks && (
              <p className="mt-2 text-xs text-red-800">Advisor note: {r.reviewRemarks}</p>
            )}
            <p className="mt-2 text-[11px] text-ink/40">{fmtDate(r.createdAt)}</p>
            {cancellable && (
              <button
                onClick={() => cancel(r.id)}
                disabled={busyId === r.id}
                className="mt-3 text-xs font-medium text-red-700 underline underline-offset-2 disabled:opacity-50"
              >
                {busyId === r.id ? "Withdrawing…" : "Withdraw request"}
              </button>
            )}
          </div>
        );
      })}

      {open ? (
        <form onSubmit={submit} className="rounded-2xl bg-cream p-4">
          <label className="flex flex-col gap-1.5 text-sm text-ink">
            Document type
            <input
              required
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
              placeholder="e.g. Aadhaar Card"
              className="rounded-xl border border-ink/10 bg-white px-4 py-2.5 text-sm outline-none focus:border-ink/30"
            />
          </label>
          <label className="mt-3 flex flex-col gap-1.5 text-sm text-ink">
            Reason <span className="font-normal text-body">(optional)</span>
            <textarea
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="resize-none rounded-xl border border-ink/10 bg-white px-4 py-2.5 text-sm outline-none focus:border-ink/30"
            />
          </label>
          {error && <p className="mt-3 text-xs text-red-700">{error}</p>}
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-full bg-ink/5 px-4 py-2 text-xs font-medium text-ink/70 hover:bg-ink/10"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-full bg-panel px-4 py-2 text-xs font-medium text-white disabled:opacity-50"
            >
              {submitting ? "Sending…" : "Send request"}
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="self-start rounded-full bg-ink/5 px-4 py-2 text-xs font-medium text-ink/70 hover:bg-ink/10"
        >
          Request a document from the {counterpartLabel} →
        </button>
      )}
    </div>
  );
}
