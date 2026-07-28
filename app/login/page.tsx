import Link from "next/link";

export default function LoginChooserPage() {
  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-cream px-8 py-24">
      <div className="mx-auto w-full max-w-xl text-center">
        <p className="text-xs font-medium uppercase tracking-wide text-body">Sign in</p>
        <h1 className="mt-2 text-card-title font-medium tracking-[-0.02em] text-ink">
          How would you like to continue?
        </h1>
        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Link
            href="/login/buyer"
            className="group rounded-3xl bg-white p-8 text-left shadow-sm ring-1 ring-ink/5 transition-transform hover:-translate-y-1"
          >
            <p className="text-lg font-medium text-ink">I&apos;m a Buyer</p>
            <p className="mt-2 text-sm text-body">
              See Elite pricing, shortlist homes, and track your offers.
            </p>
            <span className="mt-4 inline-block text-sm text-ink group-hover:underline">
              Continue as buyer →
            </span>
          </Link>
          <Link
            href="/login/seller"
            className="group rounded-3xl bg-panel p-8 text-left text-white shadow-sm transition-transform hover:-translate-y-1"
          >
            <p className="text-lg font-medium">I&apos;m a Seller</p>
            <p className="mt-2 text-sm text-white/60">
              List your property, manage offers, and track your deals.
            </p>
            <span className="mt-4 inline-block text-sm text-lime group-hover:underline">
              Continue as seller →
            </span>
          </Link>
        </div>
      </div>
    </main>
  );
}
