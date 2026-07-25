import { ClosingPanel } from "@/components/dashboard/buyer/panels";

export default function ClosingPage() {
  return (
    <div>
      <h1 className="text-2xl font-medium tracking-[-0.02em] text-ink">Closing &amp; documents</h1>
      <p className="mt-1 text-sm text-body">Once an offer is accepted, track payments and paperwork here.</p>
      <div className="mt-6">
        <ClosingPanel />
      </div>
    </div>
  );
}
