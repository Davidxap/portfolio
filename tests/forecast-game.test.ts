import { describe, expect, it } from "vitest";
import { CITIES, ITEMS, ROUNDS, bestItem, current, isDone, newRun, pack, score } from "@/lib/games/forecast";

describe("forecast data", () => {
  it("has unique cities, plausible temperatures and every item is the answer somewhere", () => {
    expect(new Set(CITIES.map((c) => c.city)).size).toBe(CITIES.length);
    expect(CITIES.length).toBeGreaterThanOrEqual(8);
    for (const c of CITIES) { expect(c.tempC).toBeGreaterThan(-30); expect(c.tempC).toBeLessThan(50); }
    for (const i of ITEMS) expect(CITIES.some((c) => bestItem(c) === i), i).toBe(true);
    for (const n of ["Manizales", "Bogotá", "Medellín", "Cartagena", "Tokyo"]) expect(CITIES.some((c) => c.city === n), n).toBe(true);
  });
});

describe("packing rules", () => {
  const f = (condition: "rain" | "sun" | "cloud", tempC: number) => ({ city: "x", country: "x", condition, tempC });
  it("rain wins, then cold, then sun, then coffee", () => {
    expect(bestItem(f("rain", 5))).toBe("umbrella");
    expect(bestItem(f("rain", 25))).toBe("umbrella");
    expect(bestItem(f("cloud", 8))).toBe("jacket");
    expect(bestItem(f("sun", 8))).toBe("jacket");
    expect(bestItem(f("sun", 28))).toBe("sunglasses");
    expect(bestItem(f("cloud", 20))).toBe("coffee");
  });
});

describe("a run of 5 forecasts", () => {
  it("draws 5 different cities, never the same twice", () => {
    for (let seed = 0; seed < 30; seed++) {
      const r = newRun(seed);
      expect(r.order.length).toBe(ROUNDS);
      expect(new Set(r.order).size).toBe(ROUNDS);
    }
  });

  it("marks correct and incorrect picks and moves on", () => {
    let r = newRun(3);
    const right = bestItem(current(r)!);
    const wrong = ITEMS.find((i) => i !== right)!;
    const a = pack(r, wrong);
    expect(a.correct).toBe(false);
    expect(a.run.index).toBe(1);
    expect(score(a.run)).toBe(0);
    r = a.run;
    const b = pack(r, bestItem(current(r)!));
    expect(b.correct).toBe(true);
    expect(score(b.run)).toBe(1);
  });

  it("finishes after 5 picks, scores them and ignores further picks", () => {
    let r = newRun(9);
    expect(isDone(r)).toBe(false);
    for (let i = 0; i < ROUNDS; i++) r = pack(r, bestItem(current(r)!)).run;
    expect(isDone(r)).toBe(true);
    expect(score(r)).toBe(ROUNDS);
    expect(current(r)).toBeUndefined();
    const after = pack(r, "umbrella");
    expect(after.run).toEqual(r);
    expect(after.correct).toBe(false);
  });

  it("a run of all wrong picks scores 0", () => {
    let r = newRun(4);
    for (let i = 0; i < ROUNDS; i++) { const b = bestItem(current(r)!); r = pack(r, ITEMS.find((x) => x !== b)!).run; }
    expect(isDone(r)).toBe(true);
    expect(score(r)).toBe(0);
  });
});
