/** Pure rules of the Forecast toy: read a (sample) forecast, pack the one thing that fits. Goal: pack right for 5 forecasts. */
export type Condition = "rain" | "sun" | "cloud";
export type Item = "umbrella" | "sunglasses" | "jacket" | "coffee";
export type Forecast = { city: string; country: string; condition: Condition; tempC: number };

export const ITEMS: readonly Item[] = ["umbrella", "sunglasses", "jacket", "coffee"];
export const ROUNDS = 5;
/** At or below this the jacket wins over sun and clouds (rain still wins over everything). */
export const COLD_C = 12;

/** Bundled sample forecasts, typical of each city. They are not live data. */
export const CITIES: readonly Forecast[] = [
  { city: "Manizales", country: "Colombia", condition: "rain", tempC: 16 },
  { city: "Bogotá", country: "Colombia", condition: "cloud", tempC: 11 },
  { city: "Medellín", country: "Colombia", condition: "sun", tempC: 25 },
  { city: "Cartagena", country: "Colombia", condition: "sun", tempC: 32 },
  { city: "Tokyo", country: "Japan", condition: "cloud", tempC: 18 },
  { city: "Lisbon", country: "Portugal", condition: "rain", tempC: 15 },
  { city: "Oslo", country: "Norway", condition: "cloud", tempC: 3 },
  { city: "Cairo", country: "Egypt", condition: "sun", tempC: 36 },
  { city: "Lima", country: "Peru", condition: "cloud", tempC: 19 },
  { city: "Seoul", country: "South Korea", condition: "rain", tempC: 9 },
];

/** Rain first, then cold, then sun, otherwise a coffee for a mild grey day. */
export function bestItem(f: Forecast): Item {
  if (f.condition === "rain") return "umbrella";
  if (f.tempC <= COLD_C) return "jacket";
  if (f.condition === "sun") return "sunglasses";
  return "coffee";
}

export type Run = { order: number[]; index: number; answers: (Item | null)[] };

function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A new run: 5 different cities in a seeded random order. */
export function newRun(seed: number): Run {
  const r = rng(seed);
  const idx = CITIES.map((_, i) => i);
  for (let i = idx.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [idx[i], idx[j]] = [idx[j], idx[i]]; }
  return { order: idx.slice(0, ROUNDS), index: 0, answers: [] };
}

export const isDone = (r: Run): boolean => r.index >= ROUNDS;
export const current = (r: Run): Forecast | undefined => (isDone(r) ? undefined : CITIES[r.order[r.index]]);

/** Packs one item for the current forecast and moves on. After the last round it changes nothing. */
export function pack(r: Run, item: Item): { run: Run; correct: boolean } {
  const f = current(r);
  if (!f) return { run: r, correct: false };
  return { run: { ...r, index: r.index + 1, answers: [...r.answers, item] }, correct: item === bestItem(f) };
}

export const score = (r: Run): number => r.answers.filter((a, i) => a === bestItem(CITIES[r.order[i]])).length;
