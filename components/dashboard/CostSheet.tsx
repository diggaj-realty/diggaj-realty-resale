"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { price } from "@/lib/listings";
import { BlockedNotice } from "@/components/dashboard/shared";
import { respondToCostSheet } from "@/lib/api/buyer";
import type { CostSheet as CostSheetData, CostSheetLine } from "@/types/transaction";

/** The buyer-only breakdown of what they'll pay — property price, parking,
 *  club membership, stamp duty, registration, minus any discount. Every row
 *  here is exactly what's shown, with internal lines already stripped and
 *  the total recomputed server-side from what remains: never recompute it
 *  here. A revised sheet is a new version needing fresh acknowledgement —
 *  an already-accepted figure never changes underneath the buyer. */
export default function CostSheet({
  dealId,
  sheet,
  onChanged,
}: {
  dealId: string;
  sheet: CostSheetData;
  onChanged?: () => void;
}) {
  const { token } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [queryingLineId, setQueryingLineId] = useState<string | null>(null);
  const [note, setNote] = useState("");

  const canAcknowledge = !sheet.acknowledgedAt && !sheet.isQueryOpen;

  async function acknowledge() {
    if (!token) return;
    setBusy(true);
    setError(null);
    try {
      await respondToCostSheet(token, dealId, sheet.id, { action: "acknowledge" });
      onChanged?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to acknowledge");
    } finally {
      setBusy(false);
    }
  }

  async function submitQuery(lineId: string) {
    if (!token || !note.trim()) return;
    setBusy(true);
    setError(null);
    try {
      await respondToCostSheet(token, dealId, sheet.id, { action: "query", lineId, note: note.trim() });
      setQueryingLineId(null);
      setNote("");
      onChanged?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to send your question");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-ink/5">
      <div className="flex items-start justify-between gap-4">
        <p className="text-sm font-medium text-ink">Version {sheet.version}</p>
        <p className="text-lg font-semibold text-ink">{price(sheet.total)}</p>
      </div>

      {sheet.isQueryOpen ? (
        <div className="mt-3">
          <BlockedNotice
            title="A question is open on this sheet"
            meta="A Diggaj coordinator needs to answer it before you can acknowledge this version."
          />
        </div>
      ) : sheet.acknowledgedAt ? (
        <p className="mt-3 rounded-2xl bg-limepale px-4 py-2.5 text-sm font-medium text-ink">
          You acknowledged this breakdown.
        </p>
      ) : (
        <p className="mt-3 text-sm text-body">Review the breakdown below before acknowledging.</p>
      )}

      <div className="mt-4 flex flex-col divide-y divide-ink/5 border-t border-ink/5">
        {sheet.lines.map((line) => (
          <CostSheetRow
            key={line.id}
            line={line}
            isQueried={sheet.queriedLineId === line.id}
            querying={queryingLineId === line.id}
            note={note}
            onNoteChange={setNote}
            onStartQuery={() => {
              setQueryingLineId(line.id);
              setNote("");
            }}
            onCancelQuery={() => setQueryingLineId(null)}
            onSubmitQuery={() => submitQuery(line.id)}
            busy={busy}
            canQuery={!sheet.isQueryOpen && !sheet.acknowledgedAt}
          />
        ))}
      </div>

      {canAcknowledge && (
        <div className="mt-4 border-t border-ink/5 pt-4">
          <button
            onClick={acknowledge}
            disabled={busy}
            className="rounded-full bg-lime px-5 py-2.5 text-xs font-semibold text-ink disabled:opacity-50"
          >
            {busy ? "Please wait…" : "Acknowledge breakdown"}
          </button>
        </div>
      )}
      {error && <p className="mt-2 text-xs text-red-700">{error}</p>}
    </div>
  );
}

function CostSheetRow({
  line,
  isQueried,
  querying,
  note,
  onNoteChange,
  onStartQuery,
  onCancelQuery,
  onSubmitQuery,
  busy,
  canQuery,
}: {
  line: CostSheetLine;
  isQueried: boolean;
  querying: boolean;
  note: string;
  onNoteChange: (v: string) => void;
  onStartQuery: () => void;
  onCancelQuery: () => void;
  onSubmitQuery: () => void;
  busy: boolean;
  canQuery: boolean;
}) {
  const isDeduction = line.category === "DEDUCTION";
  return (
    <div className={`py-3 ${isQueried ? "rounded-xl bg-amber-50 px-3 ring-1 ring-amber-200" : ""}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-sm text-ink">
            {line.label}
            {line.isEstimate && (
              <span className="inline-block rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-900 ring-1 ring-amber-200">
                Estimate
              </span>
            )}
          </p>
          {line.note && <p className="mt-0.5 text-xs text-body">{line.note}</p>}
          {isQueried && <p className="mt-1 text-xs font-medium text-amber-800">Your question on this line is open.</p>}
        </div>
        <p className={`shrink-0 text-sm font-medium ${isDeduction ? "text-red-700" : "text-ink"}`}>
          {isDeduction ? "− " : ""}
          {price(Math.abs(line.amount))}
        </p>
      </div>

      {canQuery && !isQueried && (
        <div className="mt-1.5">
          {querying ? (
            <div className="flex flex-col gap-2">
              <textarea
                rows={2}
                value={note}
                onChange={(e) => onNoteChange(e.target.value)}
                placeholder="What is this charge for?"
                className="resize-none rounded-xl border border-ink/10 bg-white px-3 py-2 text-sm outline-none focus:border-ink/30"
              />
              <div className="flex gap-2">
                <button
                  onClick={onSubmitQuery}
                  disabled={busy || !note.trim()}
                  className="rounded-full bg-panel px-4 py-1.5 text-xs font-medium text-white disabled:opacity-50"
                >
                  Send
                </button>
                <button
                  onClick={onCancelQuery}
                  className="rounded-full px-4 py-1.5 text-xs font-medium text-body underline underline-offset-4"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={onStartQuery}
              className="text-xs font-medium text-body underline underline-offset-4"
            >
              What&apos;s this?
            </button>
          )}
        </div>
      )}
    </div>
  );
}
