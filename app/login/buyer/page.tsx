import AuthForm from "@/components/auth/AuthForm";

export default function BuyerLoginPage() {
  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-cream px-8 py-24">
      <AuthForm role="BUYER" />
    </main>
  );
}
