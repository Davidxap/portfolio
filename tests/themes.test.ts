import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { DEFAULT_THEME, LEGACY, resolveTheme, THEME_INIT_SCRIPT, THEME_META, THEMES } from "@/lib/theme";

const css = readFileSync("src/styles/tokens.css", "utf8");
const block = (id: string) => {
  const m = css.match(new RegExp(`:root(?:,\\s*:root)?\\[data-theme="${id}"\\]\\s*\\{([^}]*)\\}`));
  expect(m, `block for ${id}`).not.toBeNull();
  return m![1];
};
const REQUIRED = [
  "bg", "bg-2", "panel", "line", "dock-shadow", "text", "muted", "accent", "accent-ink", "accent-2", "accent-2-ink", "cta", "cta-ink",
  "card-bg", "card-text", "card-muted", "card-line", "card-shadow", "spot", "frame", "field-1", "field-2", "glass", "glass-line",
  "sky-1", "sky-2", "sky-3", "sun", "river-1", "river-2", "river-3", "paint-bg", "paint-1", "paint-2", "paint-3", "paint-pull", "paint-amt",
  "wall-night", "color-scheme",
];

describe("theme set", () => {
  it("has the eight Manizales ids in menu order with Chipre as default", () => {
    expect([...THEMES]).toEqual(["chipre", "paramo", "tinto", "cafetal", "niebla", "nevado", "cable", "catedral"]);
    expect(DEFAULT_THEME).toBe("chipre");
  });
  it.each(THEMES)("%s defines every token", (id) => {
    const b = block(id);
    for (const k of REQUIRED) expect(b, `${id} --${k}`).toMatch(new RegExp(`--${k}:\\s*[^;]+;`));
  });
  it("wall-night is 0 or 1 and day themes never set a wall-level filter or overlay token", () => {
    for (const id of THEMES) expect(block(id).match(/--wall-night:\s*([^;]+);/)![1]).toMatch(/^[01]$/);
    expect(css).not.toMatch(/--wall-(filter|overlay|blend)/);
    const night = THEMES.filter((id) => block(id).includes("--wall-night: 1;"));
    expect(night.sort()).toEqual(["cable", "catedral", "nevado"]);
  });
  it("themes.css shows the night painting at full opacity (never blended with the day painting, which would ghost the clouds), tames its blue cast with a filter and a flat warm overlay, leaves the day painting untouched, and is imported by globals.css", () => {
    const t = readFileSync("src/styles/themes.css", "utf8");
    expect(t).toMatch(/\.wp-night\s*\{[^}]*opacity:\s*var\(--wall-night, 0\)/);
    expect(t).not.toMatch(/\.wp-night\s*\{[^}]*opacity:\s*calc/);
    expect(t).toMatch(/\.wp-night img\s*\{[^}]*filter:\s*saturate/);
    expect(t).toMatch(/\.wp-night::after\s*\{[^}]*mix-blend-mode:\s*soft-light/);
    expect(t).not.toMatch(/\.wp-day\s*\{[^}]*filter/);
    expect(t).not.toMatch(/\.wp-art\s*\{[^}]*filter/);
    expect(readFileSync("src/app/globals.css", "utf8")).toContain('@import "../styles/themes.css"');
  });
  it("tokens.css has no legacy theme selectors and :root carries Chipre", () => {
    expect(css).not.toMatch(/data-theme="(dusk|dawn|night)"/);
    expect(css).toMatch(/:root,\s*:root\[data-theme="chipre"\]/);
  });
  it("swatches are three colours each, unique per theme, and come from the theme's own tokens", () => {
    const seen = new Set<string>();
    for (const id of THEMES) {
      const sw = THEME_META[id].swatch;
      expect(sw).toHaveLength(3);
      seen.add(sw.join());
      expect(block(id)).toContain(`--bg: ${sw[0]};`);
      for (const c of sw.slice(1)) expect(block(id), `${id} ${c}`).toContain(c);
    }
    expect(seen.size).toBe(8);
  });
  it("has proper names and taglines in both languages", () => {
    for (const id of THEMES) {
      const m = THEME_META[id];
      expect(m.name.length).toBeGreaterThan(2);
      expect(m.tagline.en.length).toBeGreaterThan(5);
      expect(m.tagline.es.length).toBeGreaterThan(5);
    }
    expect(new Set(THEMES.map((t) => THEME_META[t].name)).size).toBe(8);
  });
  it("maps legacy ids and rejects unknown ones", () => {
    expect(LEGACY).toEqual({ dusk: "chipre", dawn: "paramo", night: "cable" });
    expect(resolveTheme("dusk")).toBe("chipre");
    expect(resolveTheme("dawn")).toBe("paramo");
    expect(resolveTheme("night")).toBe("cable");
    expect(resolveTheme("niebla")).toBe("niebla");
    expect(resolveTheme("constructor")).toBe("chipre");
    expect(resolveTheme(null)).toBe("chipre");
  });
  it("the init script migrates and rewrites storage once", () => {
    const run = () => { new Function(THEME_INIT_SCRIPT)(); return document.documentElement.dataset.theme; };
    localStorage.setItem("theme", "night");
    expect(run()).toBe("cable");
    expect(localStorage.getItem("theme")).toBe("cable");
    localStorage.setItem("theme", "catedral");
    expect(run()).toBe("catedral");
    localStorage.setItem("theme", "bogus");
    expect(run()).toBe("chipre");
    expect(localStorage.getItem("theme")).toBe("chipre");
    localStorage.clear();
    expect(run()).toBe("chipre");
    expect(localStorage.getItem("theme")).toBeNull();
  });
});
