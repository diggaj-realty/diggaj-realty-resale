"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { login, register } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import { useAuth } from "@/lib/auth/AuthContext";
import { hasRole } from "@/lib/auth/roles";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";
import type { UserRole } from "@/types/auth";

export default function AuthForm({ role }: { role: UserRole }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setSession } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const roleLabel = role === "BUYER" ? "Buyer" : "Seller";
  const dashboardPath = role === "BUYER" ? "/dashboard/buyer" : "/dashboard/seller";
  // Whatever page sent the user here (e.g. a property detail page they were
  // trying to like/offer/tour from) — falls back to the role's dashboard.
  const redirectTarget = searchParams.get("redirect") || dashboardPath;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const result =
        mode === "login"
          ? await login(email, password)
          : await register({ name, email, password, phone: phone || undefined, role });

      // A dual-role account (e.g. a seller who's also added buyer access)
      // can log in from either page — only reject if it holds neither role
      // being logged in as here.
      if (!hasRole(result.user, role)) {
        throw new ApiError(
          `This account is registered as a ${result.user.role.toLowerCase()}. Use the ${result.user.role === "BUYER" ? "buyer" : "seller"} login instead.`,
          403
        );
      }

      setSession(result.token, result.user);
      router.push(redirectTarget);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <p className="text-xs font-medium uppercase tracking-wide text-body">{roleLabel} access</p>
      <h1 className="mt-2 text-card-title font-medium tracking-[-0.02em] text-ink">
        {mode === "login" ? `Sign in as a ${roleLabel.toLowerCase()}` : `Create your ${roleLabel.toLowerCase()} account`}
      </h1>
      <p className="mt-3 text-sm text-body">
        {role === "BUYER"
          ? "Log in to see verified pricing on Elite listings and manage your shortlist."
          : "Log in to manage your listings, offers, and deals."}
      </p>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
        {mode === "register" && (
          <label className="flex flex-col gap-1.5 text-sm text-ink">
            Full name
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-xl border border-ink/10 bg-white px-4 py-3 text-sm outline-none focus:border-ink/30"
              placeholder="Ananya Sharma"
            />
          </label>
        )}
        <label className="flex flex-col gap-1.5 text-sm text-ink">
          Email
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-xl border border-ink/10 bg-white px-4 py-3 text-sm outline-none focus:border-ink/30"
            placeholder="you@example.com"
          />
        </label>
        {mode === "register" && (
          <label className="flex flex-col gap-1.5 text-sm text-ink">
            Phone <span className="text-body">(optional)</span>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="rounded-xl border border-ink/10 bg-white px-4 py-3 text-sm outline-none focus:border-ink/30"
              placeholder="98765 43210"
            />
          </label>
        )}
        <label className="flex flex-col gap-1.5 text-sm text-ink">
          Password
          <input
            required
            type="password"
            minLength={mode === "register" ? 8 : undefined}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-xl border border-ink/10 bg-white px-4 py-3 text-sm outline-none focus:border-ink/30"
            placeholder="••••••••"
          />
        </label>

        {error && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="mt-2 rounded-full bg-panel px-6 py-3.5 text-sm font-medium text-white transition-transform hover:-translate-y-px disabled:opacity-60"
        >
          {submitting ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
        </button>
      </form>

      {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID && (
        <>
          <div className="my-6 flex items-center gap-3 text-[11px] uppercase tracking-wide text-ink/35">
            <span className="h-px flex-1 bg-ink/10" /> or <span className="h-px flex-1 bg-ink/10" />
          </div>
          <GoogleSignInButton role={role} redirectTo={redirectTarget} onError={setError} />
        </>
      )}

      <button
        onClick={() => {
          setError(null);
          setMode(mode === "login" ? "register" : "login");
        }}
        className="mt-6 text-sm text-body underline underline-offset-4"
      >
        {mode === "login" ? `New ${roleLabel.toLowerCase()}? Create an account` : "Already have an account? Sign in"}
      </button>

      <p className="mt-8 text-xs text-body">
        {role === "BUYER" ? (
          <>Selling a property instead? <Link href="/login/seller" className="underline underline-offset-4">Seller login →</Link></>
        ) : (
          <>Looking to buy instead? <Link href="/login/buyer" className="underline underline-offset-4">Buyer login →</Link></>
        )}
      </p>
    </div>
  );
}
