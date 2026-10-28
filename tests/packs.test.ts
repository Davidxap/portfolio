import { describe, expect, it } from "vitest";
import { PACK_CARDS, PACK_SIZE, RARITY_ORDER, TOTAL_CARDS, collect, mulberry32, openPack, rarityOf } from "@/lib/games/packs";

const FORBIDDEN = ["mana", "planeswalker", "magic", "pokemon", "pokémon", "yugioh", "yu-gi-oh", "gathering", "pikachu", "charizard", "hearthstone", "wizards", "nintendo", "konami", "hasbro", "duel", "trainer"];
const byId = new Map(PACK_CARDS.map((c) => [c.id, c]));

describe("card list", () => {
  it("has 18 original creatures, unique ids, both languages, no CJK", () => {
    expect(PACK_CARDS).toHaveLength(18);
    expect(TOTAL_CARDS).toBe(18);
    expect(new Set(PACK_CARDS.map((c) => c.id)).size).toBe(18);
    for (const c of PACK_CARDS) { expect(c.name.en.length).toBeGreaterThan(3); expect(c.name.es.length).toBeGreaterThan(3); expect(c.id).toMatch(/^[a-z0-9-]+$/); }
    expect(JSON.stringify(PACK_CARDS)).not.toMatch(/[぀-ヿ㐀-鿿]/);
  });
  it("uses no word from real card games", () => {
    const text = JSON.stringify(PACK_CARDS).toLowerCase();
    for (const w of FORBIDDEN) expect(text, w).not.toContain(w);
  });
  it("the six painted creatures are the rare ones; the other twelve are drawn", () => {
    const rare = PACK_CARDS.filter((c) => rarityOf(c.id) === "rare").map((c) => c.id).sort();
    expect(rare).toEqual(["ember-fox", "lantern-spirit", "moss-wyrm", "stone-sentinel", "storm-owl", "tide-colossus"]);
    expect(PACK_CARDS.filter((c) => c.painted).map((c) => c.id).sort()).toEqual(rare);
    for (const c of PACK_CARDS) expect(RARITY_ORDER).toContain(rarityOf(c.id));
  });
});

describe("opening a pack", () => {
  it("gives exactly 5 known cards", () => {
    expect(PACK_SIZE).toBe(5);
    for (let s = 1; s <= 200; s++) {
      const p = openPack(mulberry32(s));
      expect(p).toHaveLength(5);
      for (const id of p) expect(byId.has(id), id).toBe(true);
    }
  });
  it("is deterministic per seed and varies between seeds", () => {
    expect(openPack(mulberry32(7))).toEqual(openPack(mulberry32(7)));
    expect(new Set(Array.from({ length: 20 }, (_, s) => openPack(mulberry32(s + 1)).join())).size).toBeGreaterThan(15);
  });
  it("keeps rarity bounds: a rare is rarer than a common, and every pack has at least one uncommon or better", () => {
    const counts = { common: 0, uncommon: 0, rare: 0 };
    for (let s = 1; s <= 2000; s++) {
      const p = openPack(mulberry32(s));
      expect(p.some((id) => rarityOf(id) !== "common"), `seed ${s}`).toBe(true);
      for (const id of p) counts[rarityOf(id)]++;
    }
    expect(counts.common).toBeGreaterThan(counts.uncommon);
    expect(counts.uncommon).toBeGreaterThan(counts.rare);
    expect(counts.rare).toBeGreaterThan(0);
  });
  it("can eventually find every card", () => {
    const seen = new Set<string>();
    for (let s = 1; s <= 400; s++) openPack(mulberry32(s)).forEach((id) => seen.add(id));
    expect(seen.size).toBe(TOTAL_CARDS);
  });
});

describe("collection", () => {
  it("counts each card once, keeps the discovery order and leaves the input untouched", () => {
    const start: string[] = [];
    const a = collect(start, ["ember-fox", "paper-crane", "ember-fox"]);
    expect(a).toEqual(["ember-fox", "paper-crane"]);
    expect(start).toEqual([]);
    expect(collect(a, ["paper-crane", "glass-stag"])).toEqual(["ember-fox", "paper-crane", "glass-stag"]);
  });
  it("ignores ids that are not cards", () => {
    expect(collect([], ["nope", "storm-owl"])).toEqual(["storm-owl"]);
  });
});
