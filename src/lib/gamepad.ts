// Zero cost until a gamepad connects. Emits pad:move {dx,dy}, pad:a, pad:b on document.
export function initGamepad(): () => void {
  let started = false;
  const onConnect = () => start();
  function start() {
    if (started) return;
    started = true;
    document.documentElement.classList.add("has-pad");
    const prev: Record<string, boolean> = {};
    let nextMove = 0;
    const emit = (n: string, d?: object) => document.dispatchEvent(new CustomEvent(n, { detail: d }));
    const edge = (k: string, v: boolean, fn: () => void) => { if (v && !prev[k]) fn(); prev[k] = v; };
    const loop = (now: number) => {
      if (!started) return;
      const gp = Array.from(navigator.getGamepads()).find(Boolean);
      if (gp) {
        const b = (i: number) => !!gp.buttons[i]?.pressed;
        const dx = (b(15) || gp.axes[0] > 0.6 ? 1 : 0) - (b(14) || gp.axes[0] < -0.6 ? 1 : 0);
        const dy = (b(13) || gp.axes[1] > 0.6 ? 1 : 0) - (b(12) || gp.axes[1] < -0.6 ? 1 : 0);
        if ((dx || dy) && now >= nextMove) { emit("pad:move", { dx, dy }); nextMove = now + 220; }
        if (!dx && !dy) nextMove = 0;
        edge("a", b(0), () => emit("pad:a"));
        edge("b", b(1), () => emit("pad:b"));
      }
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }
  addEventListener("gamepadconnected", onConnect, { once: true });
  if (navigator.getGamepads && Array.from(navigator.getGamepads()).some(Boolean)) start();
  return () => { started = false; removeEventListener("gamepadconnected", onConnect); };
}
