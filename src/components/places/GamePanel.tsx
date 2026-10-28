import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import { gamePath, useT, type UiKey } from "@/i18n/ui";
import { gameTitle, games, type Game } from "@/data/games";
import { placeById } from "@/data/places";
import type { Locale } from "@/data/projects";
import { parseWalkthrough } from "@/lib/walkthrough";
import { GameStage } from "../world/GameStage";
import { PlaceNav } from "../world/PlaceNav";

/** One arcade game: the lazy demo plus the annotated code that runs it (walkthrough parsed at build time). */
export async function GamePanel({ locale, game }: { locale: Locale; game: Game }) {
  const t = useT(locale);
  const { code, steps } = parseWalkthrough((await readFile(join(process.cwd(), "src/components/console/demos", game.source), "utf8")).trim());
  const next = games[(games.indexOf(game) + 1) % games.length];
  return (
    <article className="panel" aria-labelledby="game-title">
      <header className="panel-head" data-art="false">
        <div className="panel-head-body">
          <span className="numeral" aria-hidden="true">05</span>
        <div>
          <p className="eyebrow">{placeById("arcade").label[locale].toUpperCase()} // {t(`arcade.style.${game.style}` as UiKey)}</p>
          <h1 id="game-title">{gameTitle(game, locale)}</h1>
          <p className="lead">{game.blurb[locale]}</p>
          {game.origin && <p className="game-origin mono">{game.origin.note[locale]}</p>}
        </div>
        </div>
      </header>
      <GameStage
        id={game.id} locale={locale} code={code} steps={steps}
        labels={{ loading: t("game.loading"), code: t("play.code"), note: t("play.note"), noscript: t("game.noscript"), back: t("game.back") }}
        title={gameTitle(game, locale)}
      />
      <nav className="place-nav" aria-label={t("arcade.all")}>
        <Link className="btn primary" href={gamePath(locale, next.id)}><ArrowRight size={16} aria-hidden="true" />{t("pl.next")}: {next.title}</Link>
        <Link className="btn" href={placeById("arcade").path[locale]}><ArrowLeft size={16} aria-hidden="true" />{t("arcade.all")}</Link>
      </nav>
      <PlaceNav locale={locale} place="arcade" />
    </article>
  );
}
