/** Pure rules of the IKAI cartridge: three pixel-art rooms, three small puzzles, one door. Goal: escape the three rooms. */
export type RoomId = 1 | 2 | 3;
export type Pos = { x: number; y: number };
export type SealId = "seal-a" | "seal-b" | "seal-c";
export type HotspotKind = "inspect" | "radio" | "seal" | "exit" | "door";
export type Hotspot = Pos & { id: string; kind: HotspotKind };

export const ROOMS: readonly RoomId[] = [1, 2, 3];

/** Room 1: the radio. A station hides at `target`; within `tolerance` the static clears and a voice reads the door code. */
export const RADIO = { min: 0, max: 100, target: 64, tolerance: 3 } as const;
/** The code the radio reads out and the room 3 door accepts. */
export const CODE = "417";

/** Room 2: the seals show 1, 2 or 3 spiral turns. The poster in room 1 says the spiral winds inward: fewest turns first. */
export const SEAL_TURNS: Record<SealId, number> = { "seal-a": 3, "seal-b": 1, "seal-c": 2 };
export const SEAL_ORDER: readonly SealId[] = (Object.keys(SEAL_TURNS) as SealId[]).sort((a, b) => SEAL_TURNS[a] - SEAL_TURNS[b]);

/** Hotspot positions are percentages of each room picture. */
export const HOTSPOTS: Record<RoomId, readonly Hotspot[]> = {
  1: [
    { id: "poster", kind: "inspect", x: 18, y: 25 },
    { id: "radio", kind: "radio", x: 23, y: 47 },
    { id: "bed", kind: "inspect", x: 66, y: 41 },
    { id: "exit", kind: "exit", x: 85, y: 34 },
  ],
  2: [
    { id: "seal-a", kind: "seal", x: 9, y: 38 },
    { id: "seal-b", kind: "seal", x: 62, y: 35 },
    { id: "seal-c", kind: "seal", x: 83, y: 55 },
    { id: "grate", kind: "inspect", x: 71, y: 68 },
    { id: "exit", kind: "exit", x: 80, y: 30 },
  ],
  3: [
    { id: "target", kind: "inspect", x: 22, y: 42 },
    { id: "door", kind: "door", x: 48, y: 38 },
    { id: "stairs", kind: "inspect", x: 82, y: 42 },
    { id: "rail", kind: "inspect", x: 30, y: 72 },
  ],
};

/** The detective layer: nine clues, each written into the notebook once, in the room where it is found. */
export const CASE_NO = CODE;
export const CLUES: readonly { id: string; room: RoomId }[] = [
  { id: "poster", room: 1 }, { id: "bed", room: 1 }, { id: "radio", room: 1 },
  { id: "grate", room: 2 }, { id: "seal", room: 2 },
  { id: "target", room: 3 }, { id: "rail", room: 3 }, { id: "stairs", room: 3 }, { id: "door", room: 3 },
];

export type Game = { room: RoomId | "end"; radio: boolean; seals: boolean; pressed: SealId[]; notes: string[] };
export const newGame = (): Game => ({ room: 1, radio: false, seals: false, pressed: [], notes: [] });

/** Writes a clue into the notebook. Only a clue of the current room, and only once; anything else returns the same game. */
export function addClue(g: Game, id: string): Game {
  if (g.room === "end" || g.notes.includes(id)) return g;
  const c = CLUES.find((x) => x.id === id);
  return c && c.room === g.room ? { ...g, notes: [...g.notes, id] } : g;
}

/** The case is closed once the last door opens, which needs all three rooms solved. */
export const caseClosed = (g: Game): boolean => g.room === "end";

/** 0 at the start, up to 1 at the end: rooms count most, clues add a little. Drives the ink tendrils. */
export function dread(g: Game): number {
  if (g.room === "end") return 1;
  return clamp(((g.room - 1) + g.notes.length / CLUES.length * 0.9) / 3, 0, 0.95);
}

/** Where the pupil of the eye in room 3 sits, as a unit offset (length at most 1) pointing from the eye toward the light. */
export function eyeLook(eye: Pos, light: Pos): Pos {
  const dx = light.x - eye.x, dy = light.y - eye.y, d = Math.hypot(dx, dy);
  if (d < 0.0001) return { x: 0, y: 0 };
  const k = Math.min(1, d / 30) / d;
  return { x: dx * k, y: dy * k };
}

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

/** 0 on the station, up to 1 far from it. Drives how loud the static is. */
export function radioStatic(freq: number): number {
  return clamp((Math.abs(freq - RADIO.target) - RADIO.tolerance) / 30, 0, 1);
}

/** Tunes the radio. Only room 1 listens; only a frequency within tolerance solves it. */
export function tuneRadio(g: Game, freq: number): Game {
  if (g.room !== 1 || g.radio) return g;
  return Math.abs(freq - RADIO.target) <= RADIO.tolerance ? addClue({ ...g, radio: true }, "radio") : g;
}

export type SealResult = "ignored" | "placed" | "wrong" | "solved";

/** Presses a seal. The three presses must follow SEAL_ORDER; a wrong press clears the sequence. */
export function pressSeal(g: Game, id: SealId): { game: Game; result: SealResult } {
  if (g.room !== 2 || g.seals || g.pressed.includes(id)) return { game: g, result: "ignored" };
  if (SEAL_ORDER[g.pressed.length] !== id) return { game: { ...g, pressed: [] }, result: "wrong" };
  const pressed = [...g.pressed, id];
  return pressed.length === SEAL_ORDER.length
    ? { game: addClue({ ...g, pressed, seals: true }, "seal"), result: "solved" }
    : { game: { ...g, pressed }, result: "placed" };
}

export const canLeave = (g: Game): boolean => (g.room === 1 && g.radio) || (g.room === 2 && g.seals);

/** Walks through the exit of the current room once its puzzle is solved. */
export function leave(g: Game): Game {
  return canLeave(g) ? { ...g, room: (g.room as number) + 1 as RoomId } : g;
}

/** Room 3 door. Only the exact code, entered in room 3, ends the game. */
export function submitCode(g: Game, code: string): { game: Game; ok: boolean } {
  if (g.room !== 3 || code !== CODE) return { game: g, ok: false };
  return { game: { ...g, room: "end" }, ok: true };
}

export const isEnding = (g: Game): boolean => g.room === "end";

/** Room progress for the header: 1, 2 or 3 (3 stays at 3 once escaped, see isEnding). */
export const roomNumber = (g: Game): RoomId => (g.room === "end" ? 3 : g.room);

/** Index of the next hotspot in a direction (wraps). */
export const cycle = (room: RoomId, i: number, dir: 1 | -1): number => (i + dir + HOTSPOTS[room].length) % HOTSPOTS[room].length;

/** 1 on top of the nearest unsolved clue, 0 beyond 40% of the picture or when nothing is left to find in the room. */
export function proximity(p: Pos, g: Game): number {
  if (g.room === "end") return 0;
  const live = HOTSPOTS[g.room].filter((h) =>
    (h.kind === "radio" && !g.radio) || (h.kind === "seal" && !g.seals && !g.pressed.includes(h.id as SealId)) || (h.kind === "door"));
  let best = Infinity;
  for (const h of live) best = Math.min(best, Math.hypot(h.x - p.x, h.y - p.y));
  return Number.isFinite(best) ? clamp(1 - best / 40, 0, 1) : 0;
}
