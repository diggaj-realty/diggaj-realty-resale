"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { price } from "@/lib/listings";
import StatusBadge from "@/components/dashboard/StatusBadge";
import { fmtDate } from "@/components/dashboard/shared";
import { initiatePayment } from "@/lib/api/buyer";
import type { PaymentRequest } from "@/types/buyer";
import type { UserRole } from "@/types/auth";

/** Payment requests raised against a deal. `initiate` ("I've started paying")
 *  is the only lifecycle action a buyer/seller may ever call — marking a
 *  request PAID/FAILED/CANCELLED is staff-only server-side, so there's
 *  deliberately no such button here, optimistic or otherwise. */
export default function PaymentRequests({
  requests,
  viewerRole,
  dealId,
  onChanged,
}: {
  requests: PaymentRequest[];
  viewerRole: UserRole;
  dealId: string;
  onChanged?: () => void;
}) {
  const { token } = useAuth();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<{ requestId: string; message: string } | null>(null);

  async function initiate(requestId: string) {
    if (!token) return;
    setBusyId(requestId);
    setError(null);
    try {
      await initiatePayment(token, dealId, requestId);
      onChanged?.();
    } catch (e) {
      setError({ requestId, message: e instanceof Error ? e.message : "Failed to start payment" });
    } finally {
      setBusyId(null);
    }
  }

  if (requests.length === 0) {
    return <p className="text-sm text-body">No payment requests yet.</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {requests.map((r) => {
        const isPayer = r.recipient === viewerRole;
        const canInitiate = isPayer && r.status === "PENDING";
        return (
          <div key={r.id} className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-ink/5">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-ink">{r.title ?? "Payment request"}</p>
                {r.description && <p className="truncate text-xs text-body">{r.description}</p>}
              </div>
              <StatusBadge status={r.status} />
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-1 text-sm">
              <span className="text-body">
                Amount: <span className="font-semibold text-ink">{price(r.amount)}</span>
              </span>
              <span className="text-body">
                {isPayer ? "You owe this" : `Owed by ${r.recipient.toLowerCase()}`}
              </span>
            </div>

            <div className="mt-2 space-y-0.5 text-xs text-body">
              {r.dueDate && <p>Due {fmtDate(r.dueDate)}</p>}
              {r.paymentRef && <p>Reference: {r.paymentRef}</p>}
              {r.paidAt && <p>Paid on {fmtDate(r.paidAt)}</p>}
            </div>

            {canInitiate && (
              <div className="mt-4 border-t border-ink/5 pt-4">
                <button
                  onClick={() => initiate(r.id)}
                  disabled={busyId === r.id}
                  className="rounded-full bg-panel px-4 py-2 text-xs font-medium text-white disabled:opacity-50"
                >
                  {busyId === r.id ? "Starting…" : "Start payment →"}
                </button>
              </div>
            )}
            {error?.requestId === r.id && <p className="mt-2 text-xs text-red-700">{error.message}</p>}
          </div>
        );
      })}
    </div>
  );
}
