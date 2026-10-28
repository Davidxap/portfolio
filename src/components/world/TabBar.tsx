import Link from "next/link";
import { places, type PlaceId } from "@/data/places";
import type { Locale } from "@/data/projects";
import { useW } from "@/i18n/world";
import { ArtIcon } from "./icons";

/** The workspace tabs at the bottom of the phone screen view: the six places as real links, the active one marked. Hidden
 * above 720 px, where the desktop bar's workspaces do the same job. */
export function TabBar({ locale, current }: { locale: Locale; current: PlaceId | null }) {
  const w = useW(locale);
  return (
    <nav className="tabbar" aria-label={w("tabs.label")}>
      {places.map((p, i) => (
        <Link key={p.id} href={p.path[locale]} className="tab-place" aria-current={current === p.id ? "page" : undefined} aria-keyshortcuts={String(i + 1)}>
          <ArtIcon name={p.id} size={26} className="tab-icon" />
          <span>{p.label[locale]}</span>
        </Link>
      ))}
    </nav>
  );
}
