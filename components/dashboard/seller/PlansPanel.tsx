import Link from "next/link";

const PLANS = [
  {
    key: "BASIC",
    name: "Basic",
    tagline: "Get listed",
    highlight: false,
    features: ["Standard listing visibility", "Full property details page", "Buyer offers & site visits"],
  },
  {
    key: "VERIFIED",
    name: "Verified",
    tagline: "Build trust",
    highlight: false,
    features: [
      "Everything in Basic",
      "✓ Verified badge on your listing",
      "Priority review queue",
    ],
  },
  {
    key: "VERIFIED_PLUS",
    name: "Verified+",
    tagline: "Stand out",
    highlight: false,
    features: ["Everything in Verified", "Higher placement in search results", "Featured on city pages"],
  },
  {
    key: "ELITE",
    name: "Elite",
    tagline: "Maximum reach",
    highlight: true,
    features: [
      "Everything in Verified+",
      "✦ Elite badge across the site",
      "Included in the homepage Elite showcase",
      "Boosted ranking on buyer search",
    ],
  },
] as const;

export default function PlansPanel() {
  return (
    <div>
      <p className="text-sm text-body">
        Upgrade your plan for more visibility. Pricing isn&apos;t self-serve yet — reach out and our team will set you
        up.
      </p>
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {PLANS.map((p) => (
          <div
            key={p.key}
            className={`rounded-2xl p-5 ring-1 ${
              p.highlight ? "bg-panel text-white ring-panel" : "bg-white text-ink ring-ink/5"
            }`}
          >
            <p className={`text-xs font-medium uppercase tracking-wide ${p.highlight ? "text-lime" : "text-body"}`}>
              {p.tagline}
            </p>
            <p className="mt-1 text-lg font-medium">{p.name}</p>
            <ul className="mt-4 space-y-2.5">
              {p.features.map((f) => (
                <li key={f} className={`flex items-start gap-2 text-xs ${p.highlight ? "text-white/80" : "text-ink/70"}`}>
                  <span
                    className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[9px] ${
                      p.highlight ? "bg-lime text-ink" : "bg-ink/10 text-ink"
                    }`}
                  >
                    ✓
                  </span>
                  {f}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mt-6 flex flex-col items-start gap-3 rounded-2xl bg-cream p-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-ink">Interested in Verified or Elite for one of your listings?</p>
        <Link href="/contact" className="shrink-0 rounded-full bg-panel px-5 py-2.5 text-xs font-medium text-white">
          Contact us to upgrade →
        </Link>
      </div>
    </div>
  );
}
