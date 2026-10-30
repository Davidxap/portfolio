"use client";
import { useEffect, useRef } from "react";
import { isMotionPaused } from "@/lib/motion";

/** One wisp of steam: where it leaves the rim (0..1 of the canvas width), its phase, speed and how long it lives before fading. */
type Wisp = { x0: number; ph: number; sp: number; age: number; life: number; amp: number };
const R = (a: number, b: number) => a + Math.random() * (b - a);
const wisp = (age = 0): Wisp => ({ x0: R(0.36, 0.64), ph: R(0, Math.PI * 2), sp: R(1.1, 1.8), age, life: R(3.5, 6), amp: R(0.7, 1.3) });

/**
 * Steam rising from the painted coffee mug: a few ribbons that leave the rim thin, curl as they climb (two travelling sine waves whose
 * swing grows with height), widen, and fade out at the top and over their life, so the column keeps changing shape. Soft by drawing each
 * ribbon twice, a wide faint pass and a thin brighter core. Sized to its parent; pauses when hidden or with the motion toggle;
 * calmer under reduced motion.
 */
export function SteamCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current, host = cv?.parentElement;
    if (!cv || !host) return;
    let ctx: CanvasRenderingContext2D | null = null;
    try { ctx = cv.getContext("2d"); } catch { ctx = null; }
    if (!ctx) return;
    const c = ctx;
    const pace = matchMedia("(prefers-reduced-motion: reduce)").matches ? 0.45 : 1;
    const wisps = Array.from({ length: 4 }, (_, i) => wisp(i * 1.4));
    let w = 1, h = 1, dpr = 1, raf = 0, last = 0, t = 0, visible = true;
    const size = () => {
      const r = host.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = Math.max(1, r.width); h = Math.max(1, r.height);
      cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
    };
    const ribbon = (p: Wisp, width: number, alpha: number) => {
      const life = Math.sin(Math.PI * Math.min(1, p.age / p.life)); // fades in, holds, fades out
      const top = h * (0.25 + 0.75 * Math.min(1, p.age / 1.6)); // a new wisp grows up from the rim
      let px = p.x0 * w, py = h;
      for (let y = 0; y <= top; y += 3) {
        const k = y / h; // 0 at the rim, 1 at the top
        const swing = (1.5 + k * 16) * p.amp;
        const x = p.x0 * w + Math.sin(k * 7 - t * p.sp + p.ph) * swing + Math.sin(k * 15 - t * p.sp * 1.7 + p.ph * 2) * swing * 0.35 + k * k * 10 * Math.sin(t * 0.3 + p.ph);
        const yy = h - y;
        c.globalAlpha = alpha * life * Math.sin(Math.PI * Math.min(1, k * 1.15)) ** 0.8 * (1 - k * 0.6);
        c.lineWidth = width * (1 + k * 3.2);
        c.beginPath(); c.moveTo(px, py); c.lineTo(x, yy); c.stroke();
        px = x; py = yy;
      }
    };
    const loop = (now: number) => {
      raf = 0;
      const dt = Math.min(0.05, last ? (now - last) / 1000 : 0.016) * pace;
      last = now; t += dt;
      c.setTransform(dpr, 0, 0, dpr, 0, 0);
      c.clearRect(0, 0, w, h);
      c.lineCap = "butt"; c.lineJoin = "round";
      c.strokeStyle = "rgb(255 250 240)";
      for (let i = 0; i < wisps.length; i++) {
        const p = wisps[i];
        p.age += dt;
        if (p.age > p.life) wisps[i] = wisp();
        ribbon(p, Math.max(2.5, w * 0.08), 0.09);
        ribbon(p, Math.max(1, w * 0.025), 0.3);
      }
      if (visible && !document.hidden && !isMotionPaused()) raf = requestAnimationFrame(loop);
    };
    const kick = () => { if (visible && !document.hidden && !isMotionPaused() && !raf) { last = 0; raf = requestAnimationFrame(loop); } };
    const ro = typeof ResizeObserver === "function" ? new ResizeObserver(size) : null;
    const io = typeof IntersectionObserver === "function" ? new IntersectionObserver(([en]) => { visible = en.isIntersecting; kick(); }) : null;
    const mo = new MutationObserver(kick);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-motion"] });
    size(); ro?.observe(host); io?.observe(cv);
    document.addEventListener("visibilitychange", kick);
    const boot = window.setTimeout(kick, 700);
    return () => { window.clearTimeout(boot); cancelAnimationFrame(raf); ro?.disconnect(); io?.disconnect(); mo.disconnect(); document.removeEventListener("visibilitychange", kick); };
  }, []);
  return <canvas ref={ref} className="fx-steam-cv" aria-hidden="true" />;
}
