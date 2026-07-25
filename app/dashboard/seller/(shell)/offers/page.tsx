import { OffersPanel } from "@/components/dashboard/seller/panels";

export default function SellerOffersPage() {
  return (
    <div>
      <h1 className="text-2xl font-medium tracking-[-0.02em] text-ink">Offers</h1>
      <p className="mt-1 text-sm text-body">
        Forwarded offers on your properties — accept, reject, or counter.
      </p>
      <div className="mt-6">
        <OffersPanel />
      </div>
    </div>
  );
}
