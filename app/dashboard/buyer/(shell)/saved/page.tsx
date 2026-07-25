import { SavedPanel } from "@/components/dashboard/buyer/panels";

export default function SavedPage() {
  return (
    <div>
      <h1 className="text-2xl font-medium tracking-[-0.02em] text-ink">Saved properties</h1>
      <p className="mt-1 text-sm text-body">Properties you&apos;ve shortlisted — select up to 3 to compare.</p>
      <div className="mt-6">
        <SavedPanel />
      </div>
    </div>
  );
}
