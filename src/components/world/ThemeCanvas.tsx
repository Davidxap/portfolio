"use client";
import { useEffect, useRef } from "react";
import { currentTheme, type Theme } from "@/lib/theme";

/** Where the painted sun and the cathedral spire sit, in 0..1 of the canvas, the band where the city lights live and how thick the fog gets. In the interactive
 * view the canvas is the view through the painted window; in the direct view it is the paint field behind the page. */
type Anchors = { sun: [number, number]; spire: [number, number]; city: [number, number]; fog: number };
const ANCHORS: Record<"window" | "page", Anchors> = {
  window: { sun: [0.49, 0.46], spire: [0.29, 0.5], city: [0.72, 0.98], fog: 1 },
  page: { sun: [0.8, 0.1], spire: [0.14, 0.28], city: [0.42, 0.6], fog: 0.55 },
};

type Pal = { accent: string; accent2: string; cta: string; text: string };
type Frame = { c: CanvasRenderingContext2D; w: number; h: number; t: number; dt: number; px: number; py: number; near: boolean; pal: Pal; q: number; a: Anchors };
/** `res` renders the canvas below the screen's pixel ratio: soft, huge sprites (fog, clouds) look the same at half the pixels. */
type Fx = { step: (f: Frame) => void; burst?: (f: Frame, x: number, y: number) => void; res?: number };

const TAU = Math.PI * 2;
const R = (a: number, b: number) => a + Math.random() * (b - a);
/** Particle budget for this canvas size: about one per 3,000 px², scaled by the adaptive quality. */
const budget = (f: Frame, per: number) => Math.max(6, Math.round(((f.w * f.h) / 450_000) * per * f.q));

/** "#rgb", "#rrggbb" or "rgb()" to [r, g, b]; the browser normalises any CSS colour through fillStyle. */
let norm: CanvasRenderingContext2D | null | undefined;
function rgbOf(col: string): [number, number, number] {
  if (norm === undefined) norm = document.createElement("canvas").getContext("2d");
  if (norm) { norm.fillStyle = "#000"; norm.fillStyle = col; col = String(norm.fillStyle); }
  const m = col.match(/\d+(\.\d+)?/g);
  if (col.startsWith("#")) { const n = parseInt(col.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; }
  return m ? [+m[0], +m[1], +m[2]] : [255, 255, 255];
}
const rgba = (col: string, a: number) => { const [r, g, b] = rgbOf(col); return `rgba(${r},${g},${b},${a})`; };

/** Soft round sprites, rendered once per colour and drawn with drawImage: far cheaper than a gradient per particle. */
const sprites = new Map<string, HTMLCanvasElement>();
function glow(col: string, core = 0): HTMLCanvasElement {
  const key = `${col}|${core}`;
  let s = sprites.get(key);
  if (s) return s;
  s = document.createElement("canvas");
  s.width = s.height = 64;
  const g = s.getContext("2d")!;
  const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, rgba(col, 1));
  if (core) gr.addColorStop(core, rgba(col, 0.85));
  gr.addColorStop(0.45, rgba(col, core ? 0.25 : 0.4));
  gr.addColorStop(1, rgba(col, 0));
  g.fillStyle = gr;
  g.fillRect(0, 0, 64, 64);
  sprites.set(key, s);
  return s;
}
const dot = (c: CanvasRenderingContext2D, s: HTMLCanvasElement, x: number, y: number, r: number, a: number) => { c.globalAlpha = Math.max(0, Math.min(1, a)); c.drawImage(s, x - r, y - r, r * 2, r * 2); };

