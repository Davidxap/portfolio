import type { Locale } from "@/data/projects";
import { projects } from "@/data/projects";
import { coverShot } from "@/data/media";
import { projectPath, useT, type UiKey } from "@/i18n/ui";
import { useW } from "@/i18n/world";
import { PlaceNav } from "../world/PlaceNav";
import { ProjectSelect, type SelectItem } from "./ProjectSelect";

export const selectItems = (locale: Locale): SelectItem[] => {
  const t = useT(locale);
  return projects.map((p) => {
    const c = coverShot(p.slug);
    return {
      slug: p.slug, name: p.name, tagline: p.tagline[locale], summary: p.summary[locale], status: p.status[locale], role: p.role[locale], period: p.period,
      metric: p.metric?.[locale], color: p.color, category: p.category, stack: p.stack, href: projectPath(locale, p.slug), featured: p.featured,
      cover: c ? { src: c.src, width: c.width, height: c.height, alt: c.alt[locale] } : undefined,
      links: p.links.map((l) => ({ label: t(`link.${l.kind}` as UiKey), url: l.url })),
    };
  });
};

/** Projects as a file explorer window (tree left, preview right). Built from the registry, so a new entry appears by itself.
 * `initial` highlights a project; `h1` is false when the explorer is only the tiled partner of an open project page (that page owns the H1). */
export function ProjectsPanel({ locale, embedded, initial, h1 = true }: { locale: Locale; embedded?: boolean; initial?: string; h1?: boolean }) {
  const w = useW(locale);
  const labels = {
    filters: w("proj.filters"), all: w("proj.all"), "full-stack": w("proj.full-stack"), tools: w("proj.tools"), learning: w("proj.learning"), list: w("proj.list"),
    preview: w("proj.preview"), open: w("proj.open"), hint: w("proj.hint"), empty: w("proj.empty"), role: w("proj.role"), period: w("proj.period"), stack: w("proj.stack"), tap: w("proj.tap"),
  };
  return (
    <article className="panel panel-wide fm-app" aria-labelledby={h1 ? "projects-title" : undefined} aria-label={h1 ? undefined : w("head.projects")}>
      {h1 ? <h1 id="projects-title" className="fm-title">{w("head.projects")}<span>{w("head.projects.lead")}</span></h1> : <p className="fm-title">{w("head.projects")}</p>}
      <ProjectSelect items={selectItems(locale)} labels={labels} locale={locale} initial={initial} />
      {!embedded && h1 && <PlaceNav locale={locale} place="projects" />}
    </article>
  );
}
