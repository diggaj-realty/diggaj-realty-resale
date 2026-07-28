import Link from "next/link";
import InterestDetail from "@/components/dashboard/InterestDetail";

export default async function BuyerInterestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div>
      <Link href="/dashboard/buyer/interests" className="text-xs font-medium text-ink/70 underline underline-offset-2">
        ← Back to Interests
      </Link>
      <h1 className="mt-3 text-2xl font-medium tracking-[-0.02em] text-ink">Interest</h1>
      <p className="mt-1 text-sm text-body">Agent, site visits, and negotiation progress for this lead.</p>
      <div className="mt-6">
        <InterestDetail interestId={id} viewerRole="BUYER" />
      </div>
    </div>
  );
}
