import PlansPanel from "@/components/dashboard/seller/PlansPanel";

export default function SellerPlansPage() {
  return (
    <div>
      <h1 className="text-2xl font-medium tracking-[-0.02em] text-ink">Plans</h1>
      <p className="mt-1 text-sm text-body">Boost your listing&apos;s visibility with a higher plan.</p>
      <div className="mt-6">
        <PlansPanel />
      </div>
    </div>
  );
}
