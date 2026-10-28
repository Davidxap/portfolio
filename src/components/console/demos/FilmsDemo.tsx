"use client";
import { useRef, useState } from "react";
import "@/styles/demos/films.css";
import { play } from "@/lib/sound";
import { ORDER_GOAL, correctOrder, filmById, move, newRound, reveal, score, type Round } from "@/lib/games/films";
import { useConsoleInput, useStep, type Action } from "../input";
import { HowTo, useHowTo } from "../HowTo";

const T = {
  en: {
    goal: "Put 5 films in release order", oldest: "Oldest", newest: "Newest", arrange: "Arranging", inPlace: "in place",
    hint: "Arrows: choose · Enter / click: pick up or drop a card · last stop: Reveal", hintHeld: "Arrows: move the card · Enter / click: drop it",
    check: "Reveal the years", again: "Enter · Try again", earlier: "Move earlier", later: "Move later", year: "Year hidden",
    credit: "Inspired by my Studio Ghibli API university project; film facts only (titles, directors, release years).",
    verdicts: ["Back to the archive.", "A start.", "Getting warmer.", "Good memory.", "Nearly there.", "Perfect order."],
    held: "Holding", ok: "right place", no: "wrong place",
  },
  es: {
    goal: "Pon 5 películas en orden de estreno", oldest: "La más antigua", newest: "La más nueva", arrange: "Ordenando", inPlace: "en su lugar",
    hint: "Flechas: elegir · Enter / clic: tomar o soltar una carta · última parada: Revelar", hintHeld: "Flechas: mover la carta · Enter / clic: soltarla",
    check: "Revelar los años", again: "Enter · Otra vez", earlier: "Mover antes", later: "Mover después", year: "Año oculto",
    credit: "Inspirado en mi proyecto universitario con la API de Studio Ghibli; solo datos de las películas (títulos, directores, años de estreno).",
    verdicts: ["De vuelta al archivo.", "Un comienzo.", "Vas calentando.", "Buena memoria.", "Casi.", "Orden perfecto."],
    held: "En la mano", ok: "lugar correcto", no: "lugar equivocado",
  },
} as const;

const seed = () => Math.floor(Math.random() * 1_000_000);

