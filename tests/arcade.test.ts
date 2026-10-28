import { describe, expect, it } from "vitest";
import { arcadeIntro } from "@/data/arcade";

describe("arcade intro", () => {
  it("frames the arcade as a side project in both locales", () => {
    for (const l of ["en", "es"] as const) {
      expect(arcadeIntro.title[l].length).toBeGreaterThan(2);
      expect(arcadeIntro.body[l].length).toBeGreaterThan(80);
      expect(arcadeIntro.body[l]).not.toMatch(/[぀-ヿ㐀-鿿豈-﫿]/);
    }
    expect(arcadeIntro.body.en).toMatch(/inspired by/);
    expect(arcadeIntro.body.en).toMatch(/React and TypeScript/);
    expect(arcadeIntro.body.es).toMatch(/inspirado en/);
    expect(arcadeIntro.body.es).toMatch(/React y TypeScript/);
    expect(arcadeIntro.body.en).toMatch(/because I wanted to give the page some interactivity that reflects my style and my tastes\.$/);
    expect(arcadeIntro.body.es).toMatch(/porque quise darle a la página algo de interactividad que refleje mi estilo y mis gustos\.$/);
  });
});
