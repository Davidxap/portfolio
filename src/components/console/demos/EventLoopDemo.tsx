"use client";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Pause, Play, RotateCcw, RotateCw, SkipBack, SkipForward } from "lucide-react";
import "@/styles/demos/eventloop.css";
import { scenarios, type LoopArea, type LoopItem } from "@/data/eventloop";
import { useConsoleInput, useStep } from "../input";
import { HowTo, useHowTo } from "../HowTo";

// @step copy: Visible text is one table per language; the scenarios, code and one-sentence narrations come from src/data/eventloop.ts.
// @paso copy: El texto visible es una tabla por idioma; los escenarios, el código y las narraciones de una frase vienen de src/data/eventloop.ts.
const T = {
  en: { stack: "Call Stack", api: "Web APIs", micro: "Microtask Queue", task: "Task Queue", out: "Console", code: "Code", loop: "Event Loop", loopOn: "The stack is empty: take the next job", loopOff: "Waiting until the stack is empty", loopMove: "Moving a job onto the stack", paint: "The browser can render",
    back: "Previous step", next: "Next step", play: "Play", pause: "Pause", restart: "Restart", speed: "Speed", example: "Example", hint: "Left/Right: step · Enter: run or pause · Up/Down: example", step: "Step", empty: "empty", ms: "ms" },
  es: { stack: "Pila de llamadas", api: "Web APIs", micro: "Cola de microtareas", task: "Cola de tareas", out: "Consola", code: "Código", loop: "Event Loop", loopOn: "La pila está vacía: toma el siguiente trabajo", loopOff: "Espera a que la pila quede vacía", loopMove: "Pasa un trabajo a la pila", paint: "El navegador puede renderizar",
    back: "Paso anterior", next: "Paso siguiente", play: "Reproducir", pause: "Pausar", restart: "Reiniciar", speed: "Velocidad", example: "Ejemplo", hint: "Izq/Der: paso · Enter: ejecutar o pausar · Arriba/Abajo: ejemplo", step: "Paso", empty: "vacío", ms: "ms" },
} as const;

const SPEEDS = [0.5, 1, 2] as const;
/** One slide takes this long at 1x (the speed buttons scale it). */
const MOVE_MS = 450;
const EASE = "cubic-bezier(0.22, 0.8, 0.25, 1)";
const reduced = () => typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;

function Box({ area, title, items, focus, label }: { area: LoopArea; title: string; items: LoopItem[]; focus: boolean; label: { empty: string; ms: string } }) {
  // The call stack grows upwards, so its newest frame is drawn first (column-reverse in CSS).
  return (
    <section className={`lp-box lp-${area}`} data-area={area} data-focus={focus} aria-label={title}>
      <h3>{title}</h3>
      <ul>
        {items.length === 0 && <li className="lp-empty" aria-hidden="true">{label.empty}</li>}
        {items.map((it) => (
          <li key={it.id} className={`lp-tok k-${area}`} data-tok={it.id}>
            <span>{it.label}</span>{it.delay !== undefined && <small>{it.delay} {label.ms}</small>}
          </li>
        ))}
      </ul>
    </section>
  );
}

