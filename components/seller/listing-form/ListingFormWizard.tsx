"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { createListing, getMyKyc } from "@/lib/api/seller";
import { ApiError } from "@/lib/api/client";
import { INITIAL_FORM_STATE, toCreatePayload, validateStep, type ListingFormState } from "./formState";
import BasicsStep from "./steps/BasicsStep";
import LocationStep from "./steps/LocationStep";
import AreaConfigStep from "./steps/AreaConfigStep";
import LegalProjectStep from "./steps/LegalProjectStep";
import MediaStep from "./steps/MediaStep";
import AmenitiesStep from "./steps/AmenitiesStep";
import ReviewStep from "./steps/ReviewStep";

const STEPS = ["Basics", "Location", "Area & Config", "Legal & Project", "Media", "Amenities", "Review"];

type KycGate = "checking" | "blocked-pending" | "blocked-rejected" | "blocked-none" | "clear";

export default function ListingFormWizard({ mapsApiKey }: { mapsApiKey?: string }) {
  const { token } = useAuth();
  const router = useRouter();
  const [gate, setGate] = useState<KycGate>("checking");
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<ListingFormState>(INITIAL_FORM_STATE);
  const [stepError, setStepError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [created, setCreated] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    getMyKyc(token)
      .then((kyc) => {
        if (!kyc) setGate("blocked-none");
        else if (kyc.status === "APPROVED") setGate("clear");
        else if (kyc.status === "REJECTED") setGate("blocked-rejected");
        else setGate("blocked-pending");
      })
      .catch(() => setGate("blocked-none"));
  }, [token]);

  function update(patch: Partial<ListingFormState>) {
    setForm((f) => ({ ...f, ...patch }));
  }

  function next() {
    const err = validateStep(step, form);
    if (err) {
      setStepError(err);
      return;
    }
    setStepError(null);
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }
  function back() {
    setStepError(null);
    setStep((s) => Math.max(s - 1, 0));
  }

  async function submit() {
    if (!token) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const property = await createListing(token, toCreatePayload(form));
      setCreated(property.id);
    } catch (e) {
      setSubmitError(e instanceof ApiError ? e.message : "Failed to submit listing");
    } finally {
      setSubmitting(false);
    }
  }

  if (gate === "checking") {
    return <p className="text-sm text-body">Checking your verification status…</p>;
  }

  if (gate !== "clear") {
    const copy: Record<Exclude<KycGate, "checking" | "clear">, string> = {
      "blocked-none": "You need to complete KYC verification before you can create a listing.",
      "blocked-pending": "Your KYC is still under review. You can create a listing once it's approved.",
      "blocked-rejected": "Your KYC was rejected. Please resubmit before creating a listing.",
    };
    return (
      <div className="rounded-2xl bg-amber-50 p-6 text-sm text-amber-900 ring-1 ring-amber-200">
        <p>{copy[gate]}</p>
        <Link
          href="/dashboard/seller/kyc"
          className="mt-4 inline-block rounded-full bg-panel px-5 py-2.5 text-xs font-medium text-white"
        >
          {gate === "blocked-none" ? "Start KYC" : "Go to KYC"} →
        </Link>
      </div>
    );
  }

  if (created) {
    return (
      <div className="flex flex-col items-center rounded-2xl bg-limepale px-8 py-14 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-lime text-2xl text-ink">
          ✓
        </span>
        <p className="mt-5 text-xl font-medium text-ink">Listing submitted</p>
        <p className="mt-2 max-w-xs text-sm text-body">
          It&apos;s saved as a draft and in our review queue — usually reviewed within 24 hours.
        </p>
        <Link href="/dashboard/seller" className="mt-6 rounded-full bg-panel px-6 py-3 text-sm text-white">
          Back to dashboard →
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white p-6 ring-1 ring-ink/5">
      {/* progress */}
      <div className="-mx-6 flex gap-1.5 overflow-x-auto px-6 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {STEPS.map((label, i) => (
          <button
            key={label}
            type="button"
            onClick={() => i < step && setStep(i)}
            className={`shrink-0 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              i === step
                ? "bg-panel text-white"
                : i < step
                ? "bg-lime/40 text-ink"
                : "bg-ink/5 text-ink/40"
            }`}
          >
            {i + 1}. {label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {step === 0 && <BasicsStep value={form} update={update} />}
        {step === 1 && <LocationStep value={form} update={update} mapsApiKey={mapsApiKey} />}
        {step === 2 && <AreaConfigStep value={form} update={update} />}
        {step === 3 && <LegalProjectStep value={form} update={update} />}
        {step === 4 && <MediaStep value={form} update={update} />}
        {step === 5 && <AmenitiesStep value={form} update={update} />}
        {step === 6 && <ReviewStep value={form} />}

        {stepError && <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{stepError}</p>}
        {submitError && <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{submitError}</p>}

        <div className="mt-6 flex items-center justify-between border-t border-ink/5 pt-6">
          <button
            onClick={() => (step === 0 ? router.push("/dashboard/seller") : back())}
            className="rounded-full bg-ink/5 px-5 py-2.5 text-sm font-medium text-ink/70 hover:bg-ink/10"
          >
            {step === 0 ? "Cancel" : "Back"}
          </button>
          {step < STEPS.length - 1 ? (
            <button
              onClick={next}
              className="rounded-full bg-panel px-6 py-2.5 text-sm font-medium text-white"
            >
              Next →
            </button>
          ) : (
            <button
              onClick={submit}
              disabled={submitting}
              className="rounded-full bg-lime px-6 py-2.5 text-sm font-semibold text-ink disabled:opacity-60"
            >
              {submitting ? "Submitting…" : "Submit listing"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
