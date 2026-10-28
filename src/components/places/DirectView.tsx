import { ArrowUpRight, Mail } from "lucide-react";
import Link from "next/link";
import type { CSSProperties } from "react";
import { arcadeIntro } from "@/data/arcade";
import { artNote, availability, interests, learning, story, values } from "@/data/about";
import { experience } from "@/data/experience";
import { gameTitle, games } from "@/data/games";
import { coverShot } from "@/data/media";
import { places, type PlaceId } from "@/data/places";
import { projects, type Locale } from "@/data/projects";
import { person, stack, stackLearning } from "@/data/site";
import { cvPath, gamePath, homePath, projectPath, useT, type UiKey } from "@/i18n/ui";
import { useW } from "@/i18n/world";
import { GitHubIcon, LinkedInIcon } from "../BrandIcons";
import { ArtIcon } from "../world/icons";
import { ModeSwitch } from "../world/ModeSwitch";
import { PaintField } from "../world/PaintField";
import { PixelDavid } from "../world/PixelDavid";
import { PrintButton } from "../world/PrintButton";
import { Headline } from "./PanelHead";
import { withBase } from "@/lib/base";

/** Tones of the six stack groups, in the order of `stack` (frontend, backend, data, testing, tools, ai). Colours come from the active theme. */
const TONES = ["var(--accent)", "var(--accent-2)", "var(--cta)", "var(--paint-1)", "color-mix(in srgb, var(--accent-2) 55%, var(--accent))", "color-mix(in srgb, var(--cta) 55%, var(--paint-2))"];
const tone = (c: string) => ({ "--k": c }) as CSSProperties;
const pad = (n: number) => String(n).padStart(2, "0");

/** One section head: mono label with its number and the place name, a large serif title (the interactive panel heading) with an italic accent word, and a hairline. */
function Head({ n, id, label, text }: { n: string; id: string; label: string; text: string }) {
  return (
    <div className="d-head d-rv">
      <p className="d-label mono" aria-hidden="true"><span>{n}</span><i />{label} / {pad(places.length)}</p>
      <h2 id={id}><Headline text={text} /></h2>
    </div>
  );
}

/** Direct view: the whole profile as one normal, fully scrollable page, on the legacy v1 look: a paint-flow field behind the
 * opening that softly runs on behind the first sections, a huge tight serif title, and calm editorial sections that sit on soft colour washes
 * derived from the theme's paint tokens. Nothing here has a fixed height, so no content can be clipped. Print friendly; reveals never hide content. */