/** An animated explainer: the Node-verified frames of src/data/eventloop.ts, drawn with sliding tokens, playable and steppable. */
export function EventLoopDemo({ locale }: { locale: "en" | "es" }) {
  const t = T[locale];
  const step = useStep();
  const how = useHowTo("eventloop");
  const [sc, setSc] = useState(0);
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState<(typeof SPEEDS)[number]>(1);
  const root = useRef<HTMLDivElement>(null);
  const rects = useRef(new Map<number, { r: DOMRect; area: string; label: string }>());
  const last = useRef({ sc: 0, i: 0 });
  const live = useRef({ sc, i, playing, speed });
  live.current = { sc, i, playing, speed };

  const scenario = scenarios[sc];
  const frame = scenario.frames[i];
  const prev = scenario.frames[i - 1];
  const end = scenario.frames.length - 1;

  const go = useCallback((n: number) => setI(Math.max(0, Math.min(scenarios[live.current.sc].frames.length - 1, n))), []);
  const pick = useCallback((n: number) => { step("data"); setPlaying(false); setSc((n + scenarios.length) % scenarios.length); setI(0); }, [step]);

  // @step play: Playing advances one frame per tick; the speed buttons scale both the tick and the length of the slide.
  // @paso play: Reproducir avanza un cuadro por tic; los botones de velocidad escalan el tic y la duración del deslizamiento.
  useEffect(() => {
    if (!playing) return;
    const tick = window.setTimeout(() => {
      if (live.current.i >= scenarios[live.current.sc].frames.length - 1) setPlaying(false);
      else go(live.current.i + 1);
    }, (reduced() ? 2600 : 2200) / speed);
    return () => window.clearTimeout(tick);
  }, [playing, i, sc, speed, go]);

  useConsoleInput((a) => {
    if (how.openRef.current) { if (a === "a" || a === "b") how.hide(); return; }
    const c = live.current;
    if (a === "right") { setPlaying(false); go(c.i + 1); step("play"); }
    else if (a === "left") { setPlaying(false); go(c.i - 1); }
    else if (a === "up") pick(c.sc - 1);
    else if (a === "down") pick(c.sc + 1);
    else if (a === "a") {
      step("play");
      if (c.playing) setPlaying(false);
      else { if (c.i >= scenarios[c.sc].frames.length - 1) setI(0); setPlaying(true); }
    }
  });

  // @step travel: Before each paint the tokens' old boxes are compared with the new ones (FLIP) and every token that moved slides across the screen; a frame popped off the stack slides up and out; reduced motion skips it all.
  // @paso travel: Antes de cada pintado se comparan las cajas viejas de los tokens con las nuevas (FLIP) y cada token que cambió de lugar se desliza por la pantalla; un frame que sale de la pila sube y se desvanece; con movimiento reducido se omite todo.
  useLayoutEffect(() => {
    const el = root.current;
    if (!el) return;
    const toks = [...el.querySelectorAll<HTMLElement>("[data-tok]")];
    toks.forEach((n) => n.getAnimations().forEach((a) => a.cancel()));
    const next = new Map<number, { r: DOMRect; area: string; label: string }>();
    toks.forEach((n) => next.set(Number(n.dataset.tok), { r: n.getBoundingClientRect(), area: n.closest<HTMLElement>("[data-area]")?.dataset.area ?? "stack", label: n.querySelector("span")?.textContent ?? "" }));
    const forward = last.current.sc === sc && i === last.current.i + 1;
    if (!reduced() && last.current.sc === sc && i !== last.current.i) {
      const dur = MOVE_MS / live.current.speed;
      const origin = (a: LoopArea) => (a === "code" ? el.querySelector<HTMLElement>("[data-on='true']") : el.querySelector<HTMLElement>(`[data-area='${a}']`))?.getBoundingClientRect();
      toks.forEach((n) => {
        const id = Number(n.dataset.tok);
        const to = next.get(id)!.r;
        const was = rects.current.get(id)?.r;
        const src = !was && forward ? scenarios[sc].frames[i].from[id] : undefined;
        const o = src ? origin(src) : undefined;
        const dx = was ? was.left - to.left : o ? o.left + Math.min(o.width, 120) / 2 - (to.left + to.width / 2) : 0;
        const dy = was ? was.top - to.top : o ? o.top + o.height / 2 - (to.top + to.height / 2) : 0;
        if (!was && !o) { n.animate([{ opacity: 0, transform: "translateY(-14px)" }, { opacity: 1, transform: "none" }], { duration: dur, easing: EASE }); return; }
        if (Math.abs(dx) < 1 && Math.abs(dy) < 1) return;
        n.animate(
          [{ transform: `translate(${dx}px, ${dy}px) scale(${was ? 1 : 0.55})`, opacity: was ? 1 : 0.2, zIndex: 5 }, { transform: "none", opacity: 1, zIndex: 5 }],
          { duration: dur, easing: EASE },
        );
      });
      // A function frame that was popped off the stack (it exists nowhere else now) floats up and fades out.
      const box = el.getBoundingClientRect();
      rects.current.forEach((old, id) => {
        if (next.has(id) || old.area === "console") return;
        const ghost = document.createElement("div");
        ghost.className = `lp-tok lp-ghost k-${old.area}`;
        ghost.setAttribute("aria-hidden", "true");
        ghost.textContent = old.label;
        Object.assign(ghost.style, { position: "absolute", left: `${old.r.left - box.left}px`, top: `${old.r.top - box.top}px`, width: `${old.r.width}px`, height: `${old.r.height}px`, margin: "0", zIndex: "6", pointerEvents: "none" });
        el.appendChild(ghost);
        ghost.animate([{ opacity: 1, transform: "none" }, { opacity: 0, transform: "translateY(-26px) scale(0.92)" }], { duration: dur, easing: EASE }).onfinish = () => ghost.remove();
      });
    }
    rects.current = next;
    last.current = { sc, i };
  }, [sc, i]);

  // The loop badge pulses whenever a job just moved from a queue onto the stack.
  const kicked = !!prev && frame.stack.some((s) => prev.micro.some((m) => m.id === s.id) || prev.tasks.some((m) => m.id === s.id));
  const code = scenario.code;
  const lbl = { empty: t.empty, ms: t.ms };

  // @step render: The screen only draws the current frame: code with the running line lit, the five boxes, the narration and the controls.
  // @paso render: La pantalla solo dibuja el cuadro actual: el código con la línea en ejecución resaltada, las cinco cajas, la narración y los controles.
  return (
    <div className="dm dm-loop" ref={root} style={{ "--lp-dur": `${MOVE_MS / speed}ms` } as React.CSSProperties}>
      <div className="lp-tabs" role="group" aria-label={t.example}>
        {scenarios.map((s, n) => <button key={s.id} type="button" aria-pressed={n === sc} onClick={() => pick(n)}>{s.title[locale]}</button>)}
      </div>

      <div className="lp-grid">
        <section className="lp-codebox" data-area="code" aria-label={t.code}>
          <h3>{t.code}</h3>
          <pre><code>{code.map((l, n) => <span key={n} className="lp-line" data-on={frame.line === n}><i aria-hidden="true">{n + 1}</i>{l}</span>)}</code></pre>
        </section>
        <Box area="stack" title={t.stack} items={[...frame.stack].reverse()} focus={frame.focus === "stack"} label={lbl} />
        <Box area="api" title={t.api} items={frame.api} focus={frame.focus === "api"} label={lbl} />
        <section className="lp-loop" data-area="loop" data-active={frame.stack.length === 0} data-kick={kicked} aria-label={t.loop}>
          <span key={kicked ? `k${i}` : "idle"} className={`lp-spin${kicked ? " kick" : ""}`} aria-hidden="true"><RotateCw size={34} strokeWidth={2.4} /></span>
          <div><h3>{t.loop}</h3><em>{kicked ? t.loopMove : frame.stack.length === 0 ? t.loopOn : t.loopOff}</em></div>
          <span className="lp-paint" data-on={!!frame.paint}>{t.paint}</span>
        </section>
        <Box area="micro" title={t.micro} items={frame.micro} focus={frame.focus === "micro"} label={lbl} />
        <Box area="task" title={t.task} items={frame.tasks} focus={frame.focus === "task"} label={lbl} />
        <Box area="console" title={t.out} items={frame.out} focus={frame.focus === "console"} label={lbl} />
      </div>

      <p className="lp-note" aria-live="polite"><b>{t.step} {i}/{end}</b><span>{frame.note[locale]}</span></p>

      <div className="lp-controls">
        <button type="button" onClick={() => { setPlaying(false); go(i - 1); }} disabled={i === 0} aria-label={t.back}><SkipBack size={16} aria-hidden="true" /></button>
        <button type="button" className="main" onClick={() => { step("play"); if (playing) setPlaying(false); else { if (i >= end) setI(0); setPlaying(true); } }} aria-label={playing ? t.pause : t.play} aria-pressed={playing}>
          {playing ? <Pause size={18} aria-hidden="true" /> : <Play size={18} aria-hidden="true" />}
        </button>
        <button type="button" onClick={() => { setPlaying(false); go(i + 1); step("play"); }} disabled={i === end} aria-label={t.next}><SkipForward size={16} aria-hidden="true" /></button>
        <button type="button" onClick={() => { setPlaying(false); setI(0); }} disabled={i === 0} aria-label={t.restart}><RotateCcw size={15} aria-hidden="true" /></button>
        <div className="lp-bar" role="progressbar" aria-valuemin={0} aria-valuemax={end} aria-valuenow={i}><i style={{ width: `${(i / end) * 100}%` }} /></div>
        <div className="lp-speed" role="group" aria-label={t.speed}>
          {SPEEDS.map((s) => <button key={s} type="button" aria-pressed={s === speed} onClick={() => setSpeed(s)}>{s}x</button>)}
        </div>
      </div>
      <p className="dm-hint lp-hint">{t.hint}</p>
      <HowTo id="eventloop" locale={locale} how={how} />
    </div>
  );
}
