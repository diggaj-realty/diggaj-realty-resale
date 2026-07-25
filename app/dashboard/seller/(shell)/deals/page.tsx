import { DealsPanel } from "@/components/dashboard/seller/panels";

export default function SellerDealsPage() {
  return (
    <div>
      <h1 className="text-2xl font-medium tracking-[-0.02em] text-ink">Deals</h1>
      <p className="mt-1 text-sm text-body">Closing progress and payment milestones for accepted offers.</p>
      <div className="mt-6">
        <DealsPanel />
      </div>
    </div>
  );
}
