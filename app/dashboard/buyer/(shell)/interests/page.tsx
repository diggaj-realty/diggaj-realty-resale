import { InterestsPanel } from "@/components/dashboard/buyer/panels";

export default function BuyerInterestsPage() {
  return (
    <div>
      <h1 className="text-2xl font-medium tracking-[-0.02em] text-ink">Interests</h1>
      <p className="mt-1 text-sm text-body">
        Properties you&apos;ve expressed interest in: agent contact, site visits, and negotiation
        progress, before any formal offer.
      </p>
      <div className="mt-6">
        <InterestsPanel />
      </div>
    </div>
  );
}
