"use client";
import { useEffect, useRef, useState } from "react";
import "@/styles/demos/packs.css";
import { play } from "@/lib/sound";
import { PACK_CARDS, PACK_SIZE, TOTAL_CARDS, collect, mulberry32, openPack, rarityOf, type PackCard, type Rarity } from "@/lib/games/packs";
import { CardArt, PaintedArt } from "../CardArt";
import { HowTo, useHowTo } from "../HowTo";
import { useConsoleInput, useStep } from "../input";
import { withBase } from "@/lib/base";

// @step copy: Every visible string lives in one table per language; card names and flavour lines come from the pure rules module.
// @paso copy: Todo el texto visible está en una tabla por idioma; los nombres y frases de las cartas vienen del módulo de reglas puro.
const T = {
  en: {
    title: "Card Packs", found: "Cards found", sealed: "A sealed pack", open: "Open the pack", another: "Open another pack", opening: "Opening...",
    hintSealed: "Click the pack or press Enter to open it", hintOpen: "Enter or click: open another pack · Esc: back", fresh: "New",
    rarity: { common: "Common", uncommon: "Uncommon", rare: "Rare" } as Record<Rarity, string>, pack: "Pack", cards: "Cards in this pack", done: "You found all 18 creatures!",
  },
  es: {
    title: "Sobres de cartas", found: "Cartas encontradas", sealed: "Un sobre cerrado", open: "Abrir el sobre", another: "Abrir otro sobre", opening: "Abriendo...",
    hintSealed: "Haz clic en el sobre o pulsa Enter para abrirlo", hintOpen: "Enter o clic: abrir otro sobre · Esc: volver", fresh: "Nueva",
    rarity: { common: "Común", uncommon: "Poco común", rare: "Rara" } as Record<Rarity, string>, pack: "Sobre", cards: "Cartas de este sobre", done: "¡Encontraste las 18 criaturas!",
  },
} as const;

const byId = new Map(PACK_CARDS.map((c) => [c.id, c]));
const seed = () => Math.floor(Math.random() * 2 ** 32);
const reduced = () => typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
const TEAR_MS = 780;

function Face({ card, locale }: { card: PackCard; locale: "en" | "es" }) {
  return (
    <div className="pk-face">
      <div className={`pk-window${card.painted ? " painted" : ""}`}>{card.painted ? <PaintedArt id={card.id} /> : <CardArt art={card.art} />}</div>
      <span className="pk-name">{card.name[locale]}</span>
    </div>
  );
}

/** A very simple card-pack minigame: tear open a sealed pack and five random cards fan out face up. Collect all 18 creatures. */
export function PacksDemo({ locale }: { locale: "en" | "es" }) {
  const t = T[locale];
  const step = useStep();
  const how = useHowTo("tcg");
  const [phase, setPhase] = useState<"sealed" | "tearing" | "open">("sealed");
  const [pack, setPack] = useState<string[]>([]);
  const [fresh, setFresh] = useState<string[]>([]);
  const [owned, setOwned] = useState<string[]>([]);
  const [opened, setOpened] = useState(0);
  const timer = useRef<number | undefined>(undefined);
  const live = useRef({ phase, owned });
  live.current = { phase, owned };
  useEffect(() => () => window.clearTimeout(timer.current), []);

  // @step open: Opening tears the pack (a short animation), then one seeded generator rolls the five cards; the rarity table lives in lib/games/packs.
  // @paso open: Abrir rompe el sobre (una animación corta) y un generador con semilla saca las cinco cartas; la tabla de rarezas vive en lib/games/packs.
  const openIt = () => {
    const c = live.current;
    if (c.phase === "tearing") return;
    step("open"); play("flip");
    setPhase("tearing");
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      const cards = openPack(mulberry32(seed()));
      // @step collect: Each new card is added to the collection once, so the counter only grows when you find something you did not have.
      // @paso collect: Cada carta nueva se agrega una sola vez a la colección, así que el contador solo sube cuando encuentras algo que no tenías.
      const next = collect(live.current.owned, cards);
      step("collect");
      setFresh(cards.filter((id) => !live.current.owned.includes(id)));
      setOwned(next); setPack(cards); setOpened((n) => n + 1); setPhase("open");
      play(cards.some((id) => rarityOf(id) === "rare") ? "epic" : "confirm");
    }, reduced() ? 0 : TEAR_MS);
  };

  useConsoleInput((a) => {
    if (how.openRef.current) { if (a === "a" || a === "b") how.hide(); return; }
    if (a === "a") openIt();
  });

  const best = pack.length ? byId.get(pack[pack.length - 1])! : null;
  const complete = owned.length >= TOTAL_CARDS;

  return (
    <div className="dm dm-pk" data-phase={phase}>
      <header className="pk-bar">
        <b className="pk-title">{t.title}</b>
        <span className="pk-count" aria-live="polite"><i aria-hidden="true" />{t.found}: <strong>{owned.length}/{TOTAL_CARDS}</strong></span>
      </header>

      <div className="pk-stage">
        {phase !== "open" ? (
          <button type="button" className="pk-pack" data-tear={phase === "tearing"} onClick={openIt} aria-label={phase === "tearing" ? t.opening : t.open} disabled={phase === "tearing"}>
            <span className="pk-burst" aria-hidden="true" />
            <span className="pk-body">
              <picture>
                <source srcSet={withBase("/art/v3/games/card-back.avif")} type="image/avif" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={withBase("/art/v3/games/card-back.webp")} alt="" width={492} height={762} decoding="async" draggable={false} />
              </picture>
              <span className="pk-foil" aria-hidden="true" />
              <span className="pk-label" aria-hidden="true"><b>{t.title}</b><small>{PACK_SIZE}</small></span>
            </span>
            <span className="pk-top" aria-hidden="true" />
          </button>
        ) : (
          <ul className="pk-fan" aria-label={t.cards}>
            {pack.map((id, i) => {
              const card = byId.get(id)!;
              const r = rarityOf(id);
              return (
                <li key={`${opened}-${id}`} className="pk-card" data-r={r} style={{ "--i": i, "--n": pack.length } as React.CSSProperties}>
                  <Face card={card} locale={locale} />
                  <span className="pk-rar">{t.rarity[r]}</span>
                  {fresh.includes(id) && <span className="pk-new">{t.fresh}</span>}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="pk-foot">
        {phase === "open" ? (
          <>
            <p className="pk-line" aria-live="polite">{complete ? t.done : best ? <em>{best.name[locale]}: {best.line[locale]}</em> : null}</p>
            <button type="button" className="pk-btn" onClick={openIt} autoFocus={false}>{t.another}</button>
          </>
        ) : (
          <>
            <p className="pk-line">{phase === "tearing" ? t.opening : t.sealed}</p>
            <button type="button" className="pk-btn" onClick={openIt} disabled={phase === "tearing"}>{t.open}</button>
          </>
        )}
      </div>
      <p className="dm-hint pk-hint">{phase === "open" ? t.hintOpen : t.hintSealed}</p>
      <HowTo id="tcg" locale={locale} how={how} />
    </div>
  );
}
