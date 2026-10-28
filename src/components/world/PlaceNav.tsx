import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { nextPlace, placeById, placeIndex, type PlaceId } from "@/data/places";
import type { Locale } from "@/data/projects";
import { person } from "@/data/site";
import { useT } from "@/i18n/ui";
import { ArtIcon } from "./icons";

/** Closes every place panel: where to go next (curiosity colour) and how to reach David (the ember CTA). */
export function PlaceNav({ locale, place }: { locale: Locale; place: PlaceId }) {
  const t = useT(locale);
  const next = nextPlace(place);
  return (
    <nav className="place-nav" aria-label={`${t("pl.next")} / ${t("pl.touch")}`}>
      <Link className="btn primary" href={next.path[locale]} data-next-place>
        <ArtIcon name={next.id} size={26} />
        <span><small>{t("pl.next")} · {placeIndex(next.id) + 1}</small>{next.label[locale]}</span>
        <ArrowRight className="ic" size={18} aria-hidden="true" />
      </Link>
      {place === "contact"
        ? <a className="btn cta" href={`mailto:${person.email}`}><ArtIcon name="contact" size={26} />{t("pl.touch")}</a>
        : <Link className="btn cta" href={placeById("contact").path[locale]}><ArtIcon name="contact" size={26} />{t("pl.touch")}</Link>}
    </nav>
  );
}
