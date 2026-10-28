"use client";
import { useEffect, useRef, useState } from "react";
import "@/styles/demos/forecast.css";
import { play } from "@/lib/sound";
import { CITIES, COLD_C, ITEMS, ROUNDS, bestItem, current, isDone, newRun, pack, score, type Condition, type Item, type Run } from "@/lib/games/forecast";
import { useConsoleInput, useStep, type Action } from "../input";
import { HowTo, useHowTo } from "../HowTo";

const T = {
  en: {
    goal: "Pack right for 5 forecasts", packed: "Packed", sample: "Sample data", rule: `Rain first, then cold (${COLD_C}°C or less), then sun, otherwise a coffee.`,
    hint: "Left/right: choose · Enter / click: pack it", right: "Right call.", wrong: "Not quite.",
    items: { umbrella: "Umbrella", sunglasses: "Sunglasses", jacket: "Jacket", coffee: "Coffee" } as Record<Item, string>,
    why: { umbrella: "It rains, so the umbrella.", jacket: "It is cold, so the jacket.", sunglasses: "Clear and warm, so sunglasses.", coffee: "Mild and grey, so a coffee." } as Record<Item, string>,
    cond: { rain: "Rain", sun: "Sunny", cloud: "Cloudy" } as Record<Condition, string>,
    doneTitle: "Bag packed", verdicts: ["Time to look out of the window.", "A few soggy surprises.", "Half a forecaster.", "Almost a local.", "Nearly perfect.", "Perfect packing."],
    doneBody: "Forecast comes from my university weather app, which reads live conditions from OpenWeatherMap. These cities use bundled sample data, not live data.", again: "Enter · Try again", of: "of",
  },
  es: {
    goal: "Empaca bien para 5 pronósticos", packed: "En la maleta", sample: "Datos de ejemplo", rule: `Primero la lluvia, luego el frío (${COLD_C}°C o menos), luego el sol, y si no, un café.`,
    hint: "Izq/der: elegir · Enter / clic: empacar", right: "Buena elección.", wrong: "No del todo.",
    items: { umbrella: "Paraguas", sunglasses: "Gafas de sol", jacket: "Chaqueta", coffee: "Café" } as Record<Item, string>,
    why: { umbrella: "Llueve, así que el paraguas.", jacket: "Hace frío, así que la chaqueta.", sunglasses: "Despejado y cálido, así que gafas de sol.", coffee: "Templado y gris, así que un café." } as Record<Item, string>,
    cond: { rain: "Lluvia", sun: "Soleado", cloud: "Nublado" } as Record<Condition, string>,
    doneTitle: "Maleta lista", verdicts: ["Mejor asómate a la ventana.", "Algunas sorpresas mojadas.", "Medio meteorólogo.", "Casi un local.", "Casi perfecto.", "Equipaje perfecto."],
    doneBody: "Forecast viene de mi app del clima de la universidad, que lee el clima en vivo de OpenWeatherMap. Estas ciudades usan datos de ejemplo incluidos, no datos en vivo.", again: "Enter · Otra vez", of: "de",
  },
} as const;

const reduced = () => typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
const seed = () => Math.floor(Math.random() * 1_000_000);

/** Animated weather art in plain SVG and CSS (no images). */
function Sky({ c }: { c: Condition }) {
  return (
    <svg className={`fc-sky fc-${c}`} viewBox="0 0 120 90" aria-hidden="true">
      {c === "sun" && (
        <g className="fc-sun" transform="translate(60 45)">
          <g className="fc-rays">{Array.from({ length: 12 }, (_, i) => <rect key={i} x="-2" y="-40" width="4" height="12" rx="2" transform={`rotate(${i * 30})`} />)}</g>
          <circle r="22" />
        </g>
      )}
      {c !== "sun" && (
        <g className="fc-cloud">
          <path d="M34 62a15 15 0 0 1 2-29 22 22 0 0 1 42-4 18 18 0 0 1 6 33z" />
          <path className="fc-cloud2" d="M20 66a11 11 0 0 1 1-21 16 16 0 0 1 30-3 13 13 0 0 1 5 24z" />
        </g>
      )}
      {c === "rain" && <g className="fc-drops">{[34, 48, 62, 76].map((x, i) => <line key={x} x1={x} y1="68" x2={x - 4} y2="80" style={{ "--d": `${i * 0.22}s` } as React.CSSProperties} />)}</g>}
    </svg>
  );
}

function ItemIcon({ i }: { i: Item }) {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" className="fc-ico">
      {i === "umbrella" && <><path d="M6 25a18 18 0 0 1 36 0z" /><path d="M24 25v12a4 4 0 0 1-8 0" /><path d="M24 7v3" /></>}
      {i === "sunglasses" && <><rect x="5" y="19" width="16" height="11" rx="5" /><rect x="27" y="19" width="16" height="11" rx="5" /><path d="M21 23h6M5 21 2 17M43 21l3-4" /></>}
      {i === "jacket" && <><path d="M17 8l7 5 7-5 11 6-4 10-5-2v18H15V22l-5 2L6 14z" /><path d="M24 13v26" /></>}
      {i === "coffee" && <><path d="M9 18h26v10a10 10 0 0 1-10 10h-6A10 10 0 0 1 9 28z" /><path d="M35 21h3a5 5 0 0 1 0 10h-3" /><path className="fc-steam" d="M16 7c-2 3 2 4 0 7M23 7c-2 3 2 4 0 7M30 7c-2 3 2 4 0 7" /></>}
    </svg>
  );
}

