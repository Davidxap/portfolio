import { describe, expect, it } from "vitest";
import { buildSitemap } from "@/lib/sitemap";
import { allPages } from "@/lib/routes";

describe("sitemap alternates", () => {
  const map = buildSitemap("https://example.test");
  it("lists every page with en, es and x-default alternates each", () => {
    expect(map).toHaveLength(allPages().length);
    for (const e of map) expect(Object.keys(e.alternates!.languages!).sort()).toEqual(["en", "es", "x-default"]);
    expect(map.reduce((n, e) => n + Object.keys(e.alternates!.languages!).length, 0)).toBe(allPages().length * 3);
  });
  it("lists every place, the direct view and every game in both locales", () => {
    const urls = map.map((e) => e.url);
    for (const p of ["/about/", "/es/sobre-mi/", "/projects/", "/es/proyectos/", "/experience/", "/es/experiencia/", "/stack/", "/es/stack/", "/arcade/", "/es/arcade/", "/contact/", "/es/contacto/", "/direct/", "/es/directo/", "/arcade/tcg/", "/es/arcade/zen/"]) {
      expect(urls).toContain(`https://example.test${p}`);
    }
    const about = map.find((e) => e.url === "https://example.test/es/sobre-mi/")!;
    expect(about.alternates!.languages!.en).toBe("https://example.test/about/");
  });
  it("x-default points at the English page", () => {
    const es = map.find((e) => e.url === "https://example.test/es/proyectos/ikai/")!;
    expect(es.alternates!.languages!["x-default"]).toBe("https://example.test/projects/ikai/");
    expect(es.alternates!.languages!.es).toBe("https://example.test/es/proyectos/ikai/");
  });
});
