"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import "@/styles/demos/ikai.css";
import { play } from "@/lib/sound";
import { projectPath } from "@/i18n/ui";
import { startStatic, type Static } from "@/lib/games/ikai-audio";
import {
  CASE_NO, CLUES, CODE, HOTSPOTS, RADIO, ROOMS, SEAL_TURNS, addClue, canLeave, caseClosed, dread, eyeLook, isEnding, leave, newGame, pressSeal, proximity, radioStatic, roomNumber, submitCode, tuneRadio,
  type Game, type Hotspot, type Pos, type RoomId, type SealId,
} from "@/lib/games/ikai";
import { useConsoleInput, useStep, type Action } from "../input";
import { HowTo, useHowTo } from "../HowTo";
import { withBase } from "@/lib/base";

const T = {
  en: {
    goal: "Escape the three rooms", caseTitle: `Case ${CASE_NO}`, room: "Room", of: "of", escaped: "Escaped",
    hint: "Arrows: next clue, the notebook comes last · Enter / click: inspect · mouse or touch moves the light",
    notebook: "Notebook", clues: "clues", nbEmpty: "Empty. Inspect things with Enter or a click and the clues are written here.", nbClose: "Close", nbTitle: "Notebook",
    introTitle: `CASE ${CASE_NO}`, introSub: "Three rooms, one door", start: "Enter · start", skip: "Enter · skip",
    introBody: "A short escape game in three rooms.\nInspect objects, solve one puzzle in each room and read the clues in your notebook.\nGoal: open the last door.",
    stamp: "Closed", epilogue: "Case closed. You escaped the three rooms.",
    notes: {
      poster: "The poster says to follow the spirals from the fewest turns to the most.",
      bed: "The bed is unmade. Someone left in a hurry.",
      radio: "The radio gave a code: 4 1 7.",
      grate: "Static comes through the grate. Nothing else here.",
      seal: "The seals go in order: fewest spiral turns first.",
      target: "Rings are painted on the wall. The only way out is the door.",
      rail: "An iron rail over a dark drop. Nothing to find here.",
      stairs: "The stairs go up into the fog. They lead nowhere.",
      door: "The door has a three-digit lock. Use the code from the radio.",
    } as Record<string, string>,
    intro: { 1: "Find the radio and tune it to get the code.", 2: "Press the three seals in the right order.", 3: "Enter the radio code on the door." } as Record<RoomId, string>,
    spots: {
      poster: ["Spiral poster", "A spiral on the wall. Follow it from the fewest turns to the most."],
      radio: ["Old radio", "Static and a faint voice. Turn the dial until it clears."],
      bed: ["Bed", "An unmade bed. Someone left in a hurry."],
      exit: ["Door", ""],
      "seal-a": ["Seal", ""], "seal-b": ["Seal", ""], "seal-c": ["Seal", ""],
      grate: ["Grate", "Static comes through the grate."],
      target: ["Painted rings", "Rings on the wall. The only way out is the door."],
      door: ["Locked door", "A lock with three digits."],
      stairs: ["Stairs", "They go up into the fog."],
      rail: ["Iron rail", "A rail over a dark drop."],
    } as Record<string, [string, string]>,
    exitLocked: { 1: "The door is locked. Find the radio and get the code first.", 2: "The door is locked. Press the three seals in order." } as Record<number, string>,
    exitOpen: "The door opens.",
    seal: (n: number) => `Seal with ${n} spiral turn${n === 1 ? "" : "s"}`,
    sealPlaced: "Seal set.", sealWrong: "Wrong order. The seals reset.", sealSolved: "All three seals are set. The door unlocks.",
    dial: "Radio dial", tune: "Turn the dial until the static clears", clear: "The voice says: four, one, seven.", signal: "Signal", leave: "Esc · step back",
    code: "Door code", codeHint: "Up/down: digit · left/right: move · Enter: try", try: "Try the code", wrong: "Wrong code.", close: "Close",
    endTitle: "You escaped",
    endBody: "IKAI Shell is a real project: a bar and Control Center for the Omarchy desktop, written in QML on Quickshell. Its bar engine is a fork of Shibumi-Shell and mostly their code; the Control Center, widgets and icon scripts are mine.",
    caption: "Real IKAI Shell captures", project: "Read about IKAI Shell", again: "Enter · Try again",
  },
  es: {
    goal: "Escapa de los tres cuartos", caseTitle: `Caso ${CASE_NO}`, room: "Cuarto", of: "de", escaped: "Escapaste",
    hint: "Flechas: siguiente pista, la libreta va al final · Enter / clic: inspeccionar · el mouse o el dedo mueven la luz",
    notebook: "Libreta", clues: "pistas", nbEmpty: "Vacía. Inspecciona objetos con Enter o un clic y las pistas se anotan aquí.", nbClose: "Cerrar", nbTitle: "Libreta",
    introTitle: `CASO ${CASE_NO}`, introSub: "Tres cuartos, una puerta", start: "Enter · empezar", skip: "Enter · saltar",
    introBody: "Un juego corto de escape en tres cuartos.\nInspecciona objetos, resuelve un acertijo en cada cuarto y lee las pistas en tu libreta.\nObjetivo: abrir la última puerta.",
    stamp: "Cerrado", epilogue: "Caso cerrado. Escapaste de los tres cuartos.",
    notes: {
      poster: "El cartel dice que sigas las espirales de menos a más vueltas.",
      bed: "La cama está deshecha. Alguien se fue con prisa.",
      radio: "La radio dio un código: 4 1 7.",
      grate: "La estática sale por la rejilla. No hay nada más aquí.",
      seal: "Los sellos van en orden: primero el de menos vueltas de espiral.",
      target: "Hay anillos pintados en la pared. La única salida es la puerta.",
      rail: "Una baranda de hierro sobre un vacío oscuro. No hay nada que encontrar.",
      stairs: "Las escaleras suben hacia la niebla. No llevan a ningún lado.",
      door: "La puerta tiene una cerradura de tres dígitos. Usa el código de la radio.",
    } as Record<string, string>,
    intro: { 1: "Encuentra la radio y sintonízala para obtener el código.", 2: "Pulsa los tres sellos en el orden correcto.", 3: "Escribe en la puerta el código de la radio." } as Record<RoomId, string>,
    spots: {
      poster: ["Cartel en espiral", "Una espiral en la pared. Síguela de menos a más vueltas."],
      radio: ["Radio vieja", "Estática y una voz lejana. Gira el dial hasta que se aclare."],
      bed: ["Cama", "Una cama deshecha. Alguien se fue con prisa."],
      exit: ["Puerta", ""],
      "seal-a": ["Sello", ""], "seal-b": ["Sello", ""], "seal-c": ["Sello", ""],
      grate: ["Rejilla", "La estática sale por la rejilla."],
      target: ["Anillos pintados", "Anillos en la pared. La única salida es la puerta."],
      door: ["Puerta cerrada", "Una cerradura de tres dígitos."],
      stairs: ["Escaleras", "Suben hacia la niebla."],
      rail: ["Baranda de hierro", "Una baranda sobre un vacío oscuro."],
    } as Record<string, [string, string]>,
    exitLocked: { 1: "La puerta está cerrada. Primero encuentra la radio y consigue el código.", 2: "La puerta está cerrada. Pulsa los tres sellos en orden." } as Record<number, string>,
    exitOpen: "La puerta se abre.",
    seal: (n: number) => `Sello de ${n} ${n === 1 ? "vuelta" : "vueltas"} de espiral`,
    sealPlaced: "Sello colocado.", sealWrong: "Orden equivocado. Los sellos se reinician.", sealSolved: "Los tres sellos están colocados. La puerta se desbloquea.",
    dial: "Dial de la radio", tune: "Gira el dial hasta que la estática se aclare", clear: "La voz dice: cuatro, uno, siete.", signal: "Señal", leave: "Esc · volver",
    code: "Código de la puerta", codeHint: "Arriba/abajo: dígito · izq/der: mover · Enter: probar", try: "Probar el código", wrong: "Código incorrecto.", close: "Cerrar",
    endTitle: "Escapaste",
    endBody: "IKAI Shell es un proyecto real: una barra y un Centro de control para el escritorio Omarchy, escrito en QML sobre Quickshell. El motor de la barra es un fork de Shibumi-Shell y en su mayoría es código de ellos; el Centro de control, los widgets y los scripts de iconos son míos.",
    caption: "Capturas reales de IKAI Shell", project: "Leer sobre IKAI Shell", again: "Enter · Otra vez",
  },
} as const;

