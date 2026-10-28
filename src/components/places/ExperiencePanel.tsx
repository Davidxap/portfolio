import { story } from "@/data/about";
import { experience } from "@/data/experience";
import { projects, type Locale } from "@/data/projects";
import { projectPath } from "@/i18n/ui";
import { useW } from "@/i18n/world";
import { PlaceNav } from "../world/PlaceNav";
import { Cmd, TypeSeq } from "./TypeSeq";
import { withBase } from "@/lib/base";

type Commit = {
  id: string; when: string; title: string; body: string; refs: string[]; tone: number; branch?: boolean;
  bullets?: string[]; stack?: string[]; matters?: string; related?: { label: string; links: { slug: string; name: string }[] };
};

/** Experience as `git log --graph --oneline`: newest first, one coloured commit per step of the path (work and study from the roadmap,
 * then the story chapters that came after). Branch names and tags are decoration; every date, title and sentence is real content. */
export function ExperiencePanel({ locale, embedded }: { locale: Locale; embedded?: boolean }) {
  const w = useW(locale);
  const later = story.filter((c) => ["learning-now", "community", "amplixme"].includes(c.id));
  const commits: Commit[] = [
    ...later.slice().reverse().map((c, i): Commit => ({ id: c.id, when: c.period, title: c.title[locale], body: c.body[locale], refs: i === 0 ? ["HEAD -> main", "learning"] : c.id === "amplixme" ? ["team"] : ["community"], tone: i + 1, branch: c.id !== "learning-now" })),
    ...experience.map((e, i): Commit => ({
      id: e.id, when: e.period[locale], title: `${e.title[locale]} · ${e.where[locale]}`, body: e.summary[locale], tone: i + 4,
      refs: e.id === "freelance" ? ["freelance"] : e.id === "education" ? ["tag: degree"] : ["tag: marketing"],
      bullets: e.bullets.map((b) => b[locale]), stack: e.stack, matters: e.matters?.[locale],
      related: e.related && { label: e.related.label[locale], links: e.related.slugs.map((slug) => ({ slug, name: projects.find((p) => p.slug === slug)!.name })) },
    })),
  ];
  return (
    <article className="panel term-app" aria-labelledby="experience-title">
      <TypeSeq typed={1} hint={w("term.skip")}>
        <Cmd dir="~/career">git log --graph --oneline</Cmd>
        <div className="t-out">
          <h1 id="experience-title" className="t-h1">{w("head.experience")}</h1>
          <p className="t-dim">{w("head.experience.lead")}</p>
          <ol className="gitlog">
            {commits.map((c) => (
              <li key={c.id} data-branch={c.branch ? "true" : undefined} style={{ "--c": `var(--tc${c.tone})` } as React.CSSProperties}>
                <span className="gl-node" aria-hidden="true" />
                <p className="gl-head mono">
                  <span className="gl-hash">{c.when}</span>
                  {c.refs.length > 0 && <span className="gl-refs">({c.refs.map((r, i) => <span key={r} className={r.startsWith("HEAD") ? "gl-head-ref" : r.startsWith("tag") ? "gl-tag" : "gl-branch"}>{i ? ", " : ""}{r}</span>)})</span>}
                </p>
                <h2 className="gl-title">{c.title}</h2>
                <p className="gl-body">{c.body}</p>
                {c.bullets && c.bullets.length > 0 && <ul className="gl-bullets">{c.bullets.map((b) => <li key={b}>{b}</li>)}</ul>}
                {c.stack && c.stack.length > 0 && <ul className="gl-stack mono">{c.stack.map((x) => <li key={x}>{x}</li>)}</ul>}
                {c.matters && <p className="gl-matters">{c.matters}</p>}
                {c.related && (
                  <p className="gl-related mono"><span>{c.related.label}:</span> {c.related.links.map((l) => <a key={l.slug} href={withBase(projectPath(locale, l.slug))}>{l.name}</a>)}</p>
                )}
              </li>
            ))}
          </ol>
        </div>
        <Cmd dir="~/career" final />
      </TypeSeq>
      {!embedded && <PlaceNav locale={locale} place="experience" />}
    </article>
  );
}