type Body = { x: number; y: number; vx: number; vy: number };
/** The pointer pushes particles away within `rad` px, like a hand through snow or dust. */
function repel(p: Body, f: Frame, rad = 90, force = 520) {
  if (!f.near) return;
  const dx = p.x - f.px, dy = p.y - f.py, d2 = dx * dx + dy * dy;
  if (d2 > rad * rad || d2 < 0.01) return;
  const d = Math.sqrt(d2), k = (1 - d / rad) * force * f.dt;
  p.vx += (dx / d) * k; p.vy += (dy / d) * k;
}
/** Burst sparks shared by several themes: they fly out, slow down, fall a little and fade. */
type Spark = Body & { life: number; max: number; r: number; col: string };
function sparks(list: Spark[], x: number, y: number, n: number, cols: string[], speed: [number, number], up = 0) {
  for (let i = 0; i < n; i++) {
    const a = R(0, TAU), v = R(speed[0], speed[1]);
    list.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - up, life: 0, max: R(0.9, 2), r: R(2, 5), col: cols[i % cols.length] });
  }
}
function stepSparks(list: Spark[], f: Frame, gravity: number) {
  for (let i = list.length - 1; i >= 0; i--) {
    const s = list[i];
    s.life += f.dt;
    if (s.life > s.max) { list.splice(i, 1); continue; }
    s.vx *= 1 - 1.6 * f.dt; s.vy = s.vy * (1 - 1.6 * f.dt) + gravity * f.dt;
    s.x += s.vx * f.dt; s.y += s.vy * f.dt;
    const k = 1 - s.life / s.max;
    dot(f.c, glow(s.col, 0.2), s.x, s.y, s.r * 3 * (0.5 + k), k);
  }
}

// ----- Nevado: snow in three depths, blown by a slow wind, parted by the pointer; a click throws a snowball puff -----
function snow(): Fx {
  type P = Body & { z: number; ph: number };
  const ps: P[] = [];
  const add = (x: number, y: number, vx = 0, vy = 0) => ps.push({ x, y, vx, vy, z: R(0.2, 1), ph: R(0, TAU) });
  return {
    step(f) {
      const n = budget(f, 200);
      if (!ps.length) for (let i = 0; i < n; i++) add(R(0, f.w), R(0, f.h));
      while (ps.length < n) add(R(-20, f.w), -10);
      const wind = Math.sin(f.t * 0.13) * 22 + Math.sin(f.t * 0.41) * 8 + 8, flake = glow("#ffffff", 0.35);
      for (let i = ps.length - 1; i >= 0; i--) {
        const p = ps[i];
        repel(p, f);
        p.vx *= 1 - 2.2 * f.dt; p.vy *= 1 - 2.2 * f.dt;
        p.y += ((16 + 52 * p.z) + p.vy) * f.dt;
        p.x += (wind * p.z + Math.sin(f.t * 1.2 + p.ph) * 10 * p.z + p.vx) * f.dt;
        if (p.y > f.h + 10) { if (ps.length > n) { ps.splice(i, 1); continue; } p.y = -10; p.x = R(-20, f.w); }
        if (p.x > f.w + 12) p.x = -12; else if (p.x < -12) p.x = f.w + 12;
        dot(f.c, flake, p.x, p.y, 1.8 + 4.2 * p.z * p.z, 0.25 + 0.7 * p.z);
      }
    },
    burst(f, x, y) { for (let i = 0; i < 36; i++) { const a = R(0, TAU), v = R(60, 260); add(x, y, Math.cos(a) * v, Math.sin(a) * v - 60); } },
  };
}

