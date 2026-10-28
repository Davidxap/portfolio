import { readFileSync, existsSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { pageMetadata } from "@/lib/seo";
import { SITE_URL } from "@/lib/site";
import { withoutBase } from "@/lib/base";

const pub = (f: string) => `${process.cwd()}/public/${f}`;
const png = (f: string) => { const b = readFileSync(pub(f)); return { w: b.readUInt32BE(16), h: b.readUInt32BE(20), sig: b.subarray(1, 4).toString() }; };

describe("favicon and manifest", () => {
  const md = pageMetadata({ locale: "en", path: "/", title: "t", description: "d" });
  it("declares the svg, the 32 and 16 px pngs, the apple icon, the manifest and the app title", () => {
    const icons = md.icons as { icon: { url: string }[]; apple: { url: string; sizes: string }[] };
    expect(icons.icon.map((i) => withoutBase(i.url))).toEqual(["/favicon.ico?v=2", "/favicon.svg?v=2", "/favicon-32.png?v=2", "/favicon-16.png?v=2"]);
    expect({ ...icons.apple[0], url: withoutBase(icons.apple[0].url) }).toMatchObject({ url: "/apple-touch-icon.png?v=2", sizes: "180x180" });
    expect(withoutBase(String(md.manifest))).toBe("/site.webmanifest");
    expect(md.appleWebApp).toMatchObject({ title: "David A." });
  });
  it("has every icon file with the size its name promises", () => {
    for (const [f, n] of [["favicon-16.png", 16], ["favicon-32.png", 32], ["apple-touch-icon.png", 180], ["icon-192.png", 192], ["icon-512.png", 512], ["icon-512-maskable.png", 512]] as const) {
      expect(existsSync(pub(f)), f).toBe(true);
      expect(png(f)).toEqual({ w: n, h: n, sig: "PNG" });
    }
    expect(readFileSync(pub("favicon.svg"), "utf8")).toMatch(/viewBox="0 0 16 16"[^>]*shape-rendering="crispEdges"/);
  });
  it("ships a favicon.ico with 16, 32 and 48 px images", () => {
    const b = readFileSync(pub("favicon.ico"));
    expect([b.readUInt16LE(0), b.readUInt16LE(2), b.readUInt16LE(4)]).toEqual([0, 1, 3]);
    const sizes = [0, 1, 2].map((i) => b[6 + i * 16] || 256).sort((x, y) => x - y);
    expect(sizes).toEqual([16, 32, 48]);
  });
  it("has a manifest with the name, short name, colours and icons that exist", () => {
    const m = JSON.parse(readFileSync(pub("site.webmanifest"), "utf8"));
    expect(m).toMatchObject({ name: "David Arroyave Pérez", short_name: "David A.", background_color: "#16120f", theme_color: "#0f1216" });
    // Icons may be absolute ("/icon-192.png") or relative to the manifest ("icon-192.png").
    for (const i of m.icons) expect(existsSync(pub(i.src.startsWith("/") ? i.src.slice(1) : i.src)), i.src).toBe(true);
    expect(m.icons.some((i: { purpose?: string }) => i.purpose === "maskable")).toBe(true);
  });
});

describe("share image", () => {
  it("falls back to the home image when a project has no image of its own", async () => {
    const { pageMetadata } = await import("@/lib/seo");
    const { projects } = await import("@/data/projects");
    const { existsSync } = await import("node:fs");
    const { join } = await import("node:path");
    for (const p of projects) {
      const meta = pageMetadata({ locale: "en", path: `/projects/${p.slug}/`, title: "t", description: "d" });
      const url = String((meta.openGraph?.images as { url: string }[])[0].url);
      // The URL is SITE_URL + site path; for GitHub Pages SITE_URL itself contains "/portfolio".
      const sitePath = url.startsWith(SITE_URL) ? url.slice(SITE_URL.length) : new URL(url).pathname;
      const file = join(process.cwd(), "public", sitePath);
      expect(existsSync(file), `${p.slug}: ${url}`).toBe(true);
    }
  });
});
