import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export const metadata: Metadata = { title: "Terms of Service — Diggaj Realty" };

const SECTIONS = [
  {
    h: "Using Diggaj Realty",
    p: "By using our platform you agree to provide accurate information and use the service for personal, non-commercial real estate transactions. Listings are provided for informational purposes and are subject to change.",
  },
  {
    h: "Cash-back rewards",
    p: "Commission cash back is available where permitted by state law and requires closing your transaction with a participating Diggaj Realty agent. Reward amounts vary by service bundle and transaction value, and are paid at or shortly after closing.",
  },
  {
    h: "No warranty",
    p: "Property information is sourced from listing agents and public records. We work to keep it accurate but make no guarantees; always verify details independently before making an offer.",
  },
  {
    h: "Changes to these terms",
    p: "We may update these terms from time to time. Continued use of the platform after changes take effect constitutes acceptance of the revised terms.",
  },
];

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="bg-cream pb-14">
        <Nav />
        <div className="px-8 pt-14 md:px-14">
          <h1 className="text-5xl font-medium tracking-[-0.03em] text-ink md:text-6xl">Terms of Service</h1>
          <p className="mt-4 text-sm text-ink/50">Last updated: July 2026</p>
        </div>
      </div>
      <div className="max-w-3xl px-8 py-16 md:px-14">
        {SECTIONS.map((s) => (
          <div key={s.h} className="mb-10">
            <h2 className="text-xl font-medium tracking-[-0.01em] text-ink">{s.h}</h2>
            <p className="mt-3 text-[15px] leading-relaxed text-body">{s.p}</p>
          </div>
        ))}
      </div>
      <Footer />
    </main>
  );
}
