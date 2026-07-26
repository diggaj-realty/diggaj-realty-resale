import { Suspense } from "react";
import AuthForm from "@/components/auth/AuthForm";

export default function BuyerLoginPage() {
  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-cream px-8 py-24">
      <Suspense>
        <AuthForm role="BUYER" />
      </Suspense>
    </main>
  );
}
