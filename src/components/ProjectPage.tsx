import type { CSSProperties } from "react";
import type { Locale, Project } from "@/data/projects";
import { coverShot, previews } from "@/data/media";
import { placeById } from "@/data/places";
import { useT, type UiKey } from "@/i18n/ui";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { EventLoopLab } from "./EventLoopLab";
import { PlaceNav } from "./world/PlaceNav";
import { withBase } from "@/lib/base";

export function ProjectPage({ locale, project: p }: { locale: Locale; project: Project }) {
  const t = useT(locale);
  const cover = coverShot(p.slug);
  const allShots = (previews[p.slug] ?? []).filter((s) => s !== cover);
  // Long write-ups keep the page readable: a short gallery up top, the rest below as the "tour".
  const split = p.deep ? 4 : allShots.length;
  const gallery = allShots.slice(0, split);
  const tour = allShots.slice(split);
  const vt = { viewTransitionName: `cover-${p.slug}` } as CSSProperties;
  const figure = (s: (typeof allShots)[number], lazy = true) => (
    <figure key={s.src} className={s.width / s.height > 8 ? "strip" : undefined}>
      {/* Very wide captures (the IKAI bar) are shown full width and zoomed, scrollable sideways. */}
      <div className="shot">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={s.src} width={s.width} height={s.height} alt={s.alt[locale]} loading={lazy ? "lazy" : undefined} decoding="async" />
      </div>
      <figcaption>{s.alt[locale]}</figcaption>
    </figure>
  );

  return (
    <>
      <article className="sec chapter-intro" aria-labelledby="chapter-title">
        <p className="eyebrow">{t("exp.chapter")} {p.chapter} // {p.stack.join(" · ")}</p>
        <h1 id="chapter-title" className="chapter-title">{p.name}</h1>
        <p className="lead">{p.tagline[locale]}</p>
        <div className="chapter-meta"><span className="chip">{p.status[locale]}</span></div>

        {cover && (
          <figure className="banner" style={vt}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={cover.src} width={cover.width} height={cover.height} alt={cover.alt[locale]} decoding="async" fetchPriority="high" />
            <figcaption>{cover.alt[locale]}</figcaption>
          </figure>
        )}

        {gallery.length > 0 && <div className="gallery">{gallery.map((s) => figure(s))}</div>}

        <div className="chapter-grid">
          <section><h2>{t("exp.summary")}</h2><p>{p.summary[locale]}</p></section>
          <section><h2>{t("exp.built")}</h2><p>{p.built[locale]}</p></section>
          <section><h2>{t("exp.learned")}</h2><p>{p.learned[locale]}</p></section>
        </div>

        {p.deep && (
          <div className="deep">
            {p.deep.map((s) => (
              <section key={s.title.en}>
                <h2>{s.title[locale]}</h2>
                <ul>{s.points.map((pt) => <li key={pt.en}>{pt[locale]}</li>)}</ul>
              </section>
            ))}
          </div>
        )}

        {p.architecture && (
          <section className="arch" aria-labelledby="arch-title">
            <h2 id="arch-title">{p.architecture.title[locale]}</h2>
            <p className="lead">{p.architecture.lead[locale]}</p>
            <ol className="arch-layers">
              {p.architecture.layers.map((l) => (
                <li key={l.name}><strong>{l.name}</strong><span>{l.role[locale]}</span></li>
              ))}
            </ol>
            <div className="arch-decisions">
              {p.architecture.decisions.map((d) => (
                <div key={d.title.en}><h3>{d.title[locale]}</h3><p>{d.body[locale]}</p></div>
              ))}
            </div>
            <h3 className="arch-process-title">{p.architecture.process.title[locale]}</h3>
            <ol className="arch-process">
              {p.architecture.process.steps.map((s) => <li key={s.en}>{s[locale]}</li>)}
            </ol>
          </section>
        )}

        {tour.length > 0 && (
          <section className="tour" aria-labelledby="tour-title">
            <h2 id="tour-title">{locale === "es" ? "Recorrido por la demo: panel de administración y cuenta del cliente" : "Demo tour: the admin panel and the customer account"}</h2>
            <div className="gallery">{tour.map((s) => figure(s))}</div>
          </section>
        )}

        {p.slug === "javascript-para-subir-de-nivel" && <EventLoopLab locale={locale} />}

        <h2 className="sr-only">{t("exp.evidence")}</h2>
        <div className="links">
          {p.links.map((l) => <a key={l.url} className="btn primary" href={l.url} target="_blank" rel="noopener noreferrer">{t(`link.${l.kind}` as UiKey)}<ExternalLink className="ic" size={16} aria-hidden="true" /></a>)}
          <a className="btn" href={withBase(placeById("projects").path[locale])}><ArrowLeft className="ic" size={16} aria-hidden="true" />{t("exp.back")}</a>
        </div>
        {p.credit && <p className="tiny credit">{p.credit[locale]}</p>}
      </article>
      <div className="sec"><PlaceNav locale={locale} place="projects" /></div>
    </>
  );
}
