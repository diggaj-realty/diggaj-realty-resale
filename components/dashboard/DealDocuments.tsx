"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { authedUpload } from "@/lib/api/authed";
import { getDealDocuments, uploadDealDocument } from "@/lib/api/buyer";
import { RowSkeleton } from "@/components/Skeleton";
import type { DealDocument } from "@/types/buyer";
import type { UserRole } from "@/types/auth";

const STATUS_STYLE: Record<DealDocument["status"], { label: string; className: string }> = {
  PENDING: { label: "Awaiting upload", className: "bg-ink/5 text-ink/70 ring-ink/10" },
  UPLOADED: { label: "Under review", className: "bg-sky-100 text-sky-900 ring-sky-200" },
  APPROVED: { label: "Approved", className: "bg-limepale text-ink ring-lime/40" },
  REJECTED: { label: "Rejected", className: "bg-red-100 text-red-900 ring-red-200" },
};

/** The other party's required-from label, for context (e.g. seller sees
 *  "Required from you" vs "Required from buyer"). */
function requiredFromLabel(doc: DealDocument, viewerRole: UserRole) {
  if (doc.requiredFrom === "EITHER") return "Required from either party";
  return doc.requiredFrom === viewerRole ? "Required from you" : `Required from ${doc.requiredFrom.toLowerCase()}`;
}

export default function DealDocuments({ dealId, viewerRole }: { dealId: string; viewerRole: UserRole }) {
  const { token } = useAuth();
  const [docs, setDocs] = useState<DealDocument[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    getDealDocuments(token, dealId)
      .then(setDocs)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load documents"));
  }, [token, dealId]);

  async function upload(doc: DealDocument, file: File) {
    if (!token) return;
    setBusyId(doc.id);
    setError(null);
    try {
      const { url } = await authedUpload(token, file, "deal-documents");
      const updated = await uploadDealDocument(token, dealId, doc.id, url);
      setDocs((prev) => prev?.map((d) => (d.id === doc.id ? updated : d)) ?? null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusyId(null);
    }
  }

  if (error) return <p className="text-sm text-red-700">{error}</p>;
  if (docs === null) return <RowSkeleton />;
  if (docs.length === 0) {
    return <p className="text-sm text-body">No documents requested yet — your agent will add these as the deal progresses.</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {docs.map((doc) => {
        const canUpload =
          (doc.requiredFrom === "EITHER" || doc.requiredFrom === viewerRole) &&
          (doc.status === "PENDING" || doc.status === "REJECTED");
        const style = STATUS_STYLE[doc.status];
        return (
          <div key={doc.id} className="rounded-xl bg-cream px-4 py-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-ink">{doc.docType}</p>
                <p className="text-xs text-body">{requiredFromLabel(doc, viewerRole)}</p>
              </div>
              <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${style.className}`}>
                {style.label}
              </span>
            </div>

            {doc.status === "REJECTED" && doc.remarks && (
              <p className="mt-2 text-xs text-red-800">Reviewer note: {doc.remarks}</p>
            )}

            {doc.fileUrl && (
              <a
                href={doc.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-block text-xs font-medium text-ink underline underline-offset-2"
              >
                View uploaded file →
              </a>
            )}

            {canUpload && (
              <div className="mt-3">
                <input
                  type="file"
                  accept="image/*,.pdf"
                  disabled={busyId === doc.id}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) upload(doc, file);
                  }}
                  className="block w-full text-xs text-ink/70 file:mr-3 file:rounded-full file:border-0 file:bg-panel file:px-3 file:py-2 file:text-xs file:font-medium file:text-white disabled:opacity-60"
                />
                {busyId === doc.id && <p className="mt-1 text-xs text-body">Uploading…</p>}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