// ----- Chipre: god rays from the sunset and embers that rise, sway and flicker; a click sprays sparks -----
function embers(): Fx {
  type P = Body & { life: number; max: number; r: number; ph: number; hot: boolean };
  const ps: P[] = [], burst: Spark[] = [];
  let acc = 0;
  return {
    step(f) {
      const { c, w, h } = f, [sx, sy] = [f.a.sun[0] * w, f.a.sun[1] * h];
      c.globalCompositeOperation = "lighter";
      // rays: slow fan of soft wedges
      for (let i = 0; i < 7; i++) {
        const ang = (i / 7) * TAU + f.t * 0.035 + Math.sin(f.t * 0.2 + i) * 0.05, len = Math.max(w, h) * 1.1, spread = 0.09 + 0.04 * Math.sin(f.t * 0.3 + i * 2);
        const g = c.createLinearGradient(sx, sy, sx + Math.cos(ang) * len, sy + Math.sin(ang) * len);
        g.addColorStop(0, rgba(f.pal.cta, 0.16 + 0.06 * Math.sin(f.t * 0.5 + i)));
        g.addColorStop(1, rgba(f.pal.cta, 0));
        c.globalAlpha = 1; c.fillStyle = g;
        c.beginPath(); c.moveTo(sx, sy);
        c.lineTo(sx + Math.cos(ang - spread) * len, sy + Math.sin(ang - spread) * len);
        c.lineTo(sx + Math.cos(ang + spread) * len, sy + Math.sin(ang + spread) * len);
        c.fill();
      }
      dot(c, glow(f.pal.cta), sx, sy, Math.min(w, h) * (0.16 + 0.015 * Math.sin(f.t * 0.8)), 0.55);
      // embers
      const n = budget(f, 110);
      acc += f.dt * n / 6;
      while (acc > 1 && ps.length < n) { acc--; ps.push({ x: R(0, w), y: R(h * 0.75, h * 1.05), vx: 0, vy: -R(14, 48), life: 0, max: R(4, 9), r: R(1, 2.6), ph: R(0, TAU), hot: Math.random() < 0.4 }); }
      for (let i = ps.length - 1; i >= 0; i--) {
        const p = ps[i];
        p.life += f.dt;
        if (p.life > p.max) { ps.splice(i, 1); continue; }
        repel(p, f, 100, 300);
        p.vx = p.vx * (1 - 1.5 * f.dt) + Math.sin(f.t * 1.7 + p.ph) * 14 * f.dt;
        p.x += p.vx * f.dt + Math.sin(f.t + p.ph) * 6 * f.dt; p.y += p.vy * f.dt;
        const fade = Math.sin((Math.PI * p.life) / p.max), flick = 0.6 + 0.4 * Math.sin(f.t * 11 + p.ph * 3);
        dot(c, glow(p.hot ? f.pal.cta : f.pal.accent, 0.25), p.x, p.y, p.r * 4, fade * flick);
      }
      stepSparks(burst, f, 40);
    },
    burst(f, x, y) { sparks(burst, x, y, 46, [f.pal.cta, f.pal.accent, "#fff3c4"], [80, 280], 80); },
  };
}

// ----- Páramo: layered clouds drift below the viewpoint and, now and then, a flock crosses; a click startles a flock -----
function clouds(): Fx {
  type Cloud = { x: number; y: number; s: number; v: number; parts: [number, number, number][] };
  type Flock = { x: number; y: number; v: number; vy: number; n: number; ph: number };
  const cs: Cloud[] = [], flocks: Flock[] = [];
  let next = R(2, 5);
  const cloud = (w: number, h: number, x?: number): Cloud => {
    const s = R(0.5, 1.3);
    return { x: x ?? -260 * s, y: R(h * 0.5, h * 0.92), s, v: R(5, 14) * s, parts: Array.from({ length: 7 }, () => [R(-90, 90), R(-18, 14), R(36, 70)] as [number, number, number]) };
  };
  return {
    step(f) {
      const { c, w, h } = f, white = glow("#ffffff");
      if (!cs.length) for (let i = 0; i < 9; i++) cs.push(cloud(w, h, R(-100, w)));
      cs.sort((a, b) => a.s - b.s);
      for (const cl of cs) {
        cl.x += cl.v * f.dt;
        if (cl.x > w + 260 * cl.s) Object.assign(cl, cloud(w, h));
        for (const [dx, dy, r] of cl.parts) dot(c, white, cl.x + dx * cl.s, cl.y + dy * cl.s + Math.sin(f.t * 0.3 + dx) * 2, r * cl.s * 1.2, 0.22 * cl.s);
      }
      next -= f.dt;
      if (next < 0) { next = R(9, 16); flocks.push({ x: -40, y: R(h * 0.12, h * 0.4), v: R(40, 60), vy: R(-4, 4), n: 5 + Math.floor(R(0, 4)), ph: R(0, TAU) }); }
      c.strokeStyle = "rgba(40,36,48,0.75)"; c.lineWidth = 1.4; c.lineCap = "round"; c.globalAlpha = 1;
      for (let i = flocks.length - 1; i >= 0; i--) {
        const fl = flocks[i];
        fl.x += fl.v * f.dt; fl.y += fl.vy * f.dt;
        if (fl.x > w + 80 || fl.y < -60) { flocks.splice(i, 1); continue; }
        for (let k = 0; k < fl.n; k++) {
          const bx = fl.x - Math.abs(k - fl.n / 2) * 14, by = fl.y + (k - fl.n / 2) * 7, flap = Math.sin(f.t * 9 + k + fl.ph) * 4, sz = 5;
          c.beginPath(); c.moveTo(bx - sz, by - flap); c.quadraticCurveTo(bx - sz / 2, by - 2, bx, by); c.quadraticCurveTo(bx + sz / 2, by - 2, bx + sz, by - flap); c.stroke();
        }
      }
    },
    burst(_f, x, y) { flocks.push({ x, y, v: 110, vy: -45, n: 7, ph: 0 }); },
    res: 0.7,
  };
}

