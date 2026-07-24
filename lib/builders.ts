/**
 * Curated public-knowledge profiles for well-known developers, keyed by a
 * substring of the builder name. Used to enrich the project/society section
 * when the API only gives us a builder name. Facts are stable, publicly stated
 * brand info — no project-specific fabrication.
 */

export type BuilderProfile = {
  name: string;
  since?: number;
  note: string;
  highlights: string[];
};

const BUILDERS: { keys: string[]; profile: BuilderProfile }[] = [
  {
    keys: ["sobha"],
    profile: {
      name: "Sobha Ltd",
      since: 1995,
      note: "Publicly listed developer known for backward-integrated, in-house construction and finish quality.",
      highlights: ["Listed on NSE/BSE", "In-house construction", "Pan-India presence"],
    },
  },
  {
    keys: ["godrej"],
    profile: {
      name: "Godrej Properties",
      since: 1990,
      note: "Real-estate arm of the 125-year-old Godrej Group; among India's largest listed developers.",
      highlights: ["Godrej Group brand", "Listed developer", "Sustainability focus"],
    },
  },
  {
    keys: ["prestige"],
    profile: {
      name: "Prestige Group",
      since: 1986,
      note: "Bengaluru-headquartered developer with a large residential, commercial and retail portfolio.",
      highlights: ["Listed developer", "Strong South India presence", "Mixed-use projects"],
    },
  },
  {
    keys: ["brigade"],
    profile: {
      name: "Brigade Group",
      since: 1986,
      note: "Diversified South Indian developer across residential, office, hospitality and retail.",
      highlights: ["Listed developer", "Integrated townships"],
    },
  },
  {
    keys: ["puravankara", "purva", "provident"],
    profile: {
      name: "Puravankara Ltd",
      since: 1975,
      note: "Long-standing listed developer; 'Provident' is its mid-segment brand.",
      highlights: ["Listed developer", "50+ years", "South & West India"],
    },
  },
  {
    keys: ["salarpuria", "sattva"],
    profile: {
      name: "Sattva Group (Salarpuria Sattva)",
      since: 1993,
      note: "Bengaluru-based developer with a large commercial/tech-park and residential portfolio.",
      highlights: ["Major office developer", "South India focus"],
    },
  },
];

export function getBuilderProfile(builderName?: string | null): BuilderProfile | null {
  if (!builderName) return null;
  const key = builderName.toLowerCase();
  for (const b of BUILDERS) {
    if (b.keys.some((k) => key.includes(k))) return b.profile;
  }
  return null;
}
