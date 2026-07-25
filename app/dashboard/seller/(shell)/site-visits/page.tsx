import { VisitsPanel } from "@/components/dashboard/seller/panels";

export default function SellerSiteVisitsPage() {
  return (
    <div>
      <h1 className="text-2xl font-medium tracking-[-0.02em] text-ink">Site visits</h1>
      <p className="mt-1 text-sm text-body">Tours buyers have requested on your properties.</p>
      <div className="mt-6">
        <VisitsPanel />
      </div>
    </div>
  );
}