// ----- Tinto: a rainy evening on the glass: streaks behind, beads of condensation, drops that run in fits; the pointer wipes the glass -----
function rain(): Fx {
  type Bead = { x: number; y: number; r: number };
  type Runner = { x: number; y: number; r: number; v: number; stop: number; trail: number };
  type Streak = { x: number; y: number; v: number; l: number };
  let beads: Bead[] = [];
  const runners: Runner[] = [], streaks: Streak[] = [];
  const runner = (w: number): Runner => ({ x: R(0, w), y: R(-40, -5), r: R(2.4, 4.2), v: R(40, 110), stop: R(0, 1.5), trail: 0 });
  const drop = (c: CanvasRenderingContext2D, x: number, y: number, r: number) => {
    c.globalAlpha = 1;
    c.fillStyle = "rgba(10,8,6,0.28)"; c.beginPath(); c.arc(x + r * 0.15, y + r * 0.35, r, 0, TAU); c.fill();
    c.fillStyle = "rgba(255,240,220,0.16)"; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill();
    c.fillStyle = "rgba(255,255,255,0.7)"; c.beginPath(); c.arc(x - r * 0.35, y - r * 0.35, Math.max(0.5, r * 0.28), 0, TAU); c.fill();
  };
  return {
    step(f) {
      const { c, w, h } = f;
      const ns = budget(f, 90), nb = budget(f, 260), nr = Math.max(3, Math.round(budget(f, 10)));
      while (streaks.length < ns) streaks.push({ x: R(0, w + 100), y: R(-h, h), v: R(700, 1100), l: R(14, 34) });
      c.strokeStyle = rgba(f.pal.text, 0.16); c.lineWidth = 1; c.globalAlpha = 1; c.beginPath();
      for (const s of streaks) {
        s.y += s.v * f.dt; s.x -= s.v * 0.12 * f.dt;
        if (s.y > h) { s.y = R(-60, -10); s.x = R(0, w + 100); }
        c.moveTo(s.x, s.y); c.lineTo(s.x + s.l * 0.12, s.y - s.l);
      }
      c.stroke();
      while (beads.length < nb) beads.push({ x: R(0, w), y: R(0, h), r: R(0.6, 2.2) });
      if (f.near) beads = beads.filter((b) => (b.x - f.px) ** 2 + (b.y - f.py) ** 2 > 900);
      for (const b of beads) drop(c, b.x, b.y, b.r);
      while (runners.length < nr) runners.push(runner(w));
      for (let i = runners.length - 1; i >= 0; i--) {
        const r = runners[i];
        if (r.stop > 0) r.stop -= f.dt;
        else {
          r.y += r.v * f.dt; r.x += Math.sin(r.y * 0.05) * 0.3;
          r.trail += r.v * f.dt;
          if (r.trail > 9) { r.trail = 0; beads.push({ x: r.x + R(-1, 1), y: r.y - r.r * 2, r: R(0.5, 1.3) }); }
          if (Math.random() < f.dt * 0.6) r.stop = R(0.2, 1.4);
          beads = beads.filter((b) => Math.abs(b.x - r.x) > r.r + b.r || Math.abs(b.y - r.y) > r.r + b.r);
        }
        if (r.y > h + 10) { runners.splice(i, 1); continue; }
        drop(c, r.x, r.y, r.r);
      }
      if (beads.length > nb * 1.3) beads.splice(0, beads.length - nb);
    },
    burst(_f, x, y) {
      for (let i = 0; i < 14; i++) { const a = R(0, TAU), d = R(4, 26); beads.push({ x: x + Math.cos(a) * d, y: y + Math.sin(a) * d, r: R(0.8, 2.4) }); }
      runners.push({ x, y, r: 4.4, v: 90, stop: 0.3, trail: 0 });
    },
  };
}

