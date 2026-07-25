import { VisitsPanel } from "@/components/dashboard/buyer/panels";

export default function SiteVisitsPage() {
  return (
    <div>
      <h1 className="text-2xl font-medium tracking-[-0.02em] text-ink">Site visits</h1>
      <p className="mt-1 text-sm text-body">Tours you&apos;ve requested, scheduled, or completed.</p>
      <div className="mt-6">
        <VisitsPanel />
      </div>
    </div>
  );
}
