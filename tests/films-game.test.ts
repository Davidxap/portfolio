import { describe, expect, it } from "vitest";
import { FILMS, ORDER_GOAL, correctOrder, isSorted, move, newRound, reveal, score } from "@/lib/games/films";

describe("film data", () => {
  it("has about a dozen films with unique titles and unique release years in range", () => {
    expect(FILMS.length).toBeGreaterThanOrEqual(12);
    expect(new Set(FILMS.map((f) => f.title)).size).toBe(FILMS.length);
    expect(new Set(FILMS.map((f) => f.id)).size).toBe(FILMS.length);
    expect(new Set(FILMS.map((f) => f.year)).size).toBe(FILMS.length);
    for (const f of FILMS) {
      expect(f.year).toBeGreaterThanOrEqual(1984);
      expect(f.year).toBeLessThanOrEqual(2025);
      expect(f.director.length).toBeGreaterThan(3);
    }
  });

  it("spot-checks well-known release years", () => {
    const y = (t: string) => FILMS.find((f) => f.title === t)?.year;
    expect(y("Spirited Away")).toBe(2001);
    expect(y("My Neighbor Totoro")).toBe(1988);
    expect(y("Princess Mononoke")).toBe(1997);
    expect(y("Howl's Moving Castle")).toBe(2004);
    expect(y("Castle in the Sky")).toBe(1986);
  });

  it("uses no CJK characters", () => {
    expect(JSON.stringify(FILMS)).not.toMatch(/[぀-ヿ一-鿿]/);
  });
});

describe("a round", () => {
  it("picks 5 different films and never starts already in order", () => {
    for (let seed = 0; seed < 40; seed++) {
      const r = newRound(seed);
      expect(r.order.length).toBe(ORDER_GOAL);
      expect(new Set(r.order).size).toBe(ORDER_GOAL);
      expect(isSorted(r)).toBe(false);
      expect(r.revealed).toBe(false);
    }
  });

  it("moves a card up or down and clamps at the ends", () => {
    const r = newRound(1);
    const m = move(r, 0, 1);
    expect(m.order[1]).toBe(r.order[0]);
    expect(m.order[0]).toBe(r.order[1]);
    expect(move(r, 0, -1)).toEqual(r);
    expect(move(r, ORDER_GOAL - 1, 1)).toEqual(r);
  });

  it("does not move after the reveal", () => {
    const r = reveal(newRound(2));
    expect(move(r, 0, 1)).toEqual(r);
  });

  it("scores cards in the right place and detects the perfect order", () => {
    const r = newRound(5);
    const sorted = correctOrder(r);
    expect(sorted).toEqual([...r.order].sort((a, b) => FILMS.find((f) => f.id === a)!.year - FILMS.find((f) => f.id === b)!.year));
    const perfect = { ...r, order: sorted };
    expect(score(perfect)).toBe(ORDER_GOAL);
    expect(isSorted(perfect)).toBe(true);
    const swapped = move(perfect, 0, 1);
    expect(score(swapped)).toBe(ORDER_GOAL - 2);
    expect(isSorted(swapped)).toBe(false);
  });

  it("reveal flips the flag once and keeps the order", () => {
    const r = newRound(7);
    const v = reveal(r);
    expect(v.revealed).toBe(true);
    expect(v.order).toEqual(r.order);
    expect(reveal(v)).toEqual(v);
  });
});
