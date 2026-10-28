import { Gamepad2 } from "lucide-react";
import Link from "next/link";
import { arcadeIntro } from "@/data/arcade";
import { gameTitle, games } from "@/data/games";
import type { Locale } from "@/data/projects";
import { gamePath, useT, type UiKey } from "@/i18n/ui";
import { useW } from "@/i18n/world";
import { PlaceNav } from "../world/PlaceNav";

/** Arcade as a game launcher: one tile per game in the registry (its painted thumbnail), its style, the one-line
 * goal and a Launch control. A game opens in its own window beside this one. The registry decides the tiles, so a new game appears by itself. */
export function ArcadePanel({ locale, embedded, h1 = true }: { locale: Locale; embedded?: boolean; h1?: boolean }) {
  const t = useT(locale);
  const w = useW(locale);
  return (
    <article className="panel launcher" aria-labelledby={h1 ? "arcade-title" : undefined} aria-label={h1 ? undefined : w("head.arcade")}>
      <header className="lg-head">
        <p className="lg-eyebrow mono">{w("launch.library")} · {games.length}</p>
        {h1 ? <h1 id="arcade-title">{w("head.arcade")}</h1> : <p className="lg-h">{w("head.arcade")}</p>}
      </header>
      <section className="arcade-intro" aria-labelledby="arcade-intro-title">
        <h2 id="arcade-intro-title">{arcadeIntro.title[locale]}</h2>
        <p>{arcadeIntro.body[locale]}</p>
      </section>
      <ul className="lg-grid">
        {games.map((g, i) => {
          return (
            <li key={g.id} className="lg-tile" data-style={g.style} style={{ "--i": i } as React.CSSProperties}>
              <Link className="lg-link" href={gamePath(locale, g.id)}>
                {g.thumb ? (
                  <figure className="lg-art">
                    <picture>
                      <source srcSet={`${g.thumb}.avif`} type="image/avif" />
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={`${g.thumb}.webp`} width={640} height={427} alt={`${gameTitle(g, locale)}: ${t("arcade.thumbAlt" as UiKey)}`} loading="lazy" decoding="async" />
                    </picture>
                  </figure>
                ) : null}
                <span className="lg-play" aria-hidden="true"><Gamepad2 size={16} />{w("launch.play")}</span>
                <span className="lg-meta">
                  <span className="chip">{t(`arcade.style.${g.style}` as UiKey)}</span>
                  <b className="lg-title">{gameTitle(g, locale)}</b>
                  <span className="lg-blurb">{g.blurb[locale]}</span>
                  {g.origin && <span className="game-origin mono">{g.origin.note[locale]}</span>}
                  <span className="sr-only">{w("arcade.open")}: {gameTitle(g, locale)}</span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
      {!embedded && h1 && <PlaceNav locale={locale} place="arcade" />}
    </article>
  );
}
