import { parsePath } from "@/lib/routes";

/** View-transition type for a navigation, chosen by where you come from and where you go (CSS in styles/world.css). */
export function transitionTypesFor(from: string, to: string): string[] {
  const a = parsePath(from).kind, b = parsePath(to).kind;
  if (b === "game") return ["to-game"];
  if (a === "game") return ["from-game"];
  if (b === "home") return ["to-map"];
  return ["to-place"];
}

/** Where the B button goes: one level up, or null on the map. */
export function parentPath(path: string): string | null {
  const info = parsePath(path);
  const es = info.locale === "es";
  switch (info.kind) {
    case "home": return null;
    case "project": return es ? "/es/proyectos/" : "/projects/";
    case "game": return es ? "/es/arcade/" : "/arcade/";
    default: return es ? "/es/" : "/";
  }
}

export type Dir = "up" | "down" | "left" | "right";
type Box = { x: number; y: number };

/** Index of the box to focus when moving from `from` in `dir`: the nearest one in that half-plane, else wraps by order. */
export function nearestInDirection(boxes: Box[], from: number, dir: Dir): number {
  if (boxes.length === 0) return -1;
  if (from < 0 || from >= boxes.length) return 0;
  const o = boxes[from];
  let best = -1, bestScore = Infinity;
  boxes.forEach((b, i) => {
    if (i === from) return;
    const dx = b.x - o.x, dy = b.y - o.y;
    const along = dir === "right" ? dx : dir === "left" ? -dx : dir === "down" ? dy : -dy;
    if (along <= 1) return;
    const across = dir === "left" || dir === "right" ? Math.abs(dy) : Math.abs(dx);
    const score = along + across * 2;
    if (score < bestScore) { bestScore = score; best = i; }
  });
  if (best >= 0) return best;
  const step = dir === "right" || dir === "down" ? 1 : -1;
  return (from + step + boxes.length) % boxes.length;
}
