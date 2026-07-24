import Image from "next/image";
import Link from "next/link";
import { getHomeCatalog } from "@/lib/api/home";

type ProjectCard = { project: string; builder?: string; count: number; cover?: string };

export default async function ExploreProjects() {
  const { items } = await getHomeCatalog();

  const byProject = new Map<string, ProjectCard>();
  for (const p of items) {
    if (!p.projectName) continue;
    const cur =
      byProject.get(p.projectName) ??
      ({ project: p.projectName, builder: p.builderName ?? undefined, count: 0 } as ProjectCard);
    cur.count += 1;
    if (!cur.cover && p.photos?.[0]?.url) cur.cover = p.photos[0].url;
    byProject.set(p.projectName, cur);
  }

  const projects = [...byProject.values()].sort((a, b) => b.count - a.count).slice(0, 6);
  if (projects.length === 0) return null;

  return (
    <section className="bg-cream px-8 py-24 md:px-14">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-4xl font-medium tracking-[-0.02em] md:text-5xl">Explore by project</h2>
          <p className="mt-3 max-w-sm text-sm text-body">
            Browse resale homes grouped by society and project — compare units within the community you
            want.
          </p>
        </div>
      </div>

      <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((p) => (
          <Link
            key={p.project}
            href={`/listings?q=${encodeURIComponent(p.project)}`}
            className="group relative block h-56 overflow-hidden rounded-[24px] bg-panel"
          >
            {p.cover && (
              <Image
                src={p.cover}
                alt={p.project}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover opacity-80 transition-transform duration-700 ease-out group-hover:scale-[1.06]"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
            <span className="absolute right-4 top-4 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-ink backdrop-blur">
              {p.count} {p.count === 1 ? "home" : "homes"}
            </span>
            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-5 text-white">
              <div className="min-w-0">
                <p className="truncate text-xl font-medium tracking-[-0.01em]">{p.project}</p>
                {p.builder && <p className="mt-1 truncate text-xs text-white/70">by {p.builder}</p>}
              </div>
              <span className="flex h-10 w-10 shrink-0 translate-y-2 items-center justify-center rounded-full bg-lime text-ink opacity-0 shadow-lg transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
