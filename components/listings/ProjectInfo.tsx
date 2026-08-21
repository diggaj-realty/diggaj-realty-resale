import { getBuilderProfile } from "@/lib/builders";
import type { Property } from "@/types/api";

const POSSESSION: Record<string, string> = {
  READY_TO_MOVE: "Ready to move",
  UNDER_CONSTRUCTION: "Under construction",
};

// Real, official state RERA authority portals — only listed where we're
// confident of the URL. Unmapped states just show the RERA ID as text.
const RERA_PORTAL_BY_CITY: Record<string, string> = {
  Bangalore: "https://rera.karnataka.gov.in",
};

export default function ProjectInfo({ property: p }: { property: Property }) {
  const builder = getBuilderProfile(p.builderName);
  const reraPortal = p.reraId && p.city ? RERA_PORTAL_BY_CITY[p.city] : undefined;

  // Real fields from the API; only rendered when present.
  const facts: { label: string; value: string }[] = [];
  if (p.projectName) facts.push({ label: "Project", value: p.projectName });
  if (p.builderName) facts.push({ label: "Builder", value: p.builderName });
  if (p.unitsAvailable != null)
    facts.push({
      label: "Units available",
      value: `${p.unitsAvailable} ${p.unitsAvailable === 1 ? "unit" : "units"}`,
    });
  if (p.possessionStatus) facts.push({ label: "Possession", value: POSSESSION[p.possessionStatus] });
  if (p.ageYears != null)
    facts.push({ label: "Age", value: p.ageYears <= 0 ? "New" : `${p.ageYears} yr` });
  if (p.reraId) facts.push({ label: "RERA ID", value: p.reraId });

  if (facts.length === 0 && !builder) return null;

  return (
    <>
      <h2 className="mt-12 text-2xl font-medium tracking-[-0.02em] text-ink">
        Project &amp; builder
      </h2>

      {facts.length > 0 && (
        <dl className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          {facts.map((f) => (
            <div key={f.label} className="rounded-2xl bg-cream px-4 py-3.5">
              <dt className="text-xs text-body">{f.label}</dt>
              <dd className="mt-1 text-sm font-medium leading-snug text-ink [overflow-wrap:anywhere]">
                {f.value}
              </dd>
            </div>
          ))}
        </dl>
      )}

      {reraPortal && (
        <a
          href={reraPortal}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-ink underline underline-offset-2"
        >
          Verify RERA ID on the official state portal →
        </a>
      )}

      {builder && (
        <div className="mt-4 rounded-[24px] bg-panel p-6 text-white">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-lime text-lg font-semibold text-ink">
              {builder.name.charAt(0)}
            </span>
            <div>
              <p className="text-sm font-medium">
                {builder.name}
                {builder.since ? <span className="text-white/50"> · since {builder.since}</span> : null}
              </p>
              <p className="text-xs text-white/50">Developer profile</p>
            </div>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-white/70">{builder.note}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {builder.highlights.map((h) => (
              <span
                key={h}
                className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-white ring-1 ring-white/10"
              >
                {h}
              </span>
            ))}
          </div>
          <p className="mt-4 text-[11px] leading-relaxed text-white/35">
            Developer background is general brand information, not specific to this listing&apos;s approvals.
          </p>
        </div>
      )}
    </>
  );
}