// @step data: A round is just five film ids in the order you arranged them; titles, directors and years come from a small bundled list of public facts.
// @paso data: Una ronda son solo cinco ids de película en el orden que armaste; títulos, directores y años salen de una lista pequeña de datos públicos incluida en el sitio.
/** Film Order: arrange five films by release year, then reveal the years. Goal: put 5 films in release order. */
export function FilmsDemo({ locale }: { locale: "en" | "es" }) {
  const t = T[locale];
  const step = useStep();
  const how = useHowTo("films");
  const [round, setRound] = useState<Round>(() => newRound(seed()));
  const [sel, setSel] = useState(0);
  const [held, setHeld] = useState(false);
  const [drag, setDrag] = useState<number | null>(null);
  const live = useRef({ round, sel, held });
  live.current = { round, sel, held };

  // @step reorder: Moving a card swaps it with its neighbour (pure move()); drag and drop, the buttons and the d-pad all end up calling it.
  // @paso reorder: Mover una carta la intercambia con su vecina (move() es pura); arrastrar, los botones y la cruceta terminan llamándola.
  const shift = (i: number, dir: -1 | 1) => {
    const c = live.current;
    const next = move(c.round, i, dir);
    if (next === c.round) return;
    step("reorder"); setRound(next); setSel(i + dir); play("blip");
  };
  const dropOn = (from: number, to: number) => {
    let r = live.current.round;
    for (let i = from; i !== to; i += to > from ? 1 : -1) r = move(r, i, to > from ? 1 : -1);
    if (r !== live.current.round) { step("reorder"); setRound(r); play("blip"); }
    setSel(to); setDrag(null);
  };

  // @step reveal: Revealing shows every year and marks each card; the score is how many sit exactly where the release order puts them.
  // @paso reveal: Revelar muestra todos los años y marca cada carta; el puntaje es cuántas están justo donde las pone el orden de estreno.
  const check = () => {
    const c = live.current;
    if (c.round.revealed) return;
    const next = reveal(c.round);
    step("reveal"); setRound(next); setHeld(false);
    play(score(next) === ORDER_GOAL ? "epic" : "confirm");
  };
  const again = () => { setRound(newRound(seed())); setSel(0); setHeld(false); step("replay"); play("back"); };

  useConsoleInput((a: Action) => {
    if (how.openRef.current) { if (a === "a" || a === "b") how.hide(); return; }
    const c = live.current;
    if (c.round.revealed) { if (a === "a") again(); return; }
    if (a === "b") { check(); return; }
    if (a === "a") { if (c.sel === ORDER_GOAL) check(); else { setHeld(!c.held); play("blip"); } return; }
    const dir = a === "left" || a === "up" ? -1 : a === "right" || a === "down" ? 1 : 0;
    if (!dir) return;
    if (c.held && c.sel < ORDER_GOAL) shift(c.sel, dir);
    else setSel(Math.max(0, Math.min(ORDER_GOAL, c.sel + dir)));
  });

  const revealed = round.revealed;
  const right = correctOrder(round);
  const s = score(round);

  // @step replay: After the reveal, Enter deals five new films and the cards start hidden again.
  // @paso replay: Tras revelar, Enter reparte cinco películas nuevas y las cartas vuelven a ocultarse.
  return (
    <div className="dm dm-films" data-revealed={revealed}>
      <header className="fm-head">
        <b>Film Order</b>
        <span>{t.goal}</span>
        <em aria-live="polite">{revealed ? `${s}/${ORDER_GOAL} ${t.inPlace}` : t.arrange}</em>
      </header>

      <div className="fm-axis" aria-hidden="true"><span>{t.oldest}</span><i /><span>{t.newest}</span></div>

      <ol className="fm-row">
        {round.order.map((id, i) => {
          const f = filmById(id);
          const good = revealed && right[i] === id;
          return (
            <li
              key={id}
              className={`fm-card${i === sel ? " sel" : ""}${held && i === sel ? " held" : ""}${revealed ? (good ? " ok" : " no") : ""}${drag === i ? " drag" : ""}`}
              style={{ "--tilt": `${((i * 37) % 5) - 2}deg` } as React.CSSProperties}
              draggable={!revealed}
              onDragStart={(e) => { setDrag(i); setSel(i); e.dataTransfer.effectAllowed = "move"; e.dataTransfer.setData("text/plain", String(i)); }}
              onDragOver={(e) => { if (drag !== null) e.preventDefault(); }}
              onDrop={(e) => { e.preventDefault(); if (drag !== null) dropOn(drag, i); }}
              onDragEnd={() => setDrag(null)}
              onClick={() => setSel(i)}
            >
              <span className="fm-no" aria-hidden="true">{i + 1}</span>
              <div className="fm-text">
                <strong>{f.title}</strong>
                <span>{f.director}</span>
              </div>
              <span className="fm-year" aria-label={revealed ? String(f.year) : t.year}>{revealed ? f.year : "????"}</span>
              {revealed && <span className="fm-mark" role="img" aria-label={good ? t.ok : t.no}>{good ? "✓" : "✗"}</span>}
              {!revealed && (
                <span className="fm-move">
                  <button type="button" aria-label={`${t.earlier}: ${f.title}`} disabled={i === 0} onClick={(e) => { e.stopPropagation(); shift(i, -1); }}>‹</button>
                  <button type="button" aria-label={`${t.later}: ${f.title}`} disabled={i === ORDER_GOAL - 1} onClick={(e) => { e.stopPropagation(); shift(i, 1); }}>›</button>
                </span>
              )}
            </li>
          );
        })}
      </ol>

      <div className="fm-bar">
        {revealed ? (
          <>
            <span className="fm-verdict" role="status">{t.verdicts[s]}</span>
            <button type="button" className="fm-btn go" onClick={again}>{t.again}</button>
          </>
        ) : (
          <button type="button" className={`fm-btn go${sel === ORDER_GOAL ? " sel" : ""}`} onClick={check}>{t.check}</button>
        )}
      </div>
      <p className="fm-credit">{t.credit}</p>
      <p className="dm-hint fm-hint">{revealed ? "" : held ? t.hintHeld : t.hint}</p>
      <HowTo id="films" locale={locale} how={how} />
    </div>
  );
}
