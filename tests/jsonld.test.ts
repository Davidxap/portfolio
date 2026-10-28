import { describe, expect, it } from "vitest";
import { buildJsonLd } from "@/lib/jsonld";
import { person } from "@/data/site";

const SITE = "https://example.test";

describe("JSON-LD builder", () => {
  it("home: ProfilePage whose Person has a stable @id and the legal name as alternateName", () => {
    const ld = buildJsonLd({ locale: "en", path: "/", title: "T", description: "D", site: SITE })!;
    const graph = ld["@graph"] as Record<string, any>[];
    expect(graph.map((n) => n["@type"])).toEqual(["ProfilePage", "WebSite"]);
    const p = graph[0].mainEntity;
    expect(p["@type"]).toBe("Person");
    expect(p["@id"]).toBe(`${SITE}/#person`);
    expect(p.alternateName).toContain(person.legalName);
    expect(p.alternateName).toContain(person.shortName);
    expect(graph[1].publisher).toEqual({ "@id": `${SITE}/#person` });
  });

  it("project: LearningResource for the learning site, SoftwareSourceCode for repos, CreativeWork for the demo, plus breadcrumbs", () => {
    const type = (path: string) => {
      const ld = buildJsonLd({ locale: "es", path, title: "T", description: "D", site: SITE })!;
      const graph = ld["@graph"] as Record<string, any>[];
      expect(graph[0]["@id"]).toBe(`${SITE}/#person`);
      expect(graph[0].alternateName).toContain(person.legalName);
      expect(graph.at(-1)!["@type"]).toBe("BreadcrumbList");
      return graph[1]["@type"];
    };
    expect(type("/es/proyectos/javascript-para-subir-de-nivel/")).toBe("LearningResource");
    expect(type("/es/proyectos/ikai/")).toBe("SoftwareSourceCode");
    expect(type("/es/proyectos/tcg-store/")).toBe("CreativeWork");
  });
});
