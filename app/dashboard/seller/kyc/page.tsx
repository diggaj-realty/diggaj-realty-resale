"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { hasRole } from "@/lib/auth/roles";
import KycWizard from "@/components/seller/KycWizard";

export default function SellerKycPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const isSeller = hasRole(user, "SELLER");

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login/seller");
      return;
    }
    if (!isSeller) {
      router.replace(`/dashboard/${user.role.toLowerCase()}`);
    }
  }, [loading, user, isSeller, router]);

  if (loading || !user || !isSeller) {
    return (
      <main className="flex min-h-screen w-full items-center justify-center bg-cream px-8">
        <p className="text-sm text-body">Loading…</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen w-full overflow-x-clip bg-cream px-5 py-16 sm:px-8 md:px-14">
      <div className="mx-auto max-w-2xl">
        <p className="text-xs font-medium uppercase tracking-wide text-body">Seller verification</p>
        <h1 className="mt-1 text-3xl font-medium tracking-[-0.02em] text-ink">Complete your KYC</h1>
        <p className="mt-2 max-w-md text-sm text-body">
          Required before you can publish listings — a one-time check to keep the marketplace trustworthy.
        </p>
        <div className="mt-8">
          <KycWizard onApproved={() => router.replace("/dashboard/seller")} />
        </div>
      </div>
    </main>
  );
}
