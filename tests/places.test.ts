import { describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { places, placeById, nextPlace } from "@/data/places";
import { allPages, parsePath } from "@/lib/routes";
import { withoutBase } from "@/lib/base";

describe("places registry", () => {
  it("has the six map places in map order with unique ids", () => {
    expect(places.map((p) => p.id)).toEqual(["about", "projects", "experience", "stack", "arcade", "contact"]);
    expect(new Set(places.map((p) => p.id)).size).toBe(places.length);
  });

  it("has a path, label, teaser and description in both locales, unique paths, and a real pixel icon", () => {
    const paths = new Set<string>();
    for (const p of places) {
      expect(existsSync(join(process.cwd(), "public/art/v3/icons", `${p.icon}-64.webp`))).toBe(true);
      for (const l of ["en", "es"] as const) {
        expect(p.path[l]).toMatch(/^\/(es\/)?[a-z-]+\/$/);
        expect(p.label[l].length).toBeGreaterThan(1);
        expect(p.teaser[l].length).toBeGreaterThan(10);
        expect(p.description[l].length).toBeGreaterThan(30);
        paths.add(p.path[l]);
      }
    }
    expect(paths.size).toBe(places.length * 2);
  });

  it("keeps every pin inside the image (0-100 %)", () => {
    for (const p of places) {
      expect(p.pin.x).toBeGreaterThan(0); expect(p.pin.x).toBeLessThan(100);
      expect(p.pin.y).toBeGreaterThan(0); expect(p.pin.y).toBeLessThan(100);
    }
  });

  it("puts every hotspot on its painted object of the 2027 map (1672x940) and keeps them apart", () => {
    const px = (id: Parameters<typeof placeById>[0]) => ({ x: (placeById(id).pin.x / 100) * 1672, y: (placeById(id).pin.y / 100) * 940 });
    // Stack on the bookshelf right of David (not the headset), About on David, Contact on the coffee cup, Arcade on the controller
    expect(px("stack").x).toBeGreaterThan(1480); expect(px("stack").y).toBeLessThan(300);
    expect(Math.hypot(px("stack").x - px("about").x, px("stack").y - px("about").y)).toBeGreaterThan(150);
    expect(Math.hypot(px("contact").x - 815, px("contact").y - 735)).toBeLessThan(40);
    expect(Math.hypot(px("arcade").x - 925, px("arcade").y - 758)).toBeLessThan(40);
    for (const a of places) for (const b of places) if (a.id < b.id) expect(Math.hypot(px(a.id).x - px(b.id).x, px(a.id).y - px(b.id).y), `${a.id}/${b.id}`).toBeGreaterThan(70);
  });

  it("every place resolves to a page route in both locales and is listed in allPages", () => {
    const pages = allPages();
    for (const p of places) for (const l of ["en", "es"] as const) {
      expect(pages).toContain(p.path[l]);
      expect(parsePath(p.path[l])).toEqual({ locale: l, kind: "place", id: p.id });
    }
  });

  it("has an app route file per place and locale", () => {
    for (const p of places) for (const l of ["en", "es"] as const) {
      const dir = l === "en" ? "src/app/(en)" : "src/app/(es)";
      expect(existsSync(join(process.cwd(), dir, p.path[l], "page.tsx")), `${p.id} ${l}`).toBe(true);
    }
  });

  it("looks places up and cycles to the next one", () => {
    expect(placeById("stack").id).toBe("stack");
    expect(nextPlace("about").id).toBe("projects");
    expect(nextPlace("contact").id).toBe("about");
  });
});

describe("wallpaper art", () => {
  it("points at the 2027 map files that exist (day and night grade, same framing, no upscaling)", async () => {
    const { STAGE_ART, STAGE_RATIO } = await import("@/lib/stage");
    const pub = (u: string) => join(process.cwd(), "public", withoutBase(u.split(" ")[0]));
    for (const u of [...STAGE_ART.avif, ...STAGE_ART.webp, STAGE_ART.fallback, ...STAGE_ART.night.avif, ...STAGE_ART.night.webp, STAGE_ART.night.fallback]) expect(existsSync(pub(u)), u).toBe(true);
    expect([STAGE_ART.night.width, STAGE_ART.night.height]).toEqual([STAGE_ART.width, STAGE_ART.height]);
    expect(STAGE_RATIO).toBeCloseTo(1672 / 940, 3);
    const { statSync } = await import("node:fs");
    expect(statSync(pub(STAGE_ART.avif[0])).size).toBeLessThanOrEqual(260_000);
  });
});
