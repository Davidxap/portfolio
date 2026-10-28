import { placeById, placeIndex, type PlaceId } from "@/data/places";
import type { Locale } from "@/data/projects";
import { useW } from "@/i18n/world";
import { ArtIcon } from "../world/icons";
import { PixelDavid } from "../world/PixelDavid";
import { withBase } from "@/lib/base";

/** Header art per place: the crops in public/art/v3/cards. `pos` is the CSS object-position that frames the subject. */
const ART: Partial<Record<PlaceId, { name: string; w: number; h: number; pos: string }>> = {
  about: { name: "2026-about", w: 640, h: 418, pos: "50% 34%" },
  projects: { name: "2026-projects", w: 640, h: 388, pos: "50% 36%" },
  experience: { name: "2026-experience", w: 640, h: 335, pos: "35% 45%" },
  stack: { name: "2026-stack", w: 640, h: 408, pos: "50% 50%" },
  arcade: { name: "2026-arcade", w: 640, h: 377, pos: "30% 55%" },
  contact: { name: "2026-contact", w: 640, h: 295, pos: "50% 55%" },
};

export function CardArt({ name, w, h, pos = "50% 50%", className }: { name: string; w: number; h: number; pos?: string; className?: string }) {
  return (
    <picture className={className}>
      <source type="image/avif" srcSet={withBase(`/art/v3/cards/${name}.avif`)} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={withBase(`/art/v3/cards/${name}.webp`)} width={w} height={h} alt="" loading="lazy" decoding="async" style={{ objectPosition: pos }} />
    </picture>
  );
}

/** A headline in two voices: roman, then the last word in italic. Works in any language and leaves the full text in one heading. */
export function Headline({ text }: { text: string }) {
  const i = text.lastIndexOf(" ");
  if (i < 0) return <em>{text}</em>;
  return <>{text.slice(0, i)} <em>{text.slice(i + 1)}</em></>;
}

/** Header of a place panel: the place's art crop, a big outlined index numeral (the place's keycap number), eyebrow and the title.
 * The page's H1, or an H2 when the panel is embedded. */
export function PanelHead({ locale, place, title, lead, embedded, art = true }: { locale: Locale; place: PlaceId; title: string; lead?: string; embedded?: boolean; art?: boolean }) {
  const w = useW(locale);
  const p = placeById(place);
  const a = ART[place];
  const H = embedded ? "h2" : "h1";
  const n = String(placeIndex(place) + 1).padStart(2, "0");
  return (
    <header className="panel-head pdavid-host" data-art={art && !!a}>
      {art && a && <figure className="panel-art" aria-hidden="true"><CardArt name={a.name} w={a.w} h={a.h} pos={a.pos} /></figure>}
      <div className="panel-head-body">
        <span className="numeral" aria-hidden="true">{n}</span>
        <div className="panel-head-text">
          <p className="eyebrow">{w("head.place")} {n} · {p.label[locale]}</p>
          <H id={`${place}-title`}><Headline text={title} /></H>
          {lead && <p className="lead">{lead}</p>}
        </div>
        {place === "about" ? <PixelDavid className="panel-avatar" height={132} /> : <ArtIcon name={place} size={44} className="panel-icon" />}
      </div>
    </header>
  );
}