// ----- Cafetal: fireflies that wander the hills and drift toward the pointer, and coffee leaves tumbling down; a click scatters them -----
function fireflies(): Fx {
  type P = Body & { a: number; sp: number; ph: number; fq: number };
  type Leaf = { x: number; y: number; rot: number; vr: number; ph: number; s: number };
  const ps: P[] = [], leaves: Leaf[] = [], burst: Spark[] = [];
  return {
    step(f) {
      const { c, w, h } = f, n = budget(f, 55), top = h * 0.3;
      while (ps.length < n) ps.push({ x: R(0, w), y: R(top, h), vx: 0, vy: 0, a: R(0, TAU), sp: R(10, 24), ph: R(0, TAU), fq: R(1.2, 2.6) });
      while (leaves.length < Math.max(3, Math.round(budget(f, 7)))) leaves.push({ x: R(0, w), y: R(-h, -10), rot: R(0, TAU), vr: R(-2, 2), ph: R(0, TAU), s: R(4, 8) });
      c.globalCompositeOperation = "source-over";
      for (const l of leaves) {
        l.y += 26 * f.dt; l.x += Math.sin(f.t * 1.1 + l.ph) * 22 * f.dt; l.rot += l.vr * f.dt;
        if (l.y > h + 12) { l.y = -12; l.x = R(0, w); }
        c.save(); c.translate(l.x, l.y); c.rotate(l.rot); c.scale(1, Math.abs(Math.cos(f.t * 1.4 + l.ph)) * 0.8 + 0.2);
        c.globalAlpha = 0.75; c.fillStyle = rgba(f.pal.accent, 0.55);
        c.beginPath(); c.ellipse(0, 0, l.s, l.s * 0.45, 0, 0, TAU); c.fill();
        c.strokeStyle = rgba(f.pal.text, 0.35); c.lineWidth = 0.6; c.beginPath(); c.moveTo(-l.s, 0); c.lineTo(l.s, 0); c.stroke();
        c.restore();
      }
      c.globalCompositeOperation = "lighter";
      const halo = glow(f.pal.accent), core = glow("#fffbe0", 0.3);
      for (const p of ps) {
        p.a += R(-1, 1) * 2.4 * f.dt;
        if (f.near) { const dx = f.px - p.x, dy = f.py - p.y, d = Math.hypot(dx, dy); if (d < 180 && d > 20) p.a += Math.sin(Math.atan2(dy, dx) - p.a) * 1.6 * f.dt; }
        if (p.y < top) p.a += Math.sin(Math.PI / 2 - p.a) * 2 * f.dt; else if (p.y > h) p.a += Math.sin(-Math.PI / 2 - p.a) * 2 * f.dt;
        p.vx *= 1 - 2 * f.dt; p.vy *= 1 - 2 * f.dt;
        p.x += (Math.cos(p.a) * p.sp + p.vx) * f.dt; p.y += (Math.sin(p.a) * p.sp * 0.6 + p.vy) * f.dt;
        if (p.x < -10) p.x = w + 10; else if (p.x > w + 10) p.x = -10;
        const b = Math.max(0, Math.sin(f.t * p.fq + p.ph)) ** 3;
        dot(c, halo, p.x, p.y, 16, b * 0.9); dot(c, core, p.x, p.y, 3, b);
      }
      stepSparks(burst, f, -10);
    },
    burst(f, x, y) {
      for (const p of ps) { const dx = p.x - x, dy = p.y - y, d = Math.hypot(dx, dy) || 1; if (d < 200) { p.vx += (dx / d) * 160; p.vy += (dy / d) * 160; } }
      sparks(burst, x, y, 18, [f.pal.accent, "#fffbe0"], [30, 110]);
    },
  };
}

// ----- Niebla: banks of fog drift at several depths; the pointer clears a soft hole and a click sends a clearing ring -----
function fog(): Fx {
  type Bank = { x: number; y: number; r: number; v: number; ph: number; a: number };
  type Ring = { x: number; y: number; life: number };
  const banks: Bank[] = [], rings: Ring[] = [];
  let hx = -1e4, hy = -1e4;
  return {
    step(f) {
      const { c, w, h } = f, n = 18, puff = glow("#eceaf2"), hole = glow("#000");
      if (!banks.length) for (let i = 0; i < n; i++) banks.push({ x: R(-200, w + 200), y: R(h * 0.2, h * 1.05), r: R(0.25, 0.55) * Math.max(w, h * 1.4), v: R(5, 16), ph: R(0, TAU), a: R(0.3, 0.55) });
      for (const b of banks) {
        b.x += b.v * f.dt;
        if (b.x - b.r > w) b.x = -b.r;
        dot(c, puff, b.x, b.y + Math.sin(f.t * 0.2 + b.ph) * 14, b.r, b.a * f.a.fog * (0.8 + 0.2 * Math.sin(f.t * 0.35 + b.ph)));
      }
      c.globalCompositeOperation = "destination-out";
      if (f.near) { hx += (f.px - hx) * Math.min(1, f.dt * 5); hy += (f.py - hy) * Math.min(1, f.dt * 5); if (hx < -5e3) { hx = f.px; hy = f.py; } dot(c, hole, hx, hy, 130, 0.85); }
      for (let i = rings.length - 1; i >= 0; i--) {
        const r = rings[i];
        r.life += f.dt;
        if (r.life > 2) { rings.splice(i, 1); continue; }
        dot(c, hole, r.x, r.y, 40 + r.life * 200, (1 - r.life / 2) * 0.9);
      }
    },
    burst(_f, x, y) { rings.push({ x, y, life: 0 }); },
    res: 0.5,
  };
}

