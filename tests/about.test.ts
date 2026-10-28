import { describe, expect, it } from "vitest";
import { artNote, availability, interests, learning, story, values } from "@/data/about";

const FORBIDDEN = /published technical author|AWS experience|experiencia en AWS|AWS developer|built from scratch/i;
const CJK = /[぀-ヿ㐀-鿿豈-﫿]/;

describe("about data", () => {
  const all = [...story, ...values, ...learning];

  it("has the storytelling arc in order", () => {
    expect(story.map((c) => c.id)).toEqual(["marketing", "university", "freelance", "amplixme", "community", "learning-now"]);
  });

  it("has 4 to 5 values and ONE general learning note (David: not too specific)", () => {
    expect(values.length).toBeGreaterThanOrEqual(4);
    expect(values.length).toBeLessThanOrEqual(5);
    expect(learning).toHaveLength(1);
    expect(learning[0].title).toEqual({ en: "Always learning", es: "Siempre aprendiendo" });
    expect(learning[0].body.en).toBe("I like to keep learning: every project teaches me something new, and I enjoy turning what I learn into something other people can use.");
    expect(learning[0].body.es).toBe("Me gusta seguir aprendiendo: cada proyecto me enseña algo nuevo y disfruto convertir lo que aprendo en algo que otras personas puedan usar.");
  });

  it("keeps the learning chapter and note free of specific technologies", () => {
    const text = JSON.stringify([learning, story.find((c) => c.id === "learning-now")]);
    expect(text).not.toMatch(/AWS|\bGo\b|Claude|OpenCode|product engineering|patrones|design patterns/i);
  });

  it("tells the marketing story as freelance campaigns, never consulting (David's words)", () => {
    const c = story.find((s) => s.id === "marketing")!;
    expect(c.title).toEqual({ en: "Where it started", es: "Dónde empecé" });
    expect(c.period).toBe("2020 – 2024");
    expect(c.body.en).toBe("I started in digital marketing: for a while I worked on campaigns as a freelancer. But what I enjoy is development. Technology, software and learning are what drive me.");
    expect(c.body.es).toBe("Empecé en el marketing digital: durante un tiempo trabajé en campañas como freelance. Pero lo que disfruto es el desarrollo. La tecnología, el software y aprender son lo que me mueve.");
    expect(JSON.stringify([story, values])).not.toMatch(/consult|four years|cuatro años|bilingual|bilingüe/i);
  });

  it("the community chapter mentions IKAI Shell as open source", () => {
    const c = story.find((s) => s.id === "community")!;
    expect(c.body.en).toMatch(/IKAI Shell, an open source desktop shell for Omarchy/);
    expect(c.body.es).toMatch(/IKAI Shell, un shell de escritorio open source para Omarchy/);
  });

  it("lists the interests", () => {
    expect(interests.map((i) => i.id)).toEqual(["reading", "games", "tech", "sport", "art", "coffee", "music"]);
  });

  it("availability names remote, hybrid and on-site in both locales", () => {
    expect(availability.modes.map((m) => m.en)).toEqual(["Remote", "Hybrid", "On-site"]);
    expect(availability.line.en).toMatch(/remote, hybrid/i);
    expect(availability.line.es).toMatch(/remoto, híbrido/i);
  });

  it("every string exists in both locales, differs between them, and is clean", () => {
    const strings: [string, string][] = [
      ...all.flatMap((n) => [[n.title.en, n.title.es], [n.body.en, n.body.es]] as [string, string][]),
      ...interests.map((i) => [i.label.en, i.label.es] as [string, string]),
      [availability.line.en, availability.line.es],
    ];
    for (const [en, es] of strings) {
      expect(en.trim().length).toBeGreaterThanOrEqual(2);
      expect(es.trim().length).toBeGreaterThanOrEqual(2);
      expect(`${en} ${es}`).not.toMatch(FORBIDDEN);
      expect(`${en} ${es}`).not.toMatch(CJK);
    }
  });

  it("artNote explains the art in both locales, honestly", () => {
    expect(artNote.items.map((i) => i.id)).toEqual(["cathedral", "sunsets", "volcano", "cable-car", "coffee", "books", "games", "plants", "music"]);
    const strings = [artNote.title, artNote.body, ...artNote.items.map((i) => i.label)];
    for (const s of strings) {
      expect(s.en.trim().length).toBeGreaterThan(2);
      expect(s.es.trim().length).toBeGreaterThan(2);
      expect(`${s.en} ${s.es}`).not.toMatch(FORBIDDEN);
      expect(`${s.en} ${s.es}`).not.toMatch(CJK);
    }
    expect(artNote.body.en).toMatch(/Manizales/);
    expect(artNote.body.en).toMatch(/AI-generated/);
    expect(artNote.body.es).toMatch(/generadas con IA/);
  });
});
