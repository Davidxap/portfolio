/** Pure rules of the zen cartridge: match the target palette on the desktop. Goal: match 5 palettes in a row. */
export type ZenPalette = { id: string; bg: string; fg: string; ac: string; hue: [number, number, number] };

/** Palettes are plain data. `hue` is a CSS filter (hue-rotate deg, saturate %, brightness %) that tints the landscape. */
export const PALETTES: readonly ZenPalette[] = [
  { id: "lavender", bg: "#2b2347", fg: "#efe8ff", ac: "#c8a7ff", hue: [0, 100, 100] },
  { id: "moss", bg: "#16261e", fg: "#e4f0e0", ac: "#8fd0a2", hue: [-110, 90, 92] },
  { id: "ember", bg: "#2a1a14", fg: "#f6e6d8", ac: "#e59a62", hue: [150, 110, 100] },
  { id: "tide", bg: "#0f2430", fg: "#dff1f6", ac: "#6fc3d8", hue: [-60, 100, 96] },
  { id: "paper", bg: "#f1ebe0", fg: "#2d2a26", ac: "#b5552f", hue: [30, 40, 120] },
];

export const ZEN_GOAL = 5;

export type Round = { target: number; current: number; solved: number };

export const cyclePalette = (i: number, dir: 1 | -1): number => (i + dir + PALETTES.length) % PALETTES.length;
export const isMatch = (r: Round): boolean => r.current === r.target;
export const isComplete = (r: Round): boolean => r.solved >= ZEN_GOAL;

const pick = (seed: number, n: number) => Math.abs(Math.floor(seed * 2654435761)) % n;

/** A fresh round for a seed: the desktop never starts on the target. */
export function newRound(seed: number, solved = 0, avoid = -1): Round {
  let target = pick(seed + 1, PALETTES.length);
  if (target === avoid) target = (target + 1) % PALETTES.length;
  const current = (target + 1 + pick(seed + 7, PALETTES.length - 1)) % PALETTES.length;
  return { target, current, solved };
}

/** After a match, counts it and sets a different target. Returns the same round when it is not matched yet or the goal is done. */
export function nextRound(r: Round, seed: number): Round {
  if (!isMatch(r) || isComplete(r)) return r;
  const solved = r.solved + 1;
  return solved >= ZEN_GOAL ? { ...r, solved } : newRound(seed, solved, r.target);
}
