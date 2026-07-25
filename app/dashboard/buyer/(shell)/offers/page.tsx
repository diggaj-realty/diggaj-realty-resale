import { OffersPanel } from "@/components/dashboard/buyer/panels";

export default function OffersPage() {
  return (
    <div>
      <h1 className="text-2xl font-medium tracking-[-0.02em] text-ink">Offers &amp; negotiation</h1>
      <p className="mt-1 text-sm text-body">Track every offer you&apos;ve made and respond to seller counters.</p>
      <div className="mt-6">
        <OffersPanel />
      </div>
    </div>
  );
}
