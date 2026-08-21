import Image from "next/image";
import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import LeadForm from "@/components/LeadForm";

export const metadata: Metadata = {
  title: "Contact | Diggaj Realty",
  description:
    "Talk to a Diggaj Realty advisor about buying or selling a home. Real humans, replies within a few hours.",
};

const POINTS = [
  { t: "Buying a home", d: "Get matched with a local advisor and verified, AI-searched listings." },
  { t: "Selling your home", d: "Free valuation, AI pricing, and your listing in front of 10L+ buyers." },
  { t: "Anything else", d: "Mortgage, title, or documentation questions, one message reaches the right team." },
];

export default function ContactPage() {
  return (
    <main className="min-h-screen overflow-x-clip bg-white">
      {/* The form used to sit below the intro block, which pushed it under the
          fold on most laptops on the one page whose entire job is the form.
          It now shares the header band, so it's visible on arrival. */}
      <div className="bg-cream pb-14">
        <Nav />
        <div className="grid items-start gap-12 px-8 pt-14 md:px-14 lg:grid-cols-2">
          <div>
            <h1 className="max-w-3xl text-display-sm font-medium tracking-[-0.03em] text-ink">
              Talk to an advisor
            </h1>
            <p className="mt-5 max-w-md text-lead text-ink/70">
              No bots, no call centers. A local advisor reads every message and
              replies within a few hours.
            </p>
          </div>

          <div className="h-fit rounded-[28px] bg-panel p-8 text-white md:p-10">
            <p className="text-xl font-medium tracking-[-0.01em]">Send us a message</p>
            <p className="mt-1.5 text-sm text-white/50">We&apos;ll route it to the right advisor.</p>
            <div className="mt-7">
              <LeadForm dark subject="Contact page inquiry" source="contact-page" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-14 px-8 py-16 md:px-14 lg:grid-cols-2">
        <div>
          <div className="flex items-center gap-4">
            <div className="relative h-16 w-16 overflow-hidden rounded-full">
              <Image src="/img/agent-avatar.jpg" alt="Diggaj Realty advisor" fill sizes="64px" className="object-cover" />
            </div>
            <div>
              <p className="font-medium text-ink">The Diggaj Realty team</p>
              <p className="text-sm text-body">Avg. reply time: 2 hours</p>
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-6">
            {POINTS.map((p) => (
              <div key={p.t} className="flex gap-4">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-lime text-xs text-ink">
                  ✓
                </span>
                <div>
                  <p className="text-sm font-medium text-ink">{p.t}</p>
                  <p className="mt-1 max-w-sm text-lead text-body">{p.d}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 rounded-[24px] bg-limepale p-6">
            <p className="text-sm font-semibold text-ink">Prefer email?</p>
            <a href="mailto:hello@diggajrealty.com" className="mt-1 block text-sm text-ink/70 underline underline-offset-4">
              hello@diggajrealty.com
            </a>
          </div>
        </div>

      </div>

      <Footer />
    </main>
  );
}
