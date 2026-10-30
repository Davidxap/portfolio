// The motion toggle (WCAG 2.2.2): decorative motion that plays on its own (the wallpaper details, the paint field, the steam, the glints)
// can be paused, and the choice is remembered. Paused motion is marked on <html data-motion="paused">, set before first paint by
// MOTION_INIT_SCRIPT; CSS freezes decorative animations and the canvas loops stop. The arcade games are interactive and keep running.

const KEY = "motion-paused";
const listeners = new Set<(paused: boolean) => void>();

export const isMotionPaused = (): boolean => typeof document !== "undefined" && document.documentElement.dataset.motion === "paused";

export function setMotionPaused(paused: boolean) {
  if (paused) document.documentElement.dataset.motion = "paused";
  else delete document.documentElement.dataset.motion;
  try { localStorage.setItem(KEY, paused ? "1" : "0"); } catch { /* storage unavailable */ }
  listeners.forEach((fn) => fn(paused));
}

export function onMotionChange(fn: (paused: boolean) => void) {
  listeners.add(fn);
  return () => { listeners.delete(fn); };
}

/** Runs in <head> before first paint, so a paused page never starts moving. */
export const MOTION_INIT_SCRIPT = `try{if(localStorage.getItem("${KEY}")==="1")document.documentElement.dataset.motion="paused"}catch(e){}`;
