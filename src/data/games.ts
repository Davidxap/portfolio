// The arcade: one demo module (src/components/console/demos) plus one entry here per game. The page lazy-loads the module.
import type { ComponentType } from "react";
import type { Locale } from "./projects";
import { withBase } from "@/lib/base";

export type GameStyle = "painterly" | "pixel-horror" | "glass" | "retro";
type L = Record<Locale, string>;

export type Game = {
  id: string;
  title: string;
  /** Spanish title when it differs from `title` (read it through `gameTitle`). */
  titleEs?: string;
  blurb: L;
  style: GameStyle;
  /** Demo file name in src/components/console/demos; its text is the annotated walkthrough shown beside the game. */
  source: string;
  load: () => Promise<{ default: ComponentType<{ locale: Locale }> }>;
  /** Where the game comes from: a projects.ts slug (or the plain repo name when the project has no page) and a one-line note. */
  /** Real capture of the minigame (path without extension; .avif and .webp exist). Regenerate with scripts/capture/games.mjs. */
  thumb?: string;
  origin?: { project: string; note: L };
  /** The short "How to play" shown before the action: the goal in one line, 2 or 3 numbered steps and the controls. */
  howTo: HowToText;
};

export type HowToText = { goal: L; steps: L[]; controls: L };
const h = (goal: [string, string], steps: [string, string][], controls: [string, string]): HowToText => ({
  goal: { en: goal[0], es: goal[1] }, steps: steps.map(([en, es]) => ({ en, es })), controls: { en: controls[0], es: controls[1] },
});

