import { describe, expect, it } from "vitest";
import { projects } from "@/data/projects";
import { previews } from "@/data/media";

const FORBIDDEN = /published technical author|AWS experience|experiencia en AWS|AWS developer|built from scratch|escrito desde cero/i;

describe("projects data", () => {
  it("has unique slugs", () => {
    const slugs = projects.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("covers the verified set, including the new entries", () => {
    const slugs = projects.map((p) => p.slug);
    for (const s of ["amplixme-fs-0009", "obsidian-backend-template", "skorify-frontend", "fitness-tracker", "linux-win-setup"]) {
      expect(slugs, s).toContain(s);
    }
    expect(projects.length).toBeGreaterThanOrEqual(9);
  });

  for (const p of projects) {
    it(`${p.slug}: has colour, category, role, period and both locales`, () => {
      expect(p.color).toMatch(/^#[0-9a-f]{6}$/i);
      expect(["full-stack", "tools", "learning"]).toContain(p.category);
      expect(p.period.length).toBeGreaterThan(3);
      for (const f of [p.tagline, p.status, p.summary, p.built, p.learned, p.role]) {
        expect(f.en.length, `${p.slug} en`).toBeGreaterThan(3);
        expect(f.es.length, `${p.slug} es`).toBeGreaterThan(3);
      }
      expect(p.stack.length).toBeGreaterThan(0);
    });

    it(`${p.slug}: has at least one real capture (v2 rule: every project has a preview)`, () => {
      expect(previews[p.slug]?.length ?? 0, p.slug).toBeGreaterThan(0);
    });

    it(`${p.slug}: no forbidden claims, no CJK`, () => {
      const text = JSON.stringify(p);
      expect(text).not.toMatch(FORBIDDEN);
      expect(text).not.toMatch(/[぀-ヿ㐀-鿿豈-﫿]/);
    });
  }

  it("featured projects have a repo or demo link", () => {
    const featured = projects.filter((p) => p.featured);
    expect(featured.map((p) => p.slug)).toEqual(
      expect.arrayContaining(["tcg-store", "amplixme-fs-0009", "ikai", "omarchy-zen", "javascript-para-subir-de-nivel"]),
    );
    for (const p of featured) expect(p.links.some((l) => l.kind === "repo" || l.kind === "demo" || l.kind === "read"), p.slug).toBe(true);
    expect(featured.length).toBeLessThan(projects.length);
  });

  it("AmplixMe is a finished team project and never mentions a deadline", () => {
    const a = projects.find((p) => p.slug === "amplixme-fs-0009")!;
    const text = JSON.stringify(a);
    expect(text).toMatch(/7 contributors/);
    expect(text).not.toMatch(/deadline|plazo|fecha l[ií]mite|\blate\b|tarde/i);
  });

  it("IKAI keeps the Shibumi-Shell fork credit and omarchy-zen its zen-auto-style origin", () => {
    expect(JSON.stringify(projects.find((p) => p.slug === "ikai"))).toMatch(/Shibumi-Shell/);
    expect(JSON.stringify(projects.find((p) => p.slug === "omarchy-zen"))).toMatch(/zen-auto-style/);
  });

  it("the IKAI project is named IKAI Shell, keeps the ikai slug and says MIT open source", () => {
    const p = projects.find((x) => x.slug === "ikai")!;
    expect(p.name).toBe("IKAI Shell");
    expect(JSON.stringify(p)).toMatch(/open source \(MIT\)/i);
  });

  it("Go is a backend skill, not something being learned; Django has no 'basics'", async () => {
    const { stack, stackLearning } = await import("@/data/site");
    expect(stack.backend).toContain("Go");
    expect(stack.backend).toContain("Django");
    expect(JSON.stringify(stack)).not.toMatch(/basics/i);
    expect(JSON.stringify(stackLearning)).not.toMatch(/\bGo\b/);
    expect(stackLearning).toHaveLength(2);
  });

  it("university and team projects carry their context", () => {
    const by = (slug: string) => projects.find((p) => p.slug === slug)!;
    for (const slug of ["fitness-tracker", "weather-app", "ghibli-explorer"]) {
      const c = by(slug).context;
      expect(c?.en, slug).toMatch(/Universidad de Caldas/);
      expect(c?.es, slug).toMatch(/Universidad de Caldas/);
    }
    const team = by("amplixme-fs-0009").context!;
    expect(team.en).toMatch(/tickets, branches, reviews/);
    expect(team.es).toMatch(/tickets, ramas, revisiones/);
    expect(JSON.stringify(team)).not.toMatch(/deadline|plazo|late|tarde/i);
  });

  it("the weather app and Ghibli explorer are non-featured learning entries with honest offline previews", () => {
    for (const [slug, repo] of [["weather-app", "Davidxap/weather-app-react"], ["ghibli-explorer", "Davidxap/studio-ghilbli-api"]]) {
      const p = projects.find((x) => x.slug === slug)!;
      expect(p.featured).toBe(false);
      expect(p.category).toBe("learning");
      expect(p.links.some((l) => l.kind === "repo" && l.url.endsWith(repo))).toBe(true);
      expect(p.links.some((l) => l.kind === "demo")).toBe(false);
      for (const shot of previews[slug]) expect(shot.alt.en).toMatch(/live demo is offline/i);
    }
  });
});
