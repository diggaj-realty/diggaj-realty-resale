import LeadForm from "@/components/LeadForm";

/**
 * A full-width lead-capture band for the public marketing pages.
 *
 * Before this, the only lead form on the whole main site was on /contact —
 * every other page could do no better than link to it, which asks an
 * interested visitor to make a second hop before they can say anything. This
 * puts the form itself on the page.
 *
 * Rendered on the dark panel by default so it separates hard from the cream
 * and white sections around it; the form inside is `card`-framed so the input
 * block reads as one object rather than four floating boxes.
 */
export default function LeadSection({
  id = "lead",
  eyebrow = "Get in touch",
  title,
  lead,
  subject,
  source,
  cta = "Send enquiry",
  compact = false,
}: {
  id?: string;
  eyebrow?: string;
  title: string;
  lead?: string;
  subject: string;
  source: string;
  cta?: string;
  compact?: boolean;
}) {
  return (
    <section id={id} className="scroll-mt-8 px-3 py-3">
      <div className="rounded-[28px] bg-panel px-8 py-16 md:px-14">
        <div className="grid items-start gap-12 lg:grid-cols-2">
          <div className="max-w-[34em]">
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-lime">
              {eyebrow}
            </span>
            <h2 className="mt-3 text-section font-medium tracking-[-0.02em] text-white">
              {title}
            </h2>
            {lead && <p className="mt-4 text-lead text-white/60">{lead}</p>}

            <ul className="mt-9 flex flex-col gap-3">
              {[
                "A real agent reads every message",
                "Typical reply within 2 hours",
                "No obligation, no call-center scripts",
              ].map((p) => (
                <li key={p} className="flex items-start gap-3 text-sm text-white/70">
                  <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-lime" />
                  {p}
                </li>
              ))}
            </ul>
          </div>

          <LeadForm dark card compact={compact} subject={subject} source={source} cta={cta} />
        </div>
      </div>
    </section>
  );
}