// @step data: A forecast is plain data (city, condition, temperature). The ten cities are bundled sample data, not live data.
// @paso data: Un pronóstico son datos simples (ciudad, condición, temperatura). Las diez ciudades son datos de ejemplo incluidos, no datos en vivo.
/** Forecast: read a city card, pack the right thing, five times. Goal: pack right for 5 forecasts. */
export function ForecastDemo({ locale }: { locale: "en" | "es" }) {
  const t = T[locale];
  const step = useStep();
  const how = useHowTo("forecast");
  const [run, setRun] = useState<Run>(() => newRun(seed()));
  const [sel, setSel] = useState(0);
  const [fb, setFb] = useState<{ item: Item; ok: boolean; best: Item } | null>(null);
  const timer = useRef<number | undefined>(undefined);
  const live = useRef({ run, sel, fb });
  live.current = { run, sel, fb };
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const f = current(run);
  const done = isDone(run) && !fb;

  // @step rule: One pure function decides the right item: rain first, then cold, then sun, otherwise coffee.
  // @paso rule: Una función pura decide el objeto correcto: primero lluvia, luego frío, luego sol y si no, café.
  const choose = (item: Item) => {
    const c = live.current;
    const cur = current(c.run);
    if (c.fb || !cur) return;
    // @step pack: Packing records the pick and moves to the next city after a short pause so you can read why it was right or wrong.
    // @paso pack: Empacar guarda la elección y pasa a la siguiente ciudad tras una pausa corta para leer por qué estuvo bien o mal.
    const r = pack(c.run, item);
    step("pack");
    setFb({ item, ok: r.correct, best: bestItem(cur) });
    play(r.correct ? "confirm" : "back");
    timer.current = window.setTimeout(() => {
      setRun(r.run); setFb(null); setSel(0);
      if (isDone(r.run)) { step("finish"); play("epic"); }
    }, reduced() ? 700 : 1500);
  };

  const again = () => { window.clearTimeout(timer.current); setRun(newRun(seed())); setFb(null); setSel(0); play("back"); };
  useConsoleInput((a: Action) => {
    if (how.openRef.current) { if (a === "a" || a === "b") how.hide(); return; }
    const c = live.current;
    if (isDone(c.run) && !c.fb) { if (a === "a") again(); return; }
    if (c.fb) return;
    if (a === "left" || a === "up") setSel((i) => (i + ITEMS.length - 1) % ITEMS.length);
    else if (a === "right" || a === "down") setSel((i) => (i + 1) % ITEMS.length);
    else if (a === "a") choose(ITEMS[c.sel]);
  });

  const s = score(run);
  const tone = f?.condition ?? "sun";

  // @step finish: After five cities the score and a one-line verdict replace the card; Enter tries again with new cities.
  // @paso finish: Tras cinco ciudades, el puntaje y un veredicto de una línea reemplazan la tarjeta; Enter lo intenta de nuevo con ciudades nuevas.
  return (
    <div className="dm dm-forecast" data-tone={tone} data-done={done}>
      <header className="fc-head">
        <b>Forecast</b>
        <span>{t.goal}</span>
        <em aria-live="polite">{t.packed} {Math.min(run.index, ROUNDS)}/{ROUNDS}
          <span className="fc-pips" aria-hidden="true">{Array.from({ length: ROUNDS }, (_, i) => <i key={i} className={i < run.answers.length ? (run.answers[i] === bestItem(CITIES[run.order[i]]) ? "ok" : "no") : ""} />)}</span>
        </em>
      </header>

      <div className="fc-stage">
        {f && !done && (
          <section className="fc-card" key={`${run.index}-${f.city}`} aria-label={`${f.city}, ${t.cond[f.condition]}, ${f.tempC}°C`}>
            <Sky c={f.condition} />
            <div className="fc-info">
              <span className="fc-badge">{t.sample}</span>
              <h3>{f.city}<small>{f.country}</small></h3>
              <p className="fc-temp">{f.tempC}<sup>°C</sup></p>
              <p className="fc-cond">{t.cond[f.condition]}</p>
            </div>
          </section>
        )}
        {done && (
          <div className="fc-done" role="status">
            <b>{t.doneTitle}</b>
            <p className="fc-score">{s}<small> {t.of} {ROUNDS}</small></p>
            <p>{t.verdicts[s]}</p>
            <p className="fc-small">{t.doneBody}</p>
            <button type="button" className="fc-btn go" onClick={again}>{t.again}</button>
          </div>
        )}
      </div>

      {!done && (
        <div className="fc-items" role="group" aria-label={t.goal}>
          {ITEMS.map((it, i) => (
            <button
              key={it} type="button" disabled={!!fb} aria-label={t.items[it]}
              className={`fc-item${i === sel && !fb ? " sel" : ""}${fb && it === fb.best ? " best" : ""}${fb && it === fb.item && !fb.ok ? " miss" : ""}`}
              onClick={() => { setSel(i); choose(it); }} onFocus={() => setSel(i)}
            >
              <ItemIcon i={it} /><span>{t.items[it]}</span>
            </button>
          ))}
        </div>
      )}
      <p className="fc-line" role="status">{fb ? `${fb.ok ? t.right : t.wrong} ${t.why[fb.best]}` : done ? "" : t.rule}</p>
      <p className="dm-hint fc-hint">{done ? "" : t.hint}</p>
      <HowTo id="forecast" locale={locale} how={how} />
    </div>
  );
}