// ----- Cable: a starry night, city windows that light up and go out, shooting stars; a click sets off a small firework -----
function night(): Fx {
  type Star = { x: number; y: number; r: number; ph: number; fq: number };
  type Light = { x: number; y: number; on: number; t: number };
  type Shoot = { x: number; y: number; vx: number; vy: number; life: number };
  const stars: Star[] = [], lights: Light[] = [], shots: Shoot[] = [], burst: Spark[] = [];
  let next = R(1.5, 4);
  return {
    step(f) {
      const { c, w, h } = f, [c0, c1] = f.a.city;
      while (stars.length < budget(f, 120)) stars.push({ x: R(0, w), y: R(0, h * Math.min(0.55, c0)), r: R(0.4, 1.5), ph: R(0, TAU), fq: R(0.8, 2.5) });
      while (lights.length < budget(f, 60)) lights.push({ x: R(0, w), y: R(h * c0, h * c1), on: Math.random(), t: R(0, 6) });
      c.globalCompositeOperation = "lighter";
      const star = glow("#ffffff", 0.4), warm = glow(f.pal.accent, 0.3);
      for (const s of stars) dot(c, star, s.x, s.y, s.r * 3, 0.25 + 0.75 * Math.abs(Math.sin(f.t * s.fq + s.ph)));
      for (const l of lights) {
        l.t -= f.dt;
        if (l.t < 0) { l.t = R(2, 9); l.on = l.on > 0.5 ? 0 : 1; }
        const target = l.on > 0.5 ? 1 : 0.08;
        l.on += (target - l.on) * Math.min(1, f.dt * 3);
        dot(c, warm, l.x, l.y, 5, l.on * 0.8);
      }
      next -= f.dt;
      if (next < 0) { next = R(3, 8); const a = R(0.35, 0.7); shots.push({ x: R(-0.1, 0.7) * w, y: R(0, 0.25) * h, vx: Math.cos(a) * 520, vy: Math.sin(a) * 520, life: 0 }); }
      for (let i = shots.length - 1; i >= 0; i--) {
        const s = shots[i];
        s.life += f.dt; s.x += s.vx * f.dt; s.y += s.vy * f.dt;
        if (s.life > 1.1) { shots.splice(i, 1); continue; }
        const k = 1 - s.life / 1.1, tx = s.x - s.vx * 0.16, ty = s.y - s.vy * 0.16;
        const g = c.createLinearGradient(s.x, s.y, tx, ty);
        g.addColorStop(0, `rgba(255,255,255,${0.9 * k})`); g.addColorStop(1, "rgba(255,255,255,0)");
        c.globalAlpha = 1; c.strokeStyle = g; c.lineWidth = 1.6; c.beginPath(); c.moveTo(s.x, s.y); c.lineTo(tx, ty); c.stroke();
        dot(c, star, s.x, s.y, 4, k);
      }
      stepSparks(burst, f, 70);
    },
    burst(f, x, y) { sparks(burst, x, y, 60, [f.pal.accent, f.pal.accent2, f.pal.cta, "#ffffff"], [60, 240], 30); },
  };
}

