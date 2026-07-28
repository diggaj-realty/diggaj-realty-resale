"use client";

import { useRouter } from "next/navigation";
import KycWizard from "@/components/seller/KycWizard";

/** Lives inside the (shell) group so it renders with the sidebar, header,
 *  notification bell and account menu.
 *
 *  It used to sit outside the group, which meant no navigation at all: KYC isn't
 *  a top-level nav section, and once a submission exists KycWizard early-returns
 *  a status card with no links — so a seller who opened this page to check their
 *  status had no way out except the browser back button. The auth guard and page
 *  chrome that were hand-rolled here are now the shell's job (DashboardShell
 *  already redirects non-sellers and renders a skeleton while auth resolves).
 */
export default function SellerKycPage() {
  const router = useRouter();

  return (
    <div className="max-w-2xl">
      <p className="text-xs font-medium uppercase tracking-wide text-body">Seller verification</p>
      <h1 className="mt-1 text-subhead font-medium tracking-[-0.02em] text-ink">
        Complete your KYC
      </h1>
      <p className="mt-2 max-w-md text-lead text-body">
        Required before you can publish listings — a one-time check to keep the marketplace
        trustworthy.
      </p>
      <div className="mt-8">
        <KycWizard onApproved={() => router.replace("/dashboard/seller")} />
      </div>
    </div>
  );
}