/** Where the eye hangs in the dark above room 3 (percent of the picture). */
const EYE = { x: 24, y: 9 };
/** Ink tendrils creeping in from the corners of the screen as dread rises (hand-drawn paths in a 0..100 box). */
const INK = [
  "M0 0C14 4 22 10 24 22C26 32 20 40 26 52", "M0 6C8 12 10 20 6 30C3 38 9 44 8 56", "M0 0C20 2 34 6 44 4", "M12 0C14 8 22 12 30 10",
  "M100 0C86 5 78 11 76 23C74 34 80 41 74 55", "M100 7C92 12 91 20 94 30C97 38 92 44 93 55", "M100 0C80 2 66 6 56 3", "M88 0C86 8 78 12 70 9",
  "M0 100C13 95 20 88 22 77C24 67 19 61 24 49", "M0 94C8 88 9 80 5 70C2 62 8 57 7 46", "M0 100C20 98 33 94 44 97", "M12 100C14 93 22 89 30 91",
  "M100 100C87 94 80 88 78 77C76 67 81 60 76 48", "M100 93C93 88 92 80 95 70C98 62 93 57 94 46", "M100 100C80 98 67 94 56 97", "M88 100C86 92 78 88 70 91",
];
const ASPECT: Record<RoomId, number> = { 1: 1100 / 675, 2: 940 / 900, 3: 878 / 987 };
const reduced = () => typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
const dist = (a: Pos, b: Pos) => Math.hypot(a.x - b.x, a.y - b.y);