export const games: Game[] = [
  {
    id: "tcg", title: "Card Packs", titleEs: "Sobres de cartas", style: "painterly", source: "PacksDemo.tsx",
    blurb: { en: "Open card packs and find all 18 creatures, from common to rare", es: "Abre sobres de cartas y encuentra las 18 criaturas, de comunes a raras" },
    load: () => import("@/components/console/demos/PacksDemo").then((m) => ({ default: m.PacksDemo })),
    howTo: h(
      ["Open card packs and collect all 18 creatures.", "Abre sobres de cartas y reúne las 18 criaturas."],
      [["Click the sealed pack, or press Enter, to tear it open.", "Haz clic en el sobre cerrado, o pulsa Enter, para abrirlo."],
        ["Five random cards appear at once. The glow shows how rare each one is.", "Aparecen cinco cartas al azar a la vez. El brillo indica qué tan rara es cada una."],
        ["Press Open another pack to keep going. The counter shows how many different cards you have found.", "Pulsa Abrir otro sobre para seguir. El contador muestra cuántas cartas distintas has encontrado."]],
      ["Enter or click: open a pack · Esc: back", "Enter o clic: abrir un sobre · Esc: volver"]),
    thumb: withBase("/art/v3/games/thumbs/tcg"),
    origin: { project: "tcg-store", note: { en: "From TCG Store, my trading-card shop", es: "De TCG Store, mi tienda de cartas coleccionables" } },
  },
  {
    id: "ikai", title: "IKAI Shell", style: "pixel-horror", source: "IkaiDemo.tsx",
    blurb: { en: "Escape three rooms: solve one puzzle in each and open the last door", es: "Escapa de tres cuartos: resuelve un acertijo en cada uno y abre la última puerta" },
    load: () => import("@/components/console/demos/IkaiDemo").then((m) => ({ default: m.IkaiDemo })),
    thumb: withBase("/art/v3/games/thumbs/ikai"),
    howTo: h(
      ["Escape the three rooms by solving one puzzle in each.", "Escapa de los tres cuartos resolviendo un acertijo en cada uno."],
      [["Move the light with the mouse, or step through the clues with the arrow keys. Press Enter or click to inspect.", "Mueve la luz con el mouse, o recorre las pistas con las flechas. Pulsa Enter o haz clic para inspeccionar."],
        ["Room 1: tune the radio until the voice clears and note the code. Room 2: press the three seals in order, fewest spiral turns first.", "Cuarto 1: sintoniza la radio hasta que se oiga la voz y anota el código. Cuarto 2: pulsa los tres sellos en orden, primero el de menos vueltas."],
        ["Room 3: type the code on the door. The notebook keeps every clue you find.", "Cuarto 3: escribe el código en la puerta. La libreta guarda cada pista que encuentres."]],
      ["Arrows: next clue · Enter or click: inspect · Esc: back", "Flechas: siguiente pista · Enter o clic: inspeccionar · Esc: volver"]),
    origin: { project: "ikai", note: { en: "From my IKAI Shell desktop shell", es: "De mi shell de escritorio IKAI Shell" } },
  },
  {
    id: "book", title: "JS Trivia", style: "glass", source: "BookDemo.tsx",
    blurb: { en: "Questions from my JavaScript book", es: "Preguntas de mi libro de JavaScript" },
    load: () => import("@/components/console/demos/BookDemo").then((m) => ({ default: m.BookDemo })),
    thumb: withBase("/art/v3/games/thumbs/book"),
    howTo: h(
      ["Answer 10 JavaScript questions and earn a rank.", "Responde 10 preguntas de JavaScript y consigue un rango."],
      [["Read the code and the question.", "Lee el código y la pregunta."],
        ["Pick one of the three answers with Up and Down, or click it.", "Elige una de las tres respuestas con Arriba y Abajo, o haz clic en ella."],
        ["Press Enter to confirm, read why, then press Enter again for the next question.", "Pulsa Enter para confirmar, lee por qué y pulsa Enter otra vez para la siguiente pregunta."]],
      ["Up/Down: choose · Enter or click: confirm · Esc: back", "Arriba/Abajo: elegir · Enter o clic: confirmar · Esc: volver"]),
    origin: { project: "javascript-para-subir-de-nivel", note: { en: "From my JavaScript book", es: "De mi libro de JavaScript" } },
  },
  {
    id: "eventloop", title: "Event Loop, step by step", style: "glass", source: "EventLoopDemo.tsx",
    blurb: { en: "An interactive explainer: watch the stack, the queues and the console move, one step at a time", es: "Un explicativo interactivo: mira cómo se mueven la pila, las colas y la consola, un paso a la vez" },
    load: () => import("@/components/console/demos/EventLoopDemo").then((m) => ({ default: m.EventLoopDemo })),
    thumb: withBase("/art/v3/games/thumbs/eventloop"),
    howTo: h(
      ["See in which order JavaScript runs your code.", "Mira en qué orden ejecuta JavaScript tu código."],
      [["Pick an example with the tabs at the top.", "Elige un ejemplo con las pestañas de arriba."],
        ["Press Play, or step with Left and Right, and watch the call stack, the Web APIs and the two queues.", "Pulsa Reproducir, o avanza con Izquierda y Derecha, y mira la pila de llamadas, las Web APIs y las dos colas."],
        ["Read the sentence under the animation: it says what just happened.", "Lee la frase bajo la animación: dice qué acaba de pasar."]],
      ["Left/Right: step · Enter: play or pause · Up/Down: example · Esc: back", "Izq/Der: paso · Enter: reproducir o pausar · Arriba/Abajo: ejemplo · Esc: volver"]),
    origin: { project: "javascript-para-subir-de-nivel", note: { en: "From my JavaScript book", es: "De mi libro de JavaScript" } },
  },
  {
    id: "zen", title: "omarchy-zen", style: "retro", source: "ZenDemo.tsx",
    blurb: { en: "Match 5 palettes in a row on a calm zen desktop", es: "Empareja 5 paletas seguidas en un escritorio zen y tranquilo" },
    load: () => import("@/components/console/demos/ZenDemo").then((m) => ({ default: m.ZenDemo })),
    thumb: withBase("/art/v3/games/thumbs/zen"),
    howTo: h(
      ["Make the desktop palette match the floating window, 5 times in a row.", "Haz que la paleta del escritorio sea igual a la de la ventana flotante, 5 veces seguidas."],
      [["Look at the colours of the floating window: that is the target.", "Mira los colores de la ventana flotante: ese es el objetivo."],
        ["Press Left or Right (or Enter, or click) to change the desktop palette.", "Pulsa Izquierda o Derecha (o Enter, o haz clic) para cambiar la paleta del escritorio."],
        ["When both palettes are the same you win the round. Win five rounds to finish.", "Cuando las dos paletas son iguales ganas la ronda. Gana cinco rondas para terminar."]],
      ["Left/Right or Enter or click: change palette · Esc: back", "Izq/Der o Enter o clic: cambiar la paleta · Esc: volver"]),
    origin: { project: "omarchy-zen", note: { en: "From omarchy-zen", es: "De omarchy-zen" } },
  },
  {
    id: "forecast", title: "Forecast", style: "glass", source: "ForecastDemo.tsx",
    blurb: { en: "Pack right for 5 forecasts: umbrella, sunglasses, jacket or coffee", es: "Empaca bien para 5 pronósticos: paraguas, gafas de sol, chaqueta o café" },
    load: () => import("@/components/console/demos/ForecastDemo").then((m) => ({ default: m.ForecastDemo })),
    thumb: withBase("/art/v3/games/thumbs/forecast"),
    howTo: h(
      ["Pack the right item for 5 weather forecasts.", "Empaca el objeto correcto para 5 pronósticos del clima."],
      [["Read the city and its weather.", "Lee la ciudad y su clima."],
        ["Choose umbrella, sunglasses, jacket or coffee with Left and Right.", "Elige paraguas, gafas de sol, chaqueta o café con Izquierda y Derecha."],
        ["Press Enter or click to pack it. Rain first, then cold, then sun, otherwise a coffee.", "Pulsa Enter o haz clic para empacarlo. Primero la lluvia, luego el frío, luego el sol, y si no, un café."]],
      ["Left/Right: choose · Enter or click: pack · Esc: back", "Izq/Der: elegir · Enter o clic: empacar · Esc: volver"]),
    origin: { project: "weather-app-react", note: { en: "Built from my university weather app (React, OpenWeatherMap)", es: "Hecho a partir de mi app del clima de la universidad (React, OpenWeatherMap)" } },
  },
  {
    id: "films", title: "Film Order", style: "painterly", source: "FilmsDemo.tsx",
    blurb: { en: "Put 5 films in release order, then reveal the years", es: "Pon 5 películas en orden de estreno y descubre los años" },
    load: () => import("@/components/console/demos/FilmsDemo").then((m) => ({ default: m.FilmsDemo })),
    thumb: withBase("/art/v3/games/thumbs/films"),
    howTo: h(
      ["Put 5 films in release order, oldest first.", "Pon 5 películas en orden de estreno, de la más antigua a la más nueva."],
      [["Select a card with the arrows and press Enter to pick it up.", "Selecciona una carta con las flechas y pulsa Enter para tomarla."],
        ["Move it left or right, then press Enter to drop it in place.", "Muévela a la izquierda o a la derecha y pulsa Enter para soltarla."],
        ["When the order looks right, go to the last stop, Reveal the years, and see your score.", "Cuando el orden te convenza, ve a la última parada, Revelar los años, y mira tu puntaje."]],
      ["Arrows: choose or move · Enter or click: pick up or drop · Esc: back", "Flechas: elegir o mover · Enter o clic: tomar o soltar · Esc: volver"]),
    origin: { project: "studio-ghilbli-api", note: { en: "From my university Studio Ghibli API explorer", es: "De mi explorador de la API de Studio Ghibli de la universidad" } },
  },
];

export const gameById = (id: string): Game | undefined => games.find((g) => g.id === id);

/** The game name in the reader's language. */
export const gameTitle = (g: Game, locale: "en" | "es"): string => (locale === "es" && g.titleEs) || g.title;