export async function DirectView({ locale }: { locale: Locale }) {
  const t = useT(locale);
  const w = useW(locale);
  const featured = projects.filter((p) => p.featured);
  const rest = projects.filter((p) => !p.featured);
  const contact = places.find((p) => p.id === "contact")!;
  const lbl = (id: PlaceId) => places.find((p) => p.id === id)!.label[locale];
  const n = (id: PlaceId) => pad(places.findIndex((p) => p.id === id) + 1);
  const team = values.length
    ? values.map((v) => ({ id: v.id, t: v.title[locale], d: v.body[locale] }))
    : (["a", "b", "c", "d"] as const).map((k) => ({ id: k, t: t(`notes.${k}.t` as UiKey), d: t(`notes.${k}.d` as UiKey) }));
  const [first, ...surname] = person.name.split(" ");
  return (
    <div className="direct">
      <div className="d-paint no-print" aria-hidden="true"><PaintField /></div>
      <div className="d-wrap">
        <div className="d-top no-print">
          <ModeSwitch locale={locale} mode="direct" />
          <nav className="d-jump" aria-label={w("direct.jump")}>
            {places.map((p) => <a key={p.id} href={`#d-${p.id}`}>{p.label[locale]}</a>)}
          </nav>
        </div>

        <header className="d-opening">
          <div className="d-id">
            <p className="d-eyebrow mono">{w("intro.sign")}</p>
            <h1>{first} <em>{surname.join(" ")}</em></h1>
            <p className="d-name mono">{person.jobTitle}</p>
            <p className="d-lead">{t("map.value")}</p>
            <div className="d-avail">
              <span className="d-avail-label mono">{w("intro.availability")}</span>
              <ul className="chips" aria-label={availability.line[locale]}>{availability.modes.map((m) => <li key={m.en} className="chip">{m[locale]}</li>)}</ul>
            </div>
            <p className="print-only">{person.email} · {person.github} · {person.linkedin}</p>
            <div className="d-cta no-print">
              <a className="btn cta" href={cvPath(locale)} download><ArtIcon name="cv" size={22} />{t("cv.download")}</a>
              <a className="btn cta-ghost" href={`mailto:${person.email}`}><ArtIcon name="contact" size={22} />{w("contact.coffee")}</a>
              <PrintButton label={t("direct.print")} />
            </div>
          </div>
          <aside className="d-card" aria-label={person.name}>
            <div className="d-card-head">
              <figure className="d-face" aria-hidden="true"><PixelDavid height={124} /></figure>
              <div><p className="d-card-title mono">{t("direct.card")}</p><p className="d-card-name">{person.name}</p></div>
            </div>
            <dl>
              {(["role", "base", "work", "langs", "core", "quality", "status"] as const).map((k) => (
                <div key={k}><dt>{t(`dossier.${k}` as UiKey)}</dt><dd>{t(`dossier.${k}V` as UiKey)}</dd></div>
              ))}
            </dl>
          </aside>
        </header>

        <section id="d-about" className="d-sec" style={tone("var(--paint-2)")} aria-labelledby="d-about-h">
          <Head n={n("about")} id="d-about-h" label={lbl("about")} text={w("head.about")} />
          <h3 className="d-sub">{w("about.path")}</h3>
          <ol className="d-timeline">
            {story.map((c, i) => (
              <li key={c.id} className="d-rv">
                <span className="d-dot mono" aria-hidden="true">{pad(i + 1)}</span>
                <p className="d-period mono">{c.period}</p>
                <div><h4>{c.title[locale]}</h4><p>{c.body[locale]}</p></div>
              </li>
            ))}
          </ol>
          <h3 className="d-sub">{w("about.team")}</h3>
          <ul className="d-rows d-values">
            {team.map((v) => <li key={v.id} className="d-rv"><span className="row-bar" aria-hidden="true" /><b>{v.t}</b><span className="muted">{v.d}</span></li>)}
          </ul>
          {learning.length > 0 && (<>
            <h3 className="d-sub">{w("about.learning")}</h3>
            <ul className="d-rows d-values">
              {learning.map((l) => <li key={l.id} className="d-rv"><span className="row-bar" aria-hidden="true" /><b>{l.title[locale]}</b><span className="muted">{l.body[locale]}</span></li>)}
            </ul>
          </>)}
          {interests.length > 0 && (<>
            <h3 className="d-sub">{w("about.interests")}</h3>
            <ul className="chips d-interests">{interests.map((i) => <li key={i.id} className="chip">{i.label[locale]}</li>)}</ul>
          </>)}
          <h3 className="d-sub">{artNote.title[locale]}</h3>
          <p className="d-art-body d-rv">{artNote.body[locale]}</p>
          <ul className="chips">{artNote.items.map((i) => <li key={i.id} className="chip">{i.label[locale]}</li>)}</ul>
        </section>

        <section id="d-projects" className="d-sec" style={tone("var(--paint-1)")} aria-labelledby="d-projects-h">
          <Head n={n("projects")} id="d-projects-h" label={lbl("projects")} text={w("head.projects")} />
          <p className="d-intro d-rv">{w("head.projects.lead")}</p>
          <ul className="d-featured">
            {featured.map((p, i) => {
              const c = coverShot(p.slug);
              return (
                <li key={p.slug} className="d-rv" style={tone(p.color)}>
                  <div className="d-shot">
                    {c && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={c.src} width={c.width} height={c.height} alt="" loading="lazy" decoding="async" />
                    )}
                    <span className="d-idx mono" aria-hidden="true">{pad(i + 1)}</span>
                  </div>
                  <div className="d-body">
                    <div className="chips">{p.metric && <span className="chip chip-key">{p.metric[locale]}</span>}<span className="chip">{p.period}</span></div>
                    <h3><a href={withBase(projectPath(locale, p.slug))}>{p.name}<ArrowUpRight className="d-arrow" size={20} aria-hidden="true" /></a></h3>
                    <p>{p.tagline[locale]}</p>
                    <p className="d-meta mono">{p.role[locale]} · {p.stack.slice(0, 4).join(" · ")}</p>
                  </div>
                </li>
              );
            })}
          </ul>
          {rest.length > 0 && (
            <ul className="d-rows">
              {rest.map((p) => (
                <li key={p.slug} className="d-rv" style={tone(p.color)}>
                  <span className="row-bar" aria-hidden="true" />
                  <a href={withBase(projectPath(locale, p.slug))}>{p.name}</a>
                  <span className="muted">{p.tagline[locale]}{p.metric ? ` · ${p.metric[locale]}` : ""} · {p.role[locale]}</span>
                  <span className="mono tiny">{p.period}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section id="d-experience" className="d-sec" style={tone("var(--paint-3)")} aria-labelledby="d-experience-h">
          <Head n={n("experience")} id="d-experience-h" label={lbl("experience")} text={w("head.experience")} />
          <p className="d-intro d-rv">{w("head.experience.lead")}</p>
          <ol className="d-timeline">
            {experience.map((e, i) => (
              <li key={e.id} className="d-rv">
                <span className="d-dot mono" aria-hidden="true">{pad(i + 1)}</span>
                <p className="d-period mono">{e.period[locale]}</p>
                <div>
                  <h3>{e.title[locale]} · {e.where[locale]}</h3>
                  <p>{e.summary[locale]}</p>
                  {e.bullets.length > 0 && <ul className="d-bullets">{e.bullets.map((b) => <li key={b.en}>{b[locale]}</li>)}</ul>}
                  {e.stack.length > 0 && <ul className="chips">{e.stack.map((x) => <li key={x} className="chip">{x}</li>)}</ul>}
                  {e.matters && <p>{e.matters[locale]}</p>}
                  {e.related && <p className="d-meta mono">{e.related.label[locale]}: {e.related.slugs.map((slug, k) => <span key={slug}>{k ? ", " : ""}<a href={withBase(projectPath(locale, slug))}>{projects.find((p) => p.slug === slug)?.name ?? slug}</a></span>)}</p>}
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section id="d-stack" className="d-sec" style={tone("var(--paint-3)")} aria-labelledby="d-stack-h">
          <Head n={n("stack")} id="d-stack-h" label={lbl("stack")} text={w("head.stack")} />
          <p className="d-intro d-rv">{w("head.stack.lead")}</p>
          <div className="d-stack">
            {(Object.entries(stack) as [keyof typeof stack, readonly string[]][]).map(([k, items], i) => (
              <section key={k} className="d-stack-card d-rv" style={tone(TONES[i % TONES.length])} aria-labelledby={`d-stack-${k}`}>
                <h3 id={`d-stack-${k}`}><span aria-hidden="true" className="d-pip" />{t(`inv.${k}` as UiKey)}</h3>
                <ul className="chips">{items.map((x) => <li key={x} className="chip">{x}</li>)}</ul>
              </section>
            ))}
            {stackLearning.length > 0 && (
              <section id="d-stack-learning" className="d-stack-card d-learn d-rv" style={tone("var(--paint-2)")} aria-labelledby="d-stack-learning-h">
                <h3 id="d-stack-learning-h"><span aria-hidden="true" className="d-pip" />{w("stack.learning")}</h3>
                <ul className="chips">{stackLearning.map((x) => <li key={x.en} className="chip">{x[locale]}</li>)}</ul>
              </section>
            )}
          </div>
        </section>

        <section id="d-arcade" className="d-sec" style={tone("var(--paint-1)")} aria-labelledby="d-arcade-h">
          <Head n={n("arcade")} id="d-arcade-h" label={lbl("arcade")} text={w("head.arcade")} />
          <h3 className="d-sub">{arcadeIntro.title[locale]}</h3>
          <p className="d-art-body d-rv">{arcadeIntro.body[locale]}</p>
          <ul className="d-rows">
            {games.map((g, i) => (
              <li key={g.id} className="d-rv" style={tone(TONES[i % TONES.length])}><span className="row-bar" aria-hidden="true" /><a href={withBase(gamePath(locale, g.id))}>{gameTitle(g, locale)}</a><span className="muted">{g.blurb[locale]}</span></li>
            ))}
          </ul>
        </section>

        <section id="d-contact" className="d-contact" aria-labelledby="d-contact-h">
          <p className="d-label mono"><span aria-hidden="true">{n("contact")}</span><i aria-hidden="true" />{contact.label[locale]} / {pad(places.length)}</p>
          <h2 id="d-contact-h"><Headline text={w("head.contact")} /></h2>
          <p className="d-lead">{w("head.contact.lead")}</p>
          <p className="d-lead">{w("contact.reply")}</p>
          <div className="d-cta">
            <a className="btn cta big" href={`mailto:${person.email}`}><Mail className="ic" size={20} aria-hidden="true" />{w("contact.coffee")}</a>
            <a className="btn cta-ghost" href={cvPath(locale)} download><ArtIcon name="cv" size={22} />{t("cv.download")}</a>
            <a className="btn" href={person.github} target="_blank" rel="me noopener noreferrer"><GitHubIcon className="ic" />GitHub</a>
            <a className="btn" href={person.linkedin} target="_blank" rel="me noopener noreferrer"><LinkedInIcon className="ic" />LinkedIn</a>
          </div>
          <p className="d-mail mono">{person.email}</p>
          <p className="d-back no-print"><Link className="text-link" href={homePath(locale)}>{w("mode.hintInteractive")}<ArrowUpRight size={15} aria-hidden="true" /></Link></p>
        </section>
      </div>
    </div>
  );
}
