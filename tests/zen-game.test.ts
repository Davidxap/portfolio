import { describe, expect, it } from "vitest";
import { PALETTES, ZEN_GOAL, cyclePalette, isComplete, isMatch, newRound, nextRound } from "@/lib/games/zen";

describe("zen palette puzzle", () => {
  it("has at least four distinct palettes with readable names", () => {
    expect(PALETTES.length).toBeGreaterThanOrEqual(4);
    expect(new Set(PALETTES.map((p) => p.id)).size).toBe(PALETTES.length);
    expect(new Set(PALETTES.map((p) => p.bg)).size).toBe(PALETTES.length);
  });

  it("cycles forward and backward with wrap-around", () => {
    const n = PALETTES.length;
    expect(cyclePalette(0, 1)).toBe(1);
    expect(cyclePalette(n - 1, 1)).toBe(0);
    expect(cyclePalette(0, -1)).toBe(n - 1);
  });

  it("a round never starts already matched", () => {
    for (let seed = 0; seed < 50; seed++) {
      const r = newRound(seed);
      expect(isMatch(r)).toBe(false);
      expect(r.target).toBeGreaterThanOrEqual(0);
      expect(r.target).toBeLessThan(PALETTES.length);
    }
  });

  it("is deterministic per seed", () => {
    expect(newRound(7)).toEqual(newRound(7));
  });

  it("matches exactly when the desktop shows the target palette", () => {
    const r = newRound(3);
    expect(isMatch({ ...r, current: r.target })).toBe(true);
    expect(isMatch({ ...r, current: (r.target + 1) % PALETTES.length })).toBe(false);
  });

  it("the next round picks a different target and counts solved rounds", () => {
    const r = newRound(1);
    const n = nextRound({ ...r, current: r.target, solved: 0 }, 2);
    expect(n.solved).toBe(1);
    expect(n.target).not.toBe(r.target);
    expect(isMatch(n)).toBe(false);
  });

  it("completes after 5 matches in a row and then stays put", () => {
    expect(ZEN_GOAL).toBe(5);
    let r = newRound(11);
    for (let i = 0; i < ZEN_GOAL; i++) {
      expect(isComplete(r)).toBe(false);
      expect(nextRound(r, i + 20)).toEqual(r);
      r = nextRound({ ...r, current: r.target }, i + 20);
    }
    expect(r.solved).toBe(ZEN_GOAL);
    expect(isComplete(r)).toBe(true);
    expect(nextRound(r, 99)).toEqual(r);
  });
});
