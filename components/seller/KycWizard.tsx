"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";
import { fmtDate } from "@/components/dashboard/shared";
import { getMyKyc, submitKyc, uploadKycFile } from "@/lib/api/seller";
import { ID_TYPE_LABEL, type IdType, type SellerKyc } from "@/types/seller";
import { RowSkeleton } from "@/components/Skeleton";

const ID_TYPES = Object.keys(ID_TYPE_LABEL) as IdType[];

function StatusCard({ kyc, onResubmit }: { kyc: SellerKyc; onResubmit: () => void }) {
  if (kyc.status === "APPROVED") {
    return (
      <div className="rounded-2xl bg-limepale p-6 ring-1 ring-lime/30">
        <p className="text-sm font-semibold text-ink">✓ KYC approved</p>
        <p className="mt-1 text-sm text-body">
          You&apos;re verified, so you can publish listings any time.
        </p>
      </div>
    );
  }
  if (kyc.status === "REJECTED") {
    return (
      <div className="rounded-2xl bg-red-50 p-6 ring-1 ring-red-200">
        <p className="text-sm font-semibold text-red-900">KYC rejected</p>
        {kyc.remarks && <p className="mt-1 text-sm text-red-800">{kyc.remarks}</p>}
        <button
          onClick={onResubmit}
          className="mt-4 rounded-full bg-panel px-5 py-2.5 text-xs font-medium text-white"
        >
          Resubmit KYC
        </button>
      </div>
    );
  }
  return (
    <div className="rounded-2xl bg-amber-50 p-6 ring-1 ring-amber-200">
      <p className="text-sm font-semibold text-amber-900">KYC pending review</p>
      <p className="mt-1 text-sm text-amber-800">
        Submitted{" "}
        {/* Was formatting inline, which printed the literal "Invalid Date" to the
            user whenever createdAt was absent or malformed. */}
        {fmtDate(kyc.createdAt)}
        . Our team usually reviews within 24 hours.
      </p>
    </div>
  );
}

export default function KycWizard({ onApproved }: { onApproved?: () => void }) {
  const { token } = useAuth();
  const router = useRouter();
  const [kyc, setKyc] = useState<SellerKyc | null | undefined>(undefined);
  const [showForm, setShowForm] = useState(false);
  const [step, setStep] = useState(0);

  const [idType, setIdType] = useState<IdType>("AADHAAR");
  const [idDocFile, setIdDocFile] = useState<File | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    getMyKyc(token)
      .then((k) => {
        setKyc(k);
        if (k?.status === "APPROVED") onApproved?.();
      })
      .catch(() => setKyc(null));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  if (kyc === undefined) {
    return (
      <div className="flex flex-col gap-3">
        <RowSkeleton />
      </div>
    );
  }

  if (kyc && !showForm) {
    return <StatusCard kyc={kyc} onResubmit={() => setShowForm(true)} />;
  }

  async function submit() {
    if (!token || !idDocFile || !selfieFile) return;
    setBusy(true);
    setError(null);
    try {
      const [doc, selfie] = await Promise.all([
        uploadKycFile(token, idDocFile),
        uploadKycFile(token, selfieFile),
      ]);
      const updated = await submitKyc(token, {
        idType,
        idDocUrl: doc.url,
        selfieUrl: selfie.url,
      });
      setKyc(updated);
      setShowForm(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to submit KYC");
    } finally {
      setBusy(false);
    }
  }

  const steps = ["ID type", "Upload ID", "Selfie", "Review"];

  return (
    <div className="rounded-2xl bg-white p-6 ring-1 ring-ink/5">
      <div className="flex items-center gap-2">
        {steps.map((label, i) => (
          <div key={label} className="flex flex-1 items-center gap-2">
            <span
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-medium ${
                i <= step ? "bg-panel text-white" : "bg-ink/10 text-ink/40"
              }`}
            >
              {i + 1}
            </span>
            <span className={`hidden text-xs sm:block ${i <= step ? "text-ink" : "text-ink/40"}`}>
              {label}
            </span>
            {i < steps.length - 1 && <span className="h-px flex-1 bg-ink/10" />}
          </div>
        ))}
      </div>

      <div className="mt-6">
        {step === 0 && (
          <div>
            <p className="text-sm font-medium text-ink">Choose an ID type</p>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {ID_TYPES.map((t) => (
                <button
                  key={t}
                  onClick={() => setIdType(t)}
                  className={`rounded-xl px-3 py-3 text-sm font-medium transition-colors ${
                    idType === t ? "bg-panel text-white" : "bg-ink/5 text-ink/70 hover:bg-ink/10"
                  }`}
                >
                  {ID_TYPE_LABEL[t]}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 1 && (
          <div>
            <p className="text-sm font-medium text-ink">Upload your {ID_TYPE_LABEL[idType]}</p>
            <p className="mt-1 text-xs text-body">A clear photo or scan, JPG/PNG/PDF.</p>
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => setIdDocFile(e.target.files?.[0] ?? null)}
              className="mt-4 block w-full text-sm text-ink/70 file:mr-4 file:rounded-full file:border-0 file:bg-panel file:px-4 file:py-2.5 file:text-xs file:font-medium file:text-white"
            />
            {idDocFile && <p className="mt-2 text-xs text-body">Selected: {idDocFile.name}</p>}
          </div>
        )}

        {step === 2 && (
          <div>
            <p className="text-sm font-medium text-ink">Upload a selfie</p>
            <p className="mt-1 text-xs text-body">A clear photo of your face, for identity verification.</p>
            <input
              type="file"
              accept="image/*"
              capture="user"
              onChange={(e) => setSelfieFile(e.target.files?.[0] ?? null)}
              className="mt-4 block w-full text-sm text-ink/70 file:mr-4 file:rounded-full file:border-0 file:bg-panel file:px-4 file:py-2.5 file:text-xs file:font-medium file:text-white"
            />
            {selfieFile && <p className="mt-2 text-xs text-body">Selected: {selfieFile.name}</p>}
          </div>
        )}

        {step === 3 && (
          <div>
            <p className="text-sm font-medium text-ink">Review &amp; submit</p>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-body">ID type</dt>
                <dd className="font-medium text-ink">{ID_TYPE_LABEL[idType]}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-body">ID document</dt>
                <dd className="font-medium text-ink">{idDocFile?.name ?? "-"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-body">Selfie</dt>
                <dd className="font-medium text-ink">{selfieFile?.name ?? "-"}</dd>
              </div>
            </dl>
            <p className="mt-3 text-xs text-body">
              Our team reviews KYC submissions within 24 hours. You&apos;ll be notified once approved.
            </p>
          </div>
        )}

        {error && <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

        <div className="mt-6 flex items-center justify-between">
          <button
            onClick={() => (step === 0 ? router.back() : setStep((s) => s - 1))}
            className="rounded-full bg-ink/5 px-5 py-2.5 text-sm font-medium text-ink/70 hover:bg-ink/10"
          >
            {step === 0 ? "Cancel" : "Back"}
          </button>
          {step < steps.length - 1 ? (
            <button
              onClick={() => setStep((s) => s + 1)}
              disabled={(step === 1 && !idDocFile) || (step === 2 && !selfieFile)}
              className="rounded-full bg-panel px-6 py-2.5 text-sm font-medium text-white disabled:opacity-40"
            >
              Next →
            </button>
          ) : (
            <button
              onClick={submit}
              disabled={busy}
              className="rounded-full bg-lime px-6 py-2.5 text-sm font-semibold text-ink disabled:opacity-60"
            >
              {busy ? "Submitting…" : "Submit KYC"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
