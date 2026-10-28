"use client";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { examples } from "@/data/eventloop";
import type { Locale } from "@/data/projects";

const L = {
  en: { eyebrow: "LAB // FROM THE BOOK", title: "Predict the output, then step through it", lead: "Pick an example from the book. What will it print? Make a guess, then step through what the engine does.", out: "Console", prev: "Previous step", next: "Next step", play: "Play", final: "Final output", pick: "Example" },
  es: { eyebrow: "LABORATORIO // DEL LIBRO", title: "Predice la salida y luego recórrela paso a paso", lead: "Elige un ejemplo del libro. ¿Qué imprimirá? Haz tu apuesta y luego recorre lo que hace el motor.", out: "Consola", prev: "Paso anterior", next: "Paso siguiente", play: "Reproducir", final: "Salida final", pick: "Ejemplo" },
} as const;

/**
 * Steps through the Node-verified traces in src/data/eventloop.ts (scripts/check/eventloop.mjs runs every snippet for real).
 * Before hydration (or without JS) it lists every example with its code and final console, so the page is complete as static HTML.
 */
export function EventLoopLab({ locale }: { locale: Locale }) {
  const l = L[locale];
  const [e, setE] = useState(0);
  const [i, setI] = useState<number | null>(null); // null = static view
  const [playing, setPlaying] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  const iRef = useRef(0);
  const eRef = useRef(0);
  iRef.current = i ?? 0;
  eRef.current = e;
  const reduced = typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ex = examples[e];
  const last = ex.steps.length - 1;

  useEffect(() => { setI(0); }, []);
  const stop = () => { window.clearInterval(timer.current); timer.current = undefined; setPlaying(false); };
  useEffect(() => stop, []);

  const go = (n: number) => setI(Math.max(0, Math.min(examples[eRef.current].steps.length - 1, n)));
  const choose = (n: number) => { stop(); setE(n); setI(0); };
  const toggle = () => {
    if (timer.current) return stop();
    if (iRef.current === last) go(0);
    setPlaying(true);
    timer.current = window.setInterval(() => {
      if (iRef.current >= examples[eRef.current].steps.length - 1) stop(); else go(iRef.current + 1);
    }, reduced ? 2600 : 1600);
  };

  if (i === null) {
    return (
      <section className="el" aria-labelledby="el-title" tabIndex={-1}>
        <p className="eyebrow">{l.eyebrow}</p>
        <h2 id="el-title">{l.title}</h2>
        <p className="lead">{l.lead}</p>
        {examples.map((x) => (
          <div key={x.id} className="el-static">
            <h3>{x.title[locale]} <span className="mono tiny">{x.chapter[locale]}</span></h3>
            <pre className="el-code" aria-label="JavaScript"><code>{x.code.map((c, n) => <span key={n}>{c}</span>)}</code></pre>
            <p className="el-final">{l.final}: {x.steps.at(-1)!.out.join(" ")}</p>
          </div>
        ))}
      </section>
    );
  }

  const s = ex.steps[i];
  const p = ex.steps[i - 1] ?? ex.steps[0];
  const col = (items: string[], prev: string[]) => items.map((t, n) => <li key={`${n}-${t}`} className={prev.includes(t) ? undefined : "el-new"}>{t}</li>);

  return (
    <section
      className="el" aria-labelledby="el-title" tabIndex={-1}
      onKeyDown={(ev) => {
        if (ev.key === "ArrowRight") { stop(); go(i + 1); ev.preventDefault(); }
        if (ev.key === "ArrowLeft") { stop(); go(i - 1); ev.preventDefault(); }
      }}
    >
      <p className="eyebrow">{l.eyebrow}</p>
      <h2 id="el-title">{l.title}</h2>
      <p className="lead">{l.lead}</p>
      <div className="el-tabs" role="group" aria-label={l.pick}>
        {examples.map((x, n) => (
          <button key={x.id} type="button" className="btn" aria-pressed={n === e} onClick={() => choose(n)}>{x.title[locale]}</button>
        ))}
      </div>
      <div className="el-grid">
        <pre className="el-code" aria-label="JavaScript"><code>{ex.code.map((c, n) => <span key={n} className={s.line === n ? "el-active" : undefined}>{c}</span>)}</code></pre>
        <div className="el-board">
          {ex.panels.map((pn, n) => (
            <div key={n} className={`el-col${s.focus === n ? " el-focus" : ""}`}><h3>{pn[locale]}</h3><ul>{col(s.boxes[n], p.boxes[n])}</ul></div>
          ))}
          <div className="el-col el-out"><h3>{l.out}</h3><ul>{col(s.out, i ? p.out : [])}</ul></div>
        </div>
      </div>
      <p className="el-note" aria-live="polite">{s.note[locale]}</p>
      <div className="el-controls">
        <button className="btn" type="button" aria-label={l.prev} disabled={i === 0} onClick={() => { stop(); go(i - 1); }}><ArrowLeft className="ic" size={17} aria-hidden="true" /></button>
        <button className="btn primary" type="button" aria-pressed={playing} onClick={toggle}>{l.play}</button>
        <button className="btn" type="button" aria-label={l.next} disabled={i === last} onClick={() => { stop(); go(i + 1); }}><ArrowRight className="ic" size={17} aria-hidden="true" /></button>
        <span className="mono tiny">{i} / {last}</span>
      </div>
    </section>
  );
}