// ----- Catedral: stained-glass beams sway slowly, dust motes light up only inside them, gold glints around the spire; a click showers gold -----
function cathedral(): Fx {
  type Mote = Body & { ph: number };
  type Glint = { x: number; y: number; life: number; s: number };
  const motes: Mote[] = [], glints: Glint[] = [], burst: Spark[] = [];
  let acc = 0;
  return {
    step(f) {
      const { c, w, h } = f, cols = [f.pal.accent2, f.pal.accent, "#e0457b"];
      const beams = cols.map((col, i) => ({ ox: w * (0.12 + i * 0.3), ang: 0.32 + Math.sin(f.t * 0.12 + i) * 0.06, wd: Math.max(40, w * (0.07 + i * 0.015)), col, a: 0.08 + 0.05 * Math.sin(f.t * 0.3 + i * 2) }));
      c.globalCompositeOperation = "lighter";
      const len = Math.hypot(w, h) * 1.2;
      for (const b of beams) {
        c.save(); c.translate(b.ox, -20); c.rotate(-b.ang);
        const g = c.createLinearGradient(-b.wd / 2, 0, b.wd / 2, 0);
        g.addColorStop(0, rgba(b.col, 0)); g.addColorStop(0.5, rgba(b.col, b.a)); g.addColorStop(1, rgba(b.col, 0));
        c.globalAlpha = 1; c.fillStyle = g; c.fillRect(-b.wd / 2, 0, b.wd, len);
        c.restore();
      }
      while (motes.length < budget(f, 140)) motes.push({ x: R(0, w), y: R(0, h), vx: R(-4, 4), vy: R(-3, 3), ph: R(0, TAU) });
      const gold = glow(f.pal.accent, 0.3);
      for (const m of motes) {
        repel(m, f, 80, 260);
        m.vx = m.vx * (1 - f.dt) + Math.sin(f.t * 0.7 + m.ph) * 3 * f.dt; m.vy = m.vy * (1 - f.dt) + Math.cos(f.t * 0.5 + m.ph) * 3 * f.dt;
        m.x += m.vx * f.dt; m.y += m.vy * f.dt;
        if (m.x < 0) m.x = w; else if (m.x > w) m.x = 0; if (m.y < 0) m.y = h; else if (m.y > h) m.y = 0;
        let lit = 0.12;
        for (const b of beams) { const dx = m.x - b.ox, dy = m.y + 20, d = Math.abs(dx * Math.cos(b.ang) + dy * Math.sin(b.ang)); if (d < b.wd / 2) lit = Math.max(lit, 1 - d / (b.wd / 2)); }
        dot(c, gold, m.x, m.y, 4, lit * (0.6 + 0.4 * Math.sin(f.t * 2 + m.ph)));
      }
      acc += f.dt;
      if (acc > 0.35) { acc = 0; glints.push({ x: f.a.spire[0] * w + R(-0.06, 0.06) * w, y: f.a.spire[1] * h + R(-0.18, 0.2) * h, life: 0, s: R(5, 11) }); }
      c.strokeStyle = rgba(f.pal.accent, 1); c.lineWidth = 1.2;
      for (let i = glints.length - 1; i >= 0; i--) {
        const g = glints[i];
        g.life += f.dt;
        if (g.life > 1.1) { glints.splice(i, 1); continue; }
        const k = Math.sin((Math.PI * g.life) / 1.1), s = g.s * k;
        c.globalAlpha = k; c.beginPath(); c.moveTo(g.x - s, g.y); c.lineTo(g.x + s, g.y); c.moveTo(g.x, g.y - s); c.lineTo(g.x, g.y + s); c.stroke();
        dot(c, gold, g.x, g.y, s * 0.8, k);
      }
      stepSparks(burst, f, 90);
    },
    burst(f, x, y) { sparks(burst, x, y, 50, [f.pal.accent, "#fff3c4", f.pal.accent2], [40, 200], 120); },
  };
}

const FX: Record<Theme, () => Fx> = { chipre: embers, paramo: clouds, tinto: rain, cafetal: fireflies, niebla: fog, nevado: snow, cable: night, catedral: cathedral };

/** Things a click should keep doing (links, buttons, text); a click anywhere else on the painting sets off the theme's burst. */
const INTERACTIVE = "a, button, input, textarea, select, label, summary, [role='button'], [role='tab'], p, h1, h2, h3, li, img:not(.wp-art img), dialog, .win, .bar, .dock";

