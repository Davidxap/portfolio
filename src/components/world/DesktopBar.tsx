"use client";
import Link from "next/link";
import type { CSSProperties } from "react";
import { places, type PlaceId } from "@/data/places";
import type { Locale } from "@/data/projects";
import { person } from "@/data/site";
import { cvPath, homePath } from "@/i18n/ui";
import { useW } from "@/i18n/world";
import { BrandMark } from "./BrandMark";
import { Guide } from "./Guide";
import { ArtIcon } from "./icons";
import { LiveTime } from "./LiveTime";
import { ModeSwitch } from "./ModeSwitch";
import { Settings } from "./TopBar";

type Props = { locale: Locale; altPath: string; active: PlaceId | null; visited: string[] };

/** The desktop's status bar, in the spirit of Waybar / the IKAI shell: a thin translucent blurred rounded bar.
 * Left: the name and the six workspaces (one per place, an animated pill marks the active one, a dot marks the visited ones).
 * Centre: the clock with the city. Right: the Interactive / Direct switch, theme, EN/ES, sound, the "?" guide and the CV in the call-to-action colour. */
export function DesktopBar({ locale, altPath, active, visited }: Props) {
  const w = useW(locale);
  const idx = active ? places.findIndex((p) => p.id === active) : -1;
  return (
    <header className="bar" role="banner">
      <div className="bar-pill bar-left">
        <Link className="bar-brand" href={homePath(locale)} aria-label={`${person.shortName} · ${w("top.home")}`} title={w("top.home")}>
          <BrandMark size={16} />
          <span className="bar-name">{person.shortName}</span>
        </Link>
        <nav className="ws" aria-label={w("ws.label")} style={{ "--i": Math.max(idx, 0) } as CSSProperties} data-on={idx >= 0}>
          <span className="ws-pill" aria-hidden="true" />
          {places.map((p, i) => (
            <Link key={p.id} className="ws-btn" href={p.path[locale]} aria-label={p.label[locale]} title={`${i + 1} · ${p.label[locale]}`} aria-current={active === p.id ? "page" : undefined} aria-keyshortcuts={String(i + 1)} data-seen={visited.includes(p.id)}>
              <span className="ws-num mono">{i + 1}</span>
            </Link>
          ))}
        </nav>
      </div>
      <div className="bar-pill bar-mid" aria-label={w("clock.label")}>
        <ArtIcon name="map" size={18} className="bar-ic" />
        <span className="bar-city">{w("clock.city")}</span>
        <LiveTime label={w("clock.tip")} />
      </div>
      <div className="bar-pill bar-right">
        <ModeSwitch locale={locale} mode="interactive" />
        <Settings locale={locale} altPath={altPath} />
        <Guide locale={locale} />
        <a className="btn cta pill-cv" href={cvPath(locale)} download aria-label={w("top.cvLabel")}><ArtIcon name="cv" size={20} /><span>{w("top.cv")}</span></a>
      </div>
    </header>
  );
}
