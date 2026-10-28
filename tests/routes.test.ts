import { describe, expect, it } from "vitest";
import { cvPath, directPath, gamePath, homePath, projectPath } from "@/i18n/ui";
import { allPages, alternatesFor, parsePath } from "@/lib/routes";
import { places } from "@/data/places";
import { projects } from "@/data/projects";
import { games } from "@/data/games";

// Per locale: the map, every place, the direct view, every project and every game.
const pagesPerLocale = 1 + places.length + 1 + projects.length + games.length;

describe("i18n route helpers", () => {
  it("keeps the public URLs of the Astro site", () => {
    expect(homePath("en")).toBe("/");
    expect(homePath("es")).toBe("/es/");
    expect(projectPath("en", "ikai")).toBe("/projects/ikai/");
    expect(projectPath("es", "ikai")).toBe("/es/proyectos/ikai/");
    expect(cvPath("es")).toMatch(/^\/cv\/.*ES\.pdf$/);
  });

  it("parses a path into locale, kind and slug", () => {
    expect(parsePath("/es/")).toEqual({ locale: "es", kind: "home" });
    expect(parsePath("/es/proyectos/tcg-store/")).toEqual({ locale: "es", kind: "project", slug: "tcg-store" });
    expect(parsePath("/projects/tcg-store/")).toEqual({ locale: "en", kind: "project", slug: "tcg-store" });
  });

  it("links each page to its translation", () => {
    expect(alternatesFor("/es/proyectos/ikai/")).toEqual({ en: "/projects/ikai/", es: "/es/proyectos/ikai/" });
    expect(alternatesFor("/")).toEqual({ en: "/", es: "/es/" });
    expect(allPages()).toHaveLength(2 * pagesPerLocale);
  });

  it("parses every new route in both locales", () => {
    expect(parsePath("/about/")).toEqual({ locale: "en", kind: "place", id: "about" });
    expect(parsePath("/es/sobre-mi/")).toEqual({ locale: "es", kind: "place", id: "about" });
    expect(parsePath("/projects/")).toEqual({ locale: "en", kind: "place", id: "projects" });
    expect(parsePath("/es/proyectos/")).toEqual({ locale: "es", kind: "place", id: "projects" });
    expect(parsePath("/es/contacto/")).toEqual({ locale: "es", kind: "place", id: "contact" });
    expect(parsePath("/arcade/")).toEqual({ locale: "en", kind: "place", id: "arcade" });
    expect(parsePath("/es/arcade/ikai/")).toEqual({ locale: "es", kind: "game", id: "ikai" });
    expect(parsePath("/arcade/zen/")).toEqual({ locale: "en", kind: "game", id: "zen" });
    expect(parsePath("/direct/")).toEqual({ locale: "en", kind: "direct" });
    expect(parsePath("/es/directo/")).toEqual({ locale: "es", kind: "direct" });
  });

  it("pairs the same place across locales (alternates are reciprocal)", () => {
    expect(alternatesFor("/about/")).toEqual({ en: "/about/", es: "/es/sobre-mi/" });
    expect(alternatesFor("/es/sobre-mi/")).toEqual({ en: "/about/", es: "/es/sobre-mi/" });
    expect(alternatesFor("/es/proyectos/")).toEqual({ en: "/projects/", es: "/es/proyectos/" });
    expect(alternatesFor("/es/experiencia/")).toEqual({ en: "/experience/", es: "/es/experiencia/" });
    expect(alternatesFor("/stack/")).toEqual({ en: "/stack/", es: "/es/stack/" });
    expect(alternatesFor("/arcade/")).toEqual({ en: "/arcade/", es: "/es/arcade/" });
    expect(alternatesFor("/es/arcade/tcg/")).toEqual({ en: "/arcade/tcg/", es: "/es/arcade/tcg/" });
    expect(alternatesFor("/contact/")).toEqual({ en: "/contact/", es: "/es/contacto/" });
    expect(alternatesFor("/es/directo/")).toEqual({ en: "/direct/", es: "/es/directo/" });
    for (const path of allPages()) {
      const alt = alternatesFor(path);
      expect(alternatesFor(alt.en)).toEqual(alt);
      expect(alternatesFor(alt.es)).toEqual(alt);
      expect(allPages()).toContain(alt.en);
      expect(allPages()).toContain(alt.es);
    }
  });

  it("builds the direct and game paths", () => {
    expect(directPath("en")).toBe("/direct/");
    expect(directPath("es")).toBe("/es/directo/");
    expect(gamePath("en", "ikai")).toBe("/arcade/ikai/");
    expect(gamePath("es", "ikai")).toBe("/es/arcade/ikai/");
  });
});
