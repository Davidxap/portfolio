import { artNote, availability, interests, learning, story, values } from "@/data/about";
import type { Locale } from "@/data/projects";
import { person } from "@/data/site";
import { useT, type UiKey } from "@/i18n/ui";
import { useW } from "@/i18n/world";
import { PlaceNav } from "../world/PlaceNav";
import { Cmd, TypeSeq } from "./TypeSeq";

/** About as a kitty terminal. `whoami` answers with the name and the headline (the page's H1), `cat story.md` is the story as chapters,
 * and the rest of the session holds what a team gets, what I keep learning, availability and the interests. The whole session is real
 * text in the HTML; TypeSeq only types the first commands in the browser. */
export async function AboutPanel({ locale, embedded }: { locale: Locale; embedded?: boolean }) {
  const t = useT(locale);
  const w = useW(locale);
  const team = values.length
    ? values.map((v) => ({ id: v.id, t: v.title[locale], d: v.body[locale] }))
    : (["a", "b", "c", "d"] as const).map((k) => ({ id: k, t: t(`notes.${k}.t` as UiKey), d: t(`notes.${k}.d` as UiKey) }));
  return (
    <article className="panel term-app" aria-labelledby="about-title">
      <TypeSeq typed={3} hint={w("term.skip")}>
        <Cmd>whoami</Cmd>
        <div className="t-out">
          <p className="t-name">{person.name}</p>
          <p className="t-role mono">{person.jobTitle} · Manizales, Colombia</p>
          <h1 id="about-title" className="t-h1">{w("head.about")}</h1>
        </div>

        <Cmd>cat story.md</Cmd>
        <div className="t-out">
          <h2 className="t-md">{w("about.path")}</h2>
          <ol className="t-story">
            {story.map((c, i) => (
              <li key={c.id} style={{ "--c": `var(--tc${(i % 5) + 1})` } as React.CSSProperties}>
                <p className="t-when mono"><span aria-hidden="true">{String(i + 1).padStart(2, "0")}</span> {c.period}</p>
                <h3>{c.title[locale]}</h3>
                <p>{c.body[locale]}</p>
              </li>
            ))}
          </ol>
        </div>

        <Cmd>cat team.md</Cmd>
        <div className="t-out">
          <h2 className="t-md">{w("about.team")}</h2>
          <ul className="t-list">{team.map((n) => <li key={n.id}><b>{n.t}</b><span>{n.d}</span></li>)}</ul>
        </div>

        {learning.length > 0 && (<>
          <Cmd>cat learning.md</Cmd>
          <div className="t-out">
            <h2 className="t-md">{w("about.learning")}</h2>
            <ul className="t-list warm">{learning.map((n) => <li key={n.id}><b>{n.title[locale]}</b><span>{n.body[locale]}</span></li>)}</ul>
          </div>
        </>)}

        <Cmd>cat availability.txt</Cmd>
        <div className="t-out">
          <h2 className="t-md">{w("about.availability")}</h2>
          <ul className="chips" aria-label={availability.line[locale]}>{availability.modes.map((m) => <li key={m.en} className="chip chip-accent2">{m[locale]}</li>)}</ul>
          <p className="t-dim">{availability.line[locale]}</p>
        </div>

        {interests.length > 0 && (<>
          <Cmd>ls interests/</Cmd>
          <div className="t-out">
            <h2 className="t-md">{w("about.interests")}</h2>
            <ul className="t-ls">{interests.map((i) => <li key={i.id}>{i.label[locale]}/</li>)}</ul>
          </div>
        </>)}

        <Cmd>cat why-the-art.md</Cmd>
        <div className="t-out">
          <h2 className="t-md">{artNote.title[locale]}</h2>
          <p className="t-text">{artNote.body[locale]}</p>
          <ul className="t-ls">{artNote.items.map((i) => <li key={i.id}>{i.label[locale]}</li>)}</ul>
        </div>
        <Cmd final />
      </TypeSeq>
      {!embedded && <PlaceNav locale={locale} place="about" />}
    </article>
  );
}
