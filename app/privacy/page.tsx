import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export const metadata: Metadata = { title: "Privacy Policy | Diggaj Realty" };

const SECTIONS = [
  {
    h: "Information we collect",
    p: "We collect the information you share with us directly: your name, email, phone number, and the details of your home search, plus basic usage analytics that help us improve the platform.",
  },
  {
    h: "How we use it",
    p: "Your information is used to match you with agents and listings, and keep you updated on your transaction. We never sell your personal data to third parties.",
  },
  {
    h: "Data retention",
    p: "We keep transaction records as long as required by real estate and financial regulations. You can request deletion of your account data at any time by contacting hello@diggajrealty.com.",
  },
  {
    h: "Your rights",
    p: "You may access, correct, or delete your personal information, and opt out of marketing communications at any time. Contact us and we'll respond within 30 days.",
  },
];

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="bg-cream pb-14">
        <Nav />
        <div className="px-8 pt-14 md:px-14">
          <h1 className="text-display-sm font-medium tracking-[-0.03em] text-ink">Privacy Policy</h1>
          <p className="mt-4 text-sm text-ink/50">Last updated: July 2026</p>
        </div>
      </div>
      <div className="max-w-3xl px-8 py-16 md:px-14">
        {SECTIONS.map((s) => (
          <div key={s.h} className="mb-10">
            <h2 className="text-xl font-medium tracking-[-0.01em] text-ink">{s.h}</h2>
            <p className="mt-3 text-lead text-body">{s.p}</p>
          </div>
        ))}
      </div>
      <Footer />
    </main>
  );
}