/** A spiral with `turns` turns, drawn as an SVG path in a -12..12 box. */
function spiral(turns: number) {
  const pts: string[] = [];
  const n = turns * 28;
  for (let i = 0; i <= n; i++) {
    const a = (i / 28) * Math.PI * 2, r = 1.2 + (i / n) * 9.4;
    pts.push(`${(Math.cos(a) * r).toFixed(2)} ${(Math.sin(a) * r).toFixed(2)}`);
  }
  return `M${pts.join("L")}`;
}

// @step rooms: The whole game is one small state object (room, radio solved, seals solved); every rule is a pure function in lib/games/ikai.
// @paso rooms: Todo el juego es un objeto de estado pequeño (cuarto, radio resuelta, sellos resueltos); cada regla es una función pura en lib/games/ikai.
/** IKAI: three pixel-art rooms, a radio, three spiral seals and a coded door. Goal: escape the three rooms. */
export function IkaiDemo({ locale }: { locale: "en" | "es" }) {
  const t = T[locale];
  const step = useStep();
  const how = useHowTo("ikai");
  const [g, setG] = useState<Game>(newGame);
  const [pos, setPos] = useState<Pos>({ x: 50, y: 60 });
  const [sel, setSel] = useState(0);
  const [mode, setMode] = useState<"explore" | "radio" | "keypad">("explore");
  const [freq, setFreq] = useState(18);
  const [digits, setDigits] = useState([0, 0, 0]);
  const [cur, setCur] = useState(0);
  const [msg, setMsg] = useState("");
  const [shake, setShake] = useState(0);
  const [eased, setEased] = useState(false);
  const [phase, setPhase] = useState<"intro" | "play">("intro");
  const [nb, setNb] = useState(false);
  const [unread, setUnread] = useState(0);
  const [typed, setTyped] = useState(0);
  const live = useRef({ g, pos, sel, mode, freq, digits, cur, phase, nb, typed });
  live.current = { g, pos, sel, mode, freq, digits, cur, phase, nb, typed };
  const audio = useRef<Static | null>(null);
  const stage = useRef<HTMLDivElement>(null);
  const roomEl = useRef<HTMLDivElement>(null);

  const ending = isEnding(g);
  const room: RoomId = roomNumber(g);
  const spots = HOTSPOTS[room];

  useEffect(() => () => { audio.current?.stop(); audio.current = null; }, []);

  // The intro and the outro type themselves out, one letter at a time (all at once with reduced motion).
  const script = ending ? t.epilogue : phase === "intro" ? t.introBody : "";
  useEffect(() => {
    if (!script) return;
    if (reduced()) { setTyped(script.length); return; }
    setTyped(0);
    const id = window.setInterval(() => setTyped((n) => (n >= script.length ? n : n + 1)), 34);
    return () => window.clearInterval(id);
  }, [script]);
  const typing = !!script && typed < script.length;
  const mood = dread(g);
  useEffect(() => { audio.current?.setDread(mood); }, [mood]);
  const wake = () => { if (!audio.current) audio.current = startStatic(); };

  // @step light: The light is a CSS mask centred on the cursor, or on the focused clue when you use the keys; static grows as you near a clue.
  // @paso light: La luz es una máscara CSS centrada en el cursor, o en la pista enfocada si usas el teclado; la estática crece al acercarte a una pista.
  const level = ending ? 0 : mode === "radio" ? (g.radio ? 0 : 0.25 + 0.75 * radioStatic(freq)) : proximity(pos, g);
  useEffect(() => { audio.current?.setLevel(level * 0.8); }, [level]);

  const focusSpot = (i: number, ease = true) => {
    const h = HOTSPOTS[roomNumber(live.current.g)][i];
    setSel(i); setEased(ease); setPos({ x: h.x, y: h.y }); setMsg("");
    stage.current?.querySelector<HTMLElement>(`[data-spot="${h.id}"]`)?.focus({ preventScroll: true });
  };

  const enterRoom = (next: Game) => {
    setG(next); setMode("explore"); setSel(0); setPos({ x: 50, y: 62 }); setEased(true); setMsg(""); play("confirm");
  };

  // @step notebook: Every inspect writes one terse clue into the notebook, once; the lib refuses repeats and clues from other rooms. Dread grows with rooms and clues.
  // @paso notebook: Cada inspección escribe una pista breve en la libreta, una sola vez; la lib rechaza repeticiones y pistas de otros cuartos. La oscuridad crece con los cuartos y las pistas.
  const commit = (next: Game) => {
    const added = next.notes.length - live.current.g.notes.length;
    setG(next);
    if (added > 0) { step("notebook"); setUnread((n) => n + added); }
    return added > 0;
  };

  // @step puzzles: Radio and seals are pure checks: tuneRadio clears near the station, pressSeal only accepts the right order and resets on a mistake.
  // @paso puzzles: La radio y los sellos son comprobaciones puras: tuneRadio se aclara cerca de la emisora y pressSeal solo acepta el orden correcto y se reinicia si fallas.
  const setDial = (f: number) => {
    const c = live.current;
    const v = Math.max(RADIO.min, Math.min(RADIO.max, f));
    setFreq(v);
    const next = tuneRadio(c.g, v);
    if (next !== c.g) { step("puzzles"); commit(next); setMsg(t.clear); play("epic"); }
  };

  const inspect = (h: Hotspot) => {
    const c = live.current;
    wake();
    setMsg("");
    if (h.kind === "radio") { setMode("radio"); play("blip"); return; }
    if (h.kind === "door") { const fresh = commit(addClue(c.g, h.id)); if (fresh) setMsg(t.notes.door); setMode("keypad"); play("blip"); return; }
    if (h.kind === "seal") {
      const r = pressSeal(c.g, h.id as SealId);
      if (r.result === "ignored") { setMsg(t.seal(SEAL_TURNS[h.id as SealId])); return; }
      step("puzzles"); commit(r.game);
      setMsg(r.result === "wrong" ? t.sealWrong : r.result === "solved" ? t.sealSolved : t.sealPlaced);
      play(r.result === "wrong" ? "back" : r.result === "solved" ? "epic" : "confirm");
      if (r.result === "wrong") setShake((n) => n + 1);
      return;
    }
    if (h.kind === "exit") {
      if (canLeave(c.g)) { enterRoom(leave(c.g)); setMsg(t.exitOpen); } else { setMsg(t.exitLocked[roomNumber(c.g)]); play("back"); }
      return;
    }
    const fresh = commit(addClue(c.g, h.id));
    setMsg(fresh ? t.notes[h.id] : t.spots[h.id]?.[1] ?? ""); play("blip");
  };

  // @step door: The last door takes a three-digit code; submitCode only ends the game with the exact code, and only from room 3.
  // @paso door: La última puerta pide un código de tres dígitos; submitCode solo termina el juego con el código exacto y solo desde el cuarto 3.
  const tryCode = () => {
    const c = live.current;
    const r = submitCode(c.g, c.digits.join(""));
    step("door");
    if (r.ok) { setG(r.game); setNb(false); setMode("explore"); setMsg(""); play("epic"); step("end"); }
    else { setMsg(t.wrong); setShake((n) => n + 1); play("back"); }
  };

  const restart = () => { setPhase("intro"); setNb(false); setUnread(0); setG(newGame()); setMode("explore"); setSel(0); setPos({ x: 50, y: 60 }); setFreq(18); setDigits([0, 0, 0]); setCur(0); setMsg(""); setEased(true); play("back"); };

  const openBook = () => { setNb((v) => !v); setUnread(0); play("flip"); };

  const handle = (a: Action) => {
    const c = live.current;
    if (how.openRef.current) { if (a === "a" || a === "b") how.hide(); return; }
    wake();
    if (c.phase === "intro") { if (a === "a") { if (typing) setTyped(t.introBody.length); else { setPhase("play"); play("confirm"); } } return; }
    if (isEnding(c.g)) { if (a === "a") { if (typing) setTyped(t.epilogue.length); else restart(); } return; }
    if (c.nb) { if (a === "a" || a === "b") { setNb(false); play("back"); } return; }
    if (c.mode === "radio") {
      if (a === "left" || a === "right") setDial(c.freq + (a === "right" ? 2 : -2));
      else if (a === "up" || a === "down") setDial(c.freq + (a === "up" ? 8 : -8));
      else { setMode("explore"); play("back"); }
      return;
    }
    if (c.mode === "keypad") {
      if (a === "left" || a === "right") setCur((i) => (i + (a === "right" ? 1 : 2)) % 3);
      else if (a === "up" || a === "down") { const d = [...c.digits]; d[c.cur] = (d[c.cur] + (a === "up" ? 1 : 9)) % 10; setDigits(d); setMsg(""); play("blip"); }
      else if (a === "a") tryCode();
      else { setMode("explore"); play("back"); }
      return;
    }
    const r = roomNumber(c.g);
    // The notebook is one stop after the last clue, so the arrow keys alone can open it.
    const n = HOTSPOTS[r].length + 1, last = n - 1;
    const go = (dir: 1 | -1) => {
      const i = (c.sel + dir + n) % n;
      if (i === last) { setSel(i); stage.current?.querySelector<HTMLElement>(".ikai-nbbtn")?.focus({ preventScroll: true }); } else focusSpot(i);
      play("blip");
    };
    if (a === "left" || a === "up") go(-1);
    else if (a === "right" || a === "down") go(1);
    else if (a === "a") { if (c.sel === last) openBook(); else inspect(HOTSPOTS[r][c.sel]); }
    else if (a === "b") openBook();
  };
  useConsoleInput(handle);

  // Arrow keys on a focused button never reach the console bus, so the stage maps them itself (and stops the console from also acting).
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const map: Record<string, Action> = { ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right", z: "a", Z: "a", x: "b", X: "b" };
    // Enter on a focused clue acts like A (so it also leaves the radio), instead of clicking the clue again.
    const a = map[e.key] ?? (e.key === "Enter" && (e.target as HTMLElement).closest(".ikai-spot") ? "a" : undefined);
    if (!a) return;
    e.preventDefault();
    handle(a);
  };

  const onMove = (e: React.PointerEvent) => {
    const r = roomEl.current?.getBoundingClientRect();
    if (!r || mode !== "explore" || ending || phase !== "play") return;
    setEased(false);
    setPos({ x: Math.max(0, Math.min(100, ((e.clientX - r.left) / r.width) * 100)), y: Math.max(0, Math.min(100, ((e.clientY - r.top) / r.height) * 100)) });
  };

  const rx = 38, ry = rx * ASPECT[room];
  const seals = useMemo(() => (Object.keys(SEAL_TURNS) as SealId[]).map((id) => ({ id, d: spiral(SEAL_TURNS[id]) })), []);
  const label = (h: Hotspot) => (h.kind === "seal" ? t.seal(SEAL_TURNS[h.id as SealId]) : h.kind === "exit" ? (locale === "en" ? "Door" : "Puerta") : t.spots[h.id][0]);
  const look = eyeLook(EYE, pos);
  const posterSpiral = useMemo(() => spiral(3), []);
  const status = msg || (mode === "radio" ? t.tune : t.intro[room]);

  // @step end: Opening the door reveals the real IKAI Shell (two real captures, a plain description and a link to the project page).
  // @paso end: Abrir la puerta revela el shell real, IKAI Shell (dos capturas reales, una descripción sincera y un enlace a la página del proyecto).
  return (
    <div className="dm dm-ikai" data-room={room} data-phase={phase} onKeyDown={onKeyDown} ref={stage} style={{ "--st": level.toFixed(2), "--dread": mood.toFixed(2) } as React.CSSProperties}>
      <header className="ikai-head">
        <b className="ikai-title">IKAI Shell</b>
        <span className="ikai-case">{t.caseTitle}</span>
        <span className="ikai-prog" aria-live="polite">
          {ending ? t.escaped : `${t.room} ${room}/${ROOMS.length}`}
          <span className="ikai-pips" aria-hidden="true">{ROOMS.map((r) => <i key={r} className={ending || r < room ? "done" : r === room ? "now" : ""} />)}</span>
        </span>
      </header>
      <div className="ikai-sub">
        <span className="ikai-goal">{t.goal}</span>
        <button type="button" className={`ikai-btn ikai-nbbtn${unread ? " fresh" : ""}${sel === spots.length && !nb ? " sel" : ""}`} onClick={openBook} aria-expanded={nb} disabled={phase !== "play" || ending}>
          {t.notebook} {g.notes.length}/{CLUES.length}{unread ? <i aria-hidden="true" /> : null}
        </button>
      </div>

      <div className="ikai-field" onPointerMove={onMove} onPointerDown={wake}>
        <div ref={roomEl} className={`ikai-room${eased ? " eased" : ""}${shake ? ` shake-${shake % 2}` : ""}`} style={{ aspectRatio: ASPECT[room], "--lx": `${pos.x}%`, "--ly": `${pos.y}%`, "--rx": `${rx}%`, "--ry": `${ry}%` } as React.CSSProperties}>
          <picture key={room}>
            <source srcSet={`/art/v3/games/ikai-room-${room}.avif`} type="image/avif" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="ikai-img" src={`/art/v3/games/ikai-room-${room}.webp`} alt="" decoding="async" draggable={false} />
          </picture>
          <div className="ikai-dark" />
          <div className="ikai-glow" />
          {room === 3 && !ending && (
            <svg className="ikai-eye" viewBox="-22 -13 44 26" aria-hidden="true" style={{ left: `${EYE.x}%`, top: `${EYE.y}%`, "--ex": look.x.toFixed(2), "--ey": look.y.toFixed(2) } as React.CSSProperties}>
              <path className="lid" d="M-20 0Q0 -17 20 0Q0 17 -20 0Z" />
              <g className="iris"><circle r="8" /><circle className="pupil" r="3.6" /><circle className="glint" cx="-2.4" cy="-2.6" r="1.1" /></g>
            </svg>
          )}
          <div className="ikai-noise" aria-hidden="true" />
          {!ending && phase === "play" && spots.map((h, i) => {
            const lit = dist(pos, h) < 24 || i === sel;
            const sealOn = h.kind === "seal" && (g.pressed.includes(h.id as SealId) || g.seals);
            const done = (h.kind === "radio" && g.radio) || (h.kind === "exit" && canLeave(g));
            return (
              <button
                key={`${room}-${h.id}`} type="button" data-spot={h.id} data-kind={h.kind}
                className={`ikai-spot${lit ? " lit" : ""}${i === sel ? " sel" : ""}${sealOn ? " on" : ""}${done ? " done" : ""}`}
                style={{ left: `${h.x}%`, top: `${h.y}%` }} aria-label={label(h)}
                onFocus={() => { if (i !== live.current.sel) { setSel(i); setEased(true); setPos({ x: h.x, y: h.y }); } }}
                onClick={() => { setSel(i); inspect(h); }}
              >
                {h.kind === "seal" || h.id === "poster"
                  ? <svg viewBox="-12 -12 24 24" aria-hidden="true"><path d={h.id === "poster" ? posterSpiral : seals.find((s) => s.id === h.id)!.d} /></svg>
                  : <i aria-hidden="true" />}
              </button>
            );
          })}
        </div>

        <svg className="ikai-ink" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          {INK.map((d, i) => <path key={i} d={d} className={`ink-${i % 4}`} />)}
        </svg>

        {phase === "intro" && (
          <div className="ikai-card ikai-intro" role="dialog" aria-label={t.caseTitle} onClick={() => handle("a")}>
            <small>{t.introTitle}</small>
            <b>{t.introSub}</b>
            <p className="ikai-type">{t.introBody.slice(0, typed)}{typing ? <i aria-hidden="true" /> : null}</p>
            <span className="ikai-btn go">{typing ? t.skip : t.start}</span>
          </div>
        )}

        {nb && phase === "play" && !ending && (
          <aside className="ikai-book" aria-label={t.nbTitle}>
            <h4>{t.nbTitle} <span>{g.notes.length}/{CLUES.length} {t.clues}</span></h4>
            {g.notes.length === 0 ? <p className="ikai-empty">{t.nbEmpty}</p> : (
              <ol>{g.notes.map((id) => <li key={id}><em>{t.room} {CLUES.find((c) => c.id === id)!.room}</em> {t.notes[id]}</li>)}</ol>
            )}
            <button type="button" className="ikai-btn" onClick={() => { setNb(false); play("back"); }}>{t.nbClose}</button>
          </aside>
        )}

        {mode === "radio" && !ending && (
          <div className="ikai-panel ikai-radio" role="group" aria-label={t.dial}>
            <div className="ikai-meter" aria-hidden="true"><i style={{ width: `${(1 - radioStatic(freq)) * 100}%` }} /></div>
            <div
              className="ikai-dial" role="slider" tabIndex={0} aria-label={t.dial} aria-valuemin={RADIO.min} aria-valuemax={RADIO.max} aria-valuenow={freq}
              onPointerDown={(e) => { const r = e.currentTarget.getBoundingClientRect(); e.currentTarget.setPointerCapture(e.pointerId); setDial(RADIO.min + ((e.clientX - r.left) / r.width) * (RADIO.max - RADIO.min)); }}
              onPointerMove={(e) => { if (e.buttons) { const r = e.currentTarget.getBoundingClientRect(); setDial(RADIO.min + ((e.clientX - r.left) / r.width) * (RADIO.max - RADIO.min)); } }}
            >
              <span className="ikai-needle" style={{ left: `${freq}%` }} />
            </div>
            <p className="ikai-code" aria-live="polite">{g.radio ? CODE.split("").join(" · ") : "· · ·"}</p>
            <button type="button" className="ikai-btn" onClick={() => { setMode("explore"); play("back"); }}>{t.leave}</button>
          </div>
        )}

        {mode === "keypad" && !ending && (
          <div className="ikai-panel ikai-keypad" role="group" aria-label={t.code}>
            <div className="ikai-digits">
              {digits.map((d, i) => (
                <div key={i} className={i === cur ? "cur" : ""}>
                  <button type="button" aria-label={`${t.code} ${i + 1} +`} onClick={() => { const n = [...digits]; n[i] = (n[i] + 1) % 10; setDigits(n); setCur(i); setMsg(""); play("blip"); }}>▲</button>
                  <output>{d}</output>
                  <button type="button" aria-label={`${t.code} ${i + 1} -`} onClick={() => { const n = [...digits]; n[i] = (n[i] + 9) % 10; setDigits(n); setCur(i); setMsg(""); play("blip"); }}>▼</button>
                </div>
              ))}
            </div>
            <button type="button" className="ikai-btn go" onClick={tryCode}>{t.try}</button>
            <button type="button" className="ikai-btn" onClick={() => { setMode("explore"); play("back"); }}>{t.close}</button>
          </div>
        )}

        {ending && (
          <div className="ikai-end">
            <span className="ikai-stamp" aria-hidden={!caseClosed(g)}>{t.stamp}</span>
            <b>{t.endTitle}</b>
            <p className="ikai-type ikai-epi">{t.epilogue.slice(0, typed)}{typing ? <i aria-hidden="true" /> : null}</p>
            <p className="ikai-small">{g.notes.length}/{CLUES.length} {t.clues} · {t.caseTitle}</p>
            <div className="ikai-shots" aria-label={t.caption}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/media/projects/ikai/icons-dark.avif" alt={t.caption} width={1178} height={780} />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/media/projects/ikai/bar-dark.avif" alt="" width={1600} height={26} />
            </div>
            <p className="ikai-small">{t.endBody}</p>
            <div className="ikai-actions">
              <a className="ikai-btn go" href={withBase(projectPath(locale, "ikai"))}>{t.project}</a>
              <button type="button" className="ikai-btn" onClick={() => (typing ? setTyped(t.epilogue.length) : restart())}>{typing ? t.skip : t.again}</button>
            </div>
          </div>
        )}
      </div>

      <p className="ikai-line" role="status">{ending ? "" : status}{g.radio && !ending && mode !== "radio" ? <span className="ikai-note"> {t.code}: {CODE}</span> : null}</p>
      <p className="dm-hint ikai-hint">{ending ? "" : t.hint}</p>
      <HowTo id="ikai" locale={locale} how={how} />
    </div>
  );
}
