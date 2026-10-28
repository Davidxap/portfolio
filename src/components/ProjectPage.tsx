import type { CSSProperties } from "react";
import type { Locale, Project } from "@/data/projects";
import { coverShot, previews } from "@/data/media";
import { placeById } from "@/data/places";
import { useT, type UiKey } from "@/i18n/ui";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { EventLoopLab } from "./EventLoopLab";
import { PlaceNav } from "./world/PlaceNav";

export function ProjectPage({ locale, project: p }: { locale: Locale; project: Project }) {
  const t = useT(locale);
  const cover = coverShot(p.slug);
  const gallery = (previews[p.slug] ?? []).filter((s) => s !== cover);
  const vt = { viewTransitionName: `cover-${p.slug}` } as CSSProperties;

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

        {gallery.length > 0 && (
          <div className="gallery">
            {gallery.map((s) => (
              <figure key={s.src} className={s.width / s.height > 8 ? "strip" : undefined}>
                {/* Very wide captures (the IKAI bar) are shown full width and zoomed, scrollable sideways. */}
                <div className="shot">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={s.src} width={s.width} height={s.height} alt={s.alt[locale]} loading="lazy" decoding="async" />
                </div>
                <figcaption>{s.alt[locale]}</figcaption>
              </figure>
            ))}
          </div>
        )}

        <div className="chapter-grid">
          <section><h2>{t("exp.summary")}</h2><p>{p.summary[locale]}</p></section>
          <section><h2>{t("exp.built")}</h2><p>{p.built[locale]}</p></section>
          <section><h2>{t("exp.learned")}</h2><p>{p.learned[locale]}</p></section>
        </div>

        {p.slug === "javascript-para-subir-de-nivel" && <EventLoopLab locale={locale} />}

        <h2 className="sr-only">{t("exp.evidence")}</h2>
        <div className="links">
          {p.links.map((l) => <a key={l.url} className="btn primary" href={l.url} target="_blank" rel="noopener noreferrer">{t(`link.${l.kind}` as UiKey)}<ExternalLink className="ic" size={16} aria-hidden="true" /></a>)}
          <a className="btn" href={placeById("projects").path[locale]}><ArrowLeft className="ic" size={16} aria-hidden="true" />{t("exp.back")}</a>
        </div>
        {p.credit && <p className="tiny credit">{p.credit[locale]}</p>}
      </article>
      <div className="sec"><PlaceNav locale={locale} place="projects" /></div>
    </>
  );
}