/**
 * The theme atmosphere as a small canvas particle engine: snow, embers, clouds and birds, rain on the glass, fireflies, fog, a starry night or
 * stained-glass light, one per theme. Particles react to the pointer (pushed, attracted, or the fog parts) and a click on the bare painting
 * sets off a burst. It sizes to its parent, caps the pixel ratio, lowers the particle count when frames run long, pauses when hidden, starts
 * once the page has settled, and runs at a calmer pace under reduced motion.
 */
export function ThemeCanvas({ place }: { place: "window" | "page" }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current, host = cv?.parentElement;
    if (!cv || !host) return;
    let ctx: CanvasRenderingContext2D | null = null;
    try { ctx = cv.getContext("2d"); } catch { ctx = null; }
    if (!ctx) return;
    const c = ctx, a = ANCHORS[place];
    const pace = matchMedia("(prefers-reduced-motion: reduce)").matches ? 0.4 : 1;
    let q = matchMedia("(max-width: 720px)").matches ? 0.5 : 1;
    let w = 1, h = 1, dpr = 1, raf = 0, last = 0, t = 0, slow = 0, visible = true, started = false;
    let px = -1e4, py = -1e4, moved = -1e9;
    let pal: Pal = { accent: "#e9a55c", accent2: "#6fcfc2", cta: "#ff7a45", text: "#f6ecdc" };
    let fx: Fx = FX[currentTheme()]();
    const pick = () => {
      const cs = getComputedStyle(document.documentElement), v = (k: string, d: string) => cs.getPropertyValue(k).trim() || d;
      pal = { accent: v("--accent", pal.accent), accent2: v("--accent-2", pal.accent2), cta: v("--cta", pal.cta), text: v("--text", pal.text) };
      fx = FX[currentTheme()]();
      size();
    };
    const size = () => {
      const r = host.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 1.5) * (fx.res ?? 1);
      w = Math.max(1, r.width); h = Math.max(1, Math.min(r.height, place === "page" ? window.innerHeight * 1.1 : r.height));
      cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
    };
    const frame = (now: number): Frame => ({ c, w, h, t, dt: 0, px, py, near: now - moved < 3000, pal, q, a });
    const loop = (now: number) => {
      raf = 0;
      const real = Math.min(0.05, last ? (now - last) / 1000 : 0.016);
      last = now;
      // frames over ~30 ms for two seconds: drop a third of the particles (down to a quarter of the full count)
      slow = real > 0.03 ? slow + real : Math.max(0, slow - real * 0.5);
      if (slow > 2 && q > 0.25) { q *= 0.66; slow = 0; }
      t += real * pace;
      c.setTransform(dpr, 0, 0, dpr, 0, 0);
      c.globalCompositeOperation = "source-over"; c.globalAlpha = 1;
      c.clearRect(0, 0, w, h);
      const f = frame(now);
      f.dt = real * pace;
      fx.step(f);
      kick();
    };
    const kick = () => { if (started && visible && !document.hidden && !raf) raf = requestAnimationFrame(loop); };
    const onMove = (e: PointerEvent) => { const r = cv.getBoundingClientRect(); px = e.clientX - r.left; py = e.clientY - r.top; moved = performance.now(); };
    const onDown = (e: PointerEvent) => {
      const el = e.target as Element | null;
      if (!el?.closest?.(place === "window" ? ".wallpaper" : ".direct") || el.closest(INTERACTIVE) || el.closest(".pin")) return;
      const r = cv.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
      if (x < 0 || y < 0 || x > w || y > h) return;
      fx.burst?.(frame(performance.now()), x, y);
    };
    const onVis = () => { last = 0; kick(); };
    const ro = typeof ResizeObserver === "function" ? new ResizeObserver(size) : null;
    const io = typeof IntersectionObserver === "function" ? new IntersectionObserver(([en]) => { visible = en.isIntersecting; last = 0; kick(); }) : null;
    const mo = new MutationObserver(pick);
    pick();
    ro?.observe(host); io?.observe(cv);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    document.addEventListener("visibilitychange", onVis);
    // Decoration waits until the page has settled, so it never competes with loading.
    const boot = window.setTimeout(() => { started = true; cv.dataset.live = "true"; kick(); }, 700);
    return () => {
      window.clearTimeout(boot); cancelAnimationFrame(raf);
      ro?.disconnect(); io?.disconnect(); mo.disconnect();
      window.removeEventListener("pointermove", onMove); window.removeEventListener("pointerdown", onDown);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [place]);
  return <canvas ref={ref} className="fx-canvas" aria-hidden="true" />;
}
