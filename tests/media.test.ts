import { existsSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { previews } from "@/data/media";

const root = join(process.cwd(), "public");
const MAX = 120 * 1024;

describe("project media", () => {
  for (const [slug, shots] of Object.entries(previews)) {
    it(`${slug}: every shot has AVIF + WebP within budget and EN/ES alt text`, () => {
      expect(shots.length).toBeGreaterThan(0);
      for (const s of shots) {
        const avif = join(root, s.src);
        const webp = avif.replace(/\.avif$/, ".webp");
        expect(existsSync(avif), avif).toBe(true);
        expect(existsSync(webp), webp).toBe(true);
        expect(statSync(avif).size, avif).toBeLessThanOrEqual(MAX);
        expect(statSync(webp).size, webp).toBeLessThanOrEqual(MAX);
        expect(s.alt.en.length).toBeGreaterThan(20);
        expect(s.alt.es.length).toBeGreaterThan(20);
        expect(s.alt.en).not.toBe(s.alt.es);
      }
    });
  }
});
