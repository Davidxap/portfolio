import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { games, gameById } from "@/data/games";
import { parseWalkthrough } from "@/lib/walkthrough";

const dir = join(process.cwd(), "src/components/console/demos");

describe("games registry", () => {
  it("lists the seven demos with unique ids", () => {
    expect(games.map((g) => g.id)).toEqual(["tcg", "ikai", "book", "eventloop", "zen", "forecast", "films"]);
    expect(new Set(games.map((g) => g.id)).size).toBe(games.length);
    expect(gameById("ikai")?.style).toBe("pixel-horror");
    expect(gameById("nope")).toBeUndefined();
  });

  it("renames the trivia cartridge and gives the event loop its own explainer", () => {
    expect(gameById("book")?.title).toBe("JS Trivia");
    expect(gameById("book")?.blurb.en).toBe("Questions from my JavaScript book");
    expect(gameById("eventloop")?.title).toBe("Event Loop, step by step");
    expect(gameById("eventloop")?.style).toBe("glass");
      });

  it("has English and Spanish copy and a known visual style", () => {
    for (const g of games) {
      expect(["painterly", "pixel-horror", "glass", "retro"]).toContain(g.style);
      for (const l of ["en", "es"] as const) { expect(g.title.length).toBeGreaterThan(1); expect(g.blurb[l].length).toBeGreaterThan(8); }
    }
  });

  it("every source file exists and keeps a parsable walkthrough", () => {
    for (const g of games) {
      expect(existsSync(join(dir, g.source)), g.source).toBe(true);
      const w = parseWalkthrough(readFileSync(join(dir, g.source), "utf8").trim());
      expect(w.steps.length, g.source).toBeGreaterThan(0);
    }
  });

  it("every game says which project it came from, in both languages", () => {
    for (const g of games) {
      expect(g.origin, g.id).toBeDefined();
      expect(g.origin!.project.length, g.id).toBeGreaterThan(1);
      for (const l of ["en", "es"] as const) expect(g.origin!.note[l].length, `${g.id} ${l}`).toBeGreaterThan(10);
    }
    expect(gameById("forecast")?.origin?.note.en).toMatch(/weather app/);
    expect(gameById("films")?.origin?.note.en).toMatch(/Ghibli/);
  });

  it("loads lazily: load() is a function that has not run on import", () => {
    for (const g of games) expect(typeof g.load).toBe("function");
  });
});

describe("real controls and wording", () => {
  const literals = (src: string): string[] => [...src.matchAll(/"((?:[^"\\\n]|\\.)*)"|`((?:[^`\\]|\\.)*)`/g)].map((m) => m[1] ?? m[2] ?? "");
  const BUTTON = [/(^|[\s"'`(])[AB]\s·/, /(^|[\s"'`(])[AB]:/, /·\s[AB]\b/, /^[AB]\s+(next|play|siguiente|jugar|confirm|confirmar)/, /\b(with|or|press|con|pulsa|o) [AB]\b(?![\w'])/];
  const JUGAR = /\b(jugar|juega|play|plays|playing)\b/i;

  it("no UI string in a demo or in the registry mentions an A or B button", () => {
    for (const g of games) {
      const texts = [...literals(readFileSync(join(dir, g.source), "utf8")), g.title, g.blurb.en, g.blurb.es, g.origin!.note.en, g.origin!.note.es];
      for (const t of texts) for (const re of BUTTON) expect(t, `${g.id}: ${t}`).not.toMatch(re);
    }
  });

  it("registry copy says minigame, not play", () => {
    for (const g of games) { expect(g.blurb.en, g.id).not.toMatch(JUGAR); expect(g.blurb.es, g.id).not.toMatch(JUGAR); }
  });

  it("the replay buttons say Try again and Otra vez", () => {
    for (const g of games) {
      const src = readFileSync(join(dir, g.source), "utf8");
      expect(src, g.source).not.toMatch(/(play again|jugar otra vez|jugar de nuevo)/i);
    }
  });

  it("every game has an optional thumb path slot (empty for now)", () => {
    for (const g of games) expect(g.thumb === undefined || typeof g.thumb === "string", g.id).toBe(true);
  });

  it("the TCG cartridge is the simple card-pack opener", () => {
    expect(gameById("tcg")?.title).toBe("Card Packs");
    expect(gameById("tcg")?.source).toBe("PacksDemo.tsx");
    expect(gameById("tcg")?.origin?.project).toBe("tcg-store");
  });
});

describe("plain copy and natural Spanish", () => {
  const src = (g: string) => readFileSync(join(dir, g), "utf8");
  it("IKAI ends with one plain line and the honest line about the shell", () => {
    const t = src("IkaiDemo.tsx");
    expect(t).toContain("Case closed. You escaped the three rooms.");
    expect(t).toContain("Caso cerrado. Escapaste de los tres cuartos.");
    expect(t).toContain("a fork of Shibumi-Shell and mostly their code");
    for (const w of ["hums", "humming", "behind my eyes", "zumba", "detrás de mis ojos", "Do not trust"]) expect(t, w).not.toContain(w);
  });
  it("no demo uses the lotería calques (cantar for call) or the old words", () => {
    for (const g of games) expect(src(g.source), g.id).not.toMatch(/\b(cantar|cantad[ao]s?|cantor|lotería)\b/i);
  });
});

