"use client";
import { useEffect, useRef, useState } from "react";
import "@/styles/demos/zen.css";
import { play } from "@/lib/sound";
import { PALETTES, ZEN_GOAL, cyclePalette, isComplete, isMatch, newRound, nextRound, type Round } from "@/lib/games/zen";
import { useConsoleInput, useStep, type Action } from "../input";
import { HowTo, useHowTo } from "../HowTo";
import { withBase } from "@/lib/base";

const T = {
  en: {
    goal: "Match 5 palettes in a row", count: "Matched", target: "Target", now: "Desktop", hint: "Left/right or Enter / click: change the desktop palette to the one in the floating window",
    matched: "Matched", prev: "Previous palette", next: "Next palette",
    doneTitle: "All calm", doneBody: "Five palettes matched. One command recolours the whole desktop, and that is what omarchy-zen does for Omarchy and the Zen browser.", again: "Enter · Try again",
    names: { lavender: "Lavender", moss: "Moss", ember: "Ember", tide: "Tide", paper: "Paper" } as Record<string, string>,
    scene: "A misty lavender zen garden with a floating browser window",
  },
  es: {
    goal: "Empareja 5 paletas seguidas", count: "Emparejadas", target: "Objetivo", now: "Escritorio", hint: "Izq/der o Enter / clic: cambia la paleta del escritorio hasta igualar la de la ventana flotante",
    matched: "Emparejada", prev: "Paleta anterior", next: "Paleta siguiente",
    doneTitle: "Todo en calma", doneBody: "Cinco paletas emparejadas. Un solo comando cambia los colores de todo el escritorio, y eso hace omarchy-zen para Omarchy y el navegador Zen.", again: "Enter · Otra vez",
    names: { lavender: "Lavanda", moss: "Musgo", ember: "Brasa", tide: "Marea", paper: "Papel" } as Record<string, string>,
    scene: "Un jardín zen de lavanda entre la niebla con una ventana de navegador flotante",
  },
} as const;

const reduced = () => typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
const seed = () => Math.floor(Math.random() * 1_000_000);

// @step palettes: Each palette is plain data (background, text, accent and a hue tint); the rules live in lib/games/zen.
// @paso palettes: Cada paleta son datos simples (fondo, texto, acento y un tinte); las reglas viven en lib/games/zen.
/** Zen: a calm "match the palette" puzzle on top of David's zen landscape. Goal: match 5 palettes in a row. */
export function ZenDemo({ locale }: { locale: "en" | "es" }) {
  const t = T[locale];
  const step = useStep();
  const how = useHowTo("zen");
  const [r, setR] = useState<Round>(() => newRound(seed()));
  const [won, setWon] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  const live = useRef({ r, won });
  live.current = { r, won };
  useEffect(() => () => window.clearTimeout(timer.current), []);

  // @step change-theme: The arrows or Enter cycle the palette index, like running the theme command once for the whole system.
  // @paso change-theme: Las flechas o Enter avanzan el índice de paleta, como ejecutar una sola vez el comando de tema para todo el sistema.
  const change = (dir: 1 | -1) => {
    const c = live.current;
    if (c.won || isComplete(c.r)) return;
    const next = { ...c.r, current: cyclePalette(c.r.current, dir) };
    setR(next);
    step("change-theme");
    // @step match: A round is won the moment the desktop palette equals the target; then the next round starts after a calm pause.
    // @paso match: Una ronda se gana en cuanto la paleta del escritorio iguala el objetivo; luego empieza la siguiente tras una pausa tranquila.
    if (isMatch(next)) {
      step("match"); setWon(true); play("confirm");
      timer.current = window.setTimeout(() => {
        const n = nextRound(live.current.r, seed());
        setR(n); setWon(false);
        if (isComplete(n)) { step("finish"); play("epic"); }
      }, reduced() ? 500 : 1500);
    } else play("blip");
  };

  const again = () => { setR(newRound(seed())); setWon(false); play("back"); };
  useConsoleInput((a: Action) => {
    if (how.openRef.current) { if (a === "a" || a === "b") how.hide(); return; }
    if (isComplete(live.current.r)) { if (a === "a") again(); return; }
    if (a === "right" || a === "a") change(1);
    else if (a === "left") change(-1);
  });

  const p = PALETTES[r.current], tg = PALETTES[r.target];
  const [hue, sat, bri] = p.hue;
  const complete = isComplete(r);
  const vars = { "--zbg": p.bg, "--zfg": p.fg, "--zac": p.ac, "--tbg": tg.bg, "--tfg": tg.fg, "--tac": tg.ac } as React.CSSProperties;

  // @step finish: After five matches a calm screen replaces the puzzle; Enter starts again.
  // @paso finish: Tras cinco emparejamientos una pantalla tranquila reemplaza el puzzle; Enter empieza de nuevo.
  return (
    <div className="dm dm-zenmatch" style={vars} data-won={won} data-done={complete}>
      <header className="zm-head">
        <b>omarchy-zen</b>
        <span>{t.goal}</span>
        <em aria-live="polite">{t.count} {Math.min(r.solved, ZEN_GOAL)}/{ZEN_GOAL}<span className="zm-pips" aria-hidden="true">{Array.from({ length: ZEN_GOAL }, (_, i) => <i key={i} className={i < r.solved ? "on" : ""} />)}</span></em>
      </header>

      <div className="zm-stage">
        <div className="zm-scene">
          <picture>
            <source srcSet={withBase("/art/v3/games/zen-landscape.avif")} type="image/avif" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={withBase("/art/v3/games/zen-landscape.webp")} alt={t.scene} width={1500} height={632} decoding="async" draggable={false} style={{ filter: `hue-rotate(${hue}deg) saturate(${sat}%) brightness(${bri}%)` }} />
          </picture>
          <i className="zm-tint" />
          <div className={`zm-window${won ? " won" : ""}`} aria-label={`${t.target}: ${t.names[tg.id]}`}>
            <span className="zm-dots"><i /><i /><i /></span>
            <span className="zm-pane"><i /><i /><i /></span>
            <b>{won ? t.matched : t.names[tg.id]}</b>
          </div>
          {won && <span className="zm-bloom" aria-hidden="true">{Array.from({ length: 9 }, (_, i) => <i key={i} style={{ "--i": i } as React.CSSProperties} />)}</span>}
        </div>
        {complete && (
          <div className="zm-done" role="status">
            <b>{t.doneTitle}</b>
            <p>{t.doneBody}</p>
            <button type="button" onClick={again}>{t.again}</button>
          </div>
        )}
      </div>

      <div className="zm-bar">
        <button type="button" onClick={() => change(-1)} aria-label={t.prev} disabled={complete}>‹</button>
        <span className="zm-chip"><i style={{ background: tg.ac }} />{t.target}: <b>{t.names[tg.id]}</b></span>
        <span className="zm-chip now"><i style={{ background: p.ac }} />{t.now}: <b>{t.names[p.id]}</b></span>
        <button type="button" onClick={() => change(1)} aria-label={t.next} disabled={complete}>›</button>
      </div>
      <p className="zm-hint">{complete ? "" : t.hint}</p>
      <HowTo id="zen" locale={locale} how={how} />
    </div>
  );
}
