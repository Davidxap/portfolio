// Synthesized sounds (Web Audio, no files, so zero bytes shipped). The context is created lazily on the first user gesture, so nothing plays
// before one. Sound is OFF until the user opts in with the toggle; the choice is remembered in localStorage. Every sound has a visual twin in the UI.
// Everything goes through a gentle low-pass (no harsh highs) and a soft limiter, and the loudest sounds peak around -14 dB.
export type SoundName =
  | "blip" | "confirm" | "back" | "flip" | "epic" | "boot"
  | "clack" | "pad" | "power" | "whoosh" | "open" | "close" | "success";

const KEY = "sound-muted";
const LEVEL = 0.55;
const listeners = new Set<(m: boolean) => void>();
let muted: boolean | null = null;
let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let noise: AudioBuffer | null = null;

/** Muted unless the user switched sound on before (stored "0"). */
export function isMuted(): boolean {
  if (muted === null) {
    try { muted = localStorage.getItem(KEY) !== "0"; } catch { muted = true; }
  }
  return muted;
}

export function setMuted(m: boolean): void {
  muted = m;
  try { localStorage.setItem(KEY, m ? "1" : "0"); } catch { /* storage unavailable: keep in memory */ }
  if (master && ctx) master.gain.setTargetAtTime(m ? 0 : LEVEL, ctx.currentTime, 0.01);
  listeners.forEach((fn) => fn(m));
}

export function onMuteChange(fn: (m: boolean) => void): () => void {
  listeners.add(fn);
  return () => { listeners.delete(fn); };
}

function arm() {
  if (ctx) { void ctx.resume?.(); return; }
  const Ctor = (globalThis as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext }).AudioContext
    ?? (globalThis as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return;
  try {
    ctx = new Ctor();
    master = ctx.createGain();
    master.gain.value = isMuted() ? 0 : LEVEL;
    const soft = ctx.createBiquadFilter();
    soft.type = "lowpass"; soft.frequency.value = 7200; soft.Q.value = 0.5;
    const limit = ctx.createDynamicsCompressor();
    limit.threshold.value = -16; limit.ratio.value = 6; limit.attack.value = 0.003; limit.release.value = 0.12;
    master.connect(soft).connect(limit).connect(ctx.destination);
  } catch { ctx = null; master = null; }
}

if (typeof window !== "undefined") {
  const gesture = () => {
    arm();
    if (ctx) for (const e of ["pointerdown", "keydown", "touchstart"]) removeEventListener(e, gesture, true);
  };
  for (const e of ["pointerdown", "keydown", "touchstart"]) addEventListener(e, gesture, { capture: true, passive: true });
}

type Tone = { f: number; at: number; dur: number; type?: OscillatorType; vol?: number; to?: number };
type Puff = { at: number; dur: number; vol: number; filter: BiquadFilterType; f: number; to?: number; q?: number };

function tone(c: AudioContext, out: AudioNode, t0: number, n: Tone) {
  const o = c.createOscillator(), g = c.createGain();
  o.type = n.type ?? "sine";
  o.frequency.setValueAtTime(n.f, t0 + n.at);
  if (n.to) o.frequency.exponentialRampToValueAtTime(n.to, t0 + n.at + n.dur);
  g.gain.setValueAtTime(0.0001, t0 + n.at);
  g.gain.exponentialRampToValueAtTime(n.vol ?? 0.12, t0 + n.at + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + n.at + n.dur);
  o.connect(g).connect(out);
  o.start(t0 + n.at);
  o.stop(t0 + n.at + n.dur + 0.02);
}

function puff(c: AudioContext, out: AudioNode, t0: number, n: Puff) {
  if (!noise) {
    noise = c.createBuffer(1, Math.floor(c.sampleRate * 0.6), c.sampleRate);
    const d = noise.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  const s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
  s.buffer = noise;
  f.type = n.filter; f.Q.value = n.q ?? 1;
  f.frequency.setValueAtTime(n.f, t0 + n.at);
  if (n.to) f.frequency.exponentialRampToValueAtTime(n.to, t0 + n.at + n.dur);
  g.gain.setValueAtTime(0.0001, t0 + n.at);
  g.gain.exponentialRampToValueAtTime(n.vol, t0 + n.at + Math.min(0.02, n.dur / 3));
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + n.at + n.dur);
  s.connect(f).connect(g).connect(out);
  s.start(t0 + n.at, Math.random() * 0.2);
  s.stop(t0 + n.at + n.dur + 0.02);
}

const notes = (fs: number[], gap: number, dur: number, vol: number, type: OscillatorType = "triangle"): Tone[] => fs.map((f, i) => ({ f, at: i * gap, dur: dur - i * 0.02, type, vol }));

