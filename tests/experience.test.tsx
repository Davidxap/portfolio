import { render } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { experience } from "@/data/experience";
import { projects } from "@/data/projects";
import { ExperiencePanel } from "@/components/places/ExperiencePanel";

const FORBIDDEN = /published technical author|AWS|built from scratch|desde cero|client(e)?s? (such as|like)|\d+\s*%/i;

describe("experience data", () => {
  it("has both locales for every field, newest first", () => {
    expect(experience.map((e) => e.id)).toEqual(["freelance", "marketing", "education"]);
    for (const e of experience) {
      for (const f of [e.period, e.title, e.where, e.summary, ...e.bullets, ...(e.matters ? [e.matters] : [])]) {
        expect(f.en.length).toBeGreaterThan(3);
        expect(f.es.length).toBeGreaterThan(3);
      }
    }
  });
  it("gives the freelance and marketing entries bullets, and the freelance one its stack", () => {
    expect(experience[0].bullets).toHaveLength(5);
    expect(experience[0].stack).toEqual(["Next.js", "React", "TypeScript", "FastAPI", "Python", "PostgreSQL", "Supabase", "Vercel", "Bash"]);
    expect(experience[1].bullets).toHaveLength(3);
  });
  it("related slugs exist in the projects", () => {
    const slugs = projects.map((p) => p.slug);
    expect(experience[0].related!.slugs).toEqual(["tcg-store", "ikai", "omarchy-zen"]);
    for (const s of experience.flatMap((e) => e.related?.slugs ?? [])) expect(slugs).toContain(s);
  });
  it("describes marketing as freelance campaigns and the related label as own projects", () => {
    expect(experience[1].title).toEqual({ en: "Freelance digital marketing campaigns", es: "Campañas de marketing digital (freelance)" });
    expect(experience[0].related!.label).toEqual({ en: "Own projects", es: "Proyectos propios" });
    expect(JSON.stringify(experience)).not.toMatch(/consult|four years|cuatro años|alongside|en paralelo/i);
  });
  it("has no forbidden phrases", () => {
    expect(JSON.stringify(experience)).not.toMatch(FORBIDDEN);
  });
});

describe("ExperiencePanel", () => {
  beforeEach(() => { vi.stubGlobal("matchMedia", (q: string) => ({ matches: true, media: q, addEventListener() {}, removeEventListener() {} })); });
  it.each(["en", "es"] as const)("renders bullets, chips and related projects (%s)", (locale) => {
    const { container } = render(<ExperiencePanel locale={locale} embedded />);
    const text = container.textContent!;
    for (const b of experience[0].bullets) expect(text).toContain(b[locale]);
    for (const b of experience[1].bullets) expect(text).toContain(b[locale]);
    expect(text).toContain(experience[1].matters![locale]);
    const chips = [...container.querySelectorAll(".gl-stack li")].map((n) => n.textContent);
    expect(chips).toEqual(experience[0].stack);
    expect(text).toContain(experience[0].related!.label[locale]);
    expect(container.querySelectorAll(".gl-related a")).toHaveLength(3);
    expect(text).toContain("AmplixMe");
  });
  it("no longer reads the thin road.* texts", () => {
    expect(readFileSync(`${process.cwd()}/src/components/places/ExperiencePanel.tsx`, "utf8")).not.toMatch(/road\./);
  });
});
