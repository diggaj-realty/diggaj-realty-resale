import { InterestsPanel } from "@/components/dashboard/seller/panels";

export default function SellerInterestsPage() {
  return (
    <div>
      <h1 className="text-2xl font-medium tracking-[-0.02em] text-ink">Buyer Interests</h1>
      <p className="mt-1 text-sm text-body">
        Buyers engaging with your listings, before any formal offer reaches you.
      </p>
      <div className="mt-6">
        <InterestsPanel />
      </div>
    </div>
  );
}