const TONES: Record<SoundName, Tone[]> = {
  blip: [{ f: 620, at: 0, dur: 0.06, type: "triangle", vol: 0.09 }],
  confirm: [{ f: 523, at: 0, dur: 0.1, type: "triangle", vol: 0.12 }, { f: 784, at: 0.07, dur: 0.16, type: "triangle", vol: 0.12 }],
  back: [{ f: 440, at: 0, dur: 0.09, type: "triangle", vol: 0.1 }, { f: 294, at: 0.06, dur: 0.14, type: "triangle", vol: 0.1 }],
  flip: [{ f: 760, at: 0, dur: 0.12, type: "sine", vol: 0.1, to: 300 }],
  // success sting: a warm rising arpeggio with a soft octave shimmer on top; the old "epic" name maps to it for the games already using it
  success: [...notes([523, 659, 784, 1047], 0.08, 0.5, 0.13), { f: 2093, at: 0.24, dur: 0.4, type: "sine", vol: 0.03 }],
  epic: [...notes([523, 659, 784, 1047], 0.08, 0.5, 0.13), { f: 2093, at: 0.24, dur: 0.4, type: "sine", vol: 0.03 }],
  // boot chime: three warm notes (C5 E5 G5)
  boot: [{ f: 523.25, at: 0, dur: 0.5, type: "triangle", vol: 0.12 }, { f: 659.25, at: 0.15, dur: 0.5, type: "triangle", vol: 0.12 }, { f: 783.99, at: 0.3, dur: 0.8, type: "triangle", vol: 0.13 },
    { f: 261.63, at: 0, dur: 1.0, type: "sine", vol: 0.07 }],
  // monitor power-on: a low thunk, then a soft 60/120 Hz hum that fades in and out
  power: [{ f: 120, at: 0, dur: 0.22, type: "sine", vol: 0.34, to: 46 }, { f: 60, at: 0.12, dur: 1.1, type: "sine", vol: 0.05 }, { f: 120, at: 0.12, dur: 0.9, type: "sine", vol: 0.025 }],
  pad: [{ f: 520, at: 0, dur: 0.04, type: "triangle", vol: 0.09, to: 300 }],
  clack: [],
  whoosh: [],
  open: [{ f: 330, at: 0.05, dur: 0.14, type: "triangle", vol: 0.07, to: 520 }],
  close: [{ f: 440, at: 0.02, dur: 0.14, type: "triangle", vol: 0.07, to: 270 }],
};

const PUFFS: Partial<Record<SoundName, Puff[]>> = {
  power: [{ at: 0, dur: 0.18, vol: 0.12, filter: "lowpass", f: 500 }, { at: 0.02, dur: 0.05, vol: 0.05, filter: "bandpass", f: 2400, q: 0.8 }],
  pad: [{ at: 0, dur: 0.025, vol: 0.1, filter: "bandpass", f: 3000, q: 1 }],
  whoosh: [{ at: 0, dur: 0.38, vol: 0.14, filter: "bandpass", f: 380, to: 2400, q: 0.9 }, { at: 0.18, dur: 0.3, vol: 0.09, filter: "bandpass", f: 2400, to: 500, q: 0.9 }],
  open: [{ at: 0, dur: 0.22, vol: 0.1, filter: "bandpass", f: 500, to: 1800, q: 0.9 }],
  close: [{ at: 0, dur: 0.2, vol: 0.09, filter: "bandpass", f: 1700, to: 450, q: 0.9 }],
};

/** Stable small number for a key name, so each key always clacks in its own voice. */
export function keyVariant(id: string): number {
  let h = 7;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return h % 7;
}

/** Plays a sound. `variant` (0-6) shifts the pitch of a key clack; the same key keeps the same voice. */
export function play(name: SoundName, variant = 0): void {
  if (!ctx || !master || isMuted()) return;
  void ctx.resume?.();
  const t0 = ctx.currentTime + 0.005;
  if (name === "clack") {
    // mechanical switch: a bright click on the way down, a low "thock" from the case, a softer click on the way up
    const v = variant % 7, shift = 1 + (v - 3) * 0.045;
    puff(ctx, master, t0, { at: 0, dur: 0.035, vol: 0.2, filter: "bandpass", f: 2100 * shift, q: 1.1 });
    tone(ctx, master, t0, { f: 190 * shift, at: 0, dur: 0.07, type: "sine", vol: 0.2, to: 85 * shift });
    puff(ctx, master, t0, { at: 0.075, dur: 0.025, vol: 0.07, filter: "bandpass", f: 1500 * shift, q: 1.1 });
    return;
  }
  for (const n of TONES[name]) tone(ctx, master, t0, n);
  for (const p of PUFFS[name] ?? []) puff(ctx, master, t0, p);
}

/** The success sting minigames play when the goal is reached. */
export const playSuccess = (): void => play("success");
/** A mechanical key clack, varied per key (any stable id: "enter", "p3", "left"...). */
export const playKey = (id: string): void => play("clack", keyVariant(id));
