import Link from "next/link";
import TransactionDetail from "@/components/dashboard/TransactionDetail";

export default async function SellerTransactionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div>
      <Link href="/dashboard/seller/deals" className="text-xs font-medium text-ink/70 underline underline-offset-2">
        ← Back to Deals
      </Link>
      <h1 className="mt-3 text-2xl font-medium tracking-[-0.02em] text-ink">Transaction</h1>
      <p className="mt-1 text-sm text-body">Everything about this deal, from acceptance to close.</p>
      <div className="mt-6">
        <TransactionDetail dealId={id} viewerRole="SELLER" />
      </div>
    </div>
  );
}
