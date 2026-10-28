// WCAG AA contrast check for theme tokens. Usage: node scripts/check/contrast.mjs [tokensCss]
import { readFileSync } from "node:fs";

const file = process.argv[2] ?? "src/styles/tokens.css";
const css = readFileSync(file, "utf8");

function parseColor(v) {
  v = v.trim();
  let m = v.match(/^#([0-9a-f]{6})$/i);
  if (m) return [0, 2, 4].map((i) => parseInt(m[1].slice(i, i + 2), 16)).concat(1);
  m = v.match(/^#([0-9a-f]{3})$/i);
  if (m) return [...m[1]].map((c) => parseInt(c + c, 16)).concat(1);
  m = v.match(/^rgba?\(([^)]+)\)$/i);
  if (m) { const p = m[1].split(",").map(Number); return [p[0], p[1], p[2], p[3] ?? 1]; }
  throw new Error(`unsupported colour: ${v}`);
}
const lum = ([r, g, b]) => { const f = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
const over = (fg, bg) => fg.slice(0, 3).map((c, i) => c * fg[3] + bg[i] * (1 - fg[3]));

const themes = {};
for (const m of css.matchAll(/(:root(?:,\s*:root)?\[data-theme="(\w+)"\]|:root,\s*:root\[data-theme="(\w+)"\])\s*\{([^}]*)\}/g)) {
  const name = m[2] ?? m[3];
  themes[name] = { ...(themes[name] ?? {}) };
  for (const d of m[4].matchAll(/--([\w-]+):\s*([^;]+);/g)) themes[name][d[1]] = d[2];
}
let failures = 0;
const need = ["chipre", "paramo", "tinto", "cafetal", "niebla", "nevado", "cable", "catedral"];
for (const t of need) if (!themes[t]) { console.error(`FAIL missing theme ${t}`); failures++; }
for (const t of need.filter((n) => themes[n])) {
  const v = themes[t];
  const bg = parseColor(v.bg);
  const panel = over(parseColor(v.panel), bg);
  const d = (k) => v[k] ?? themes.chipre[k];
  const pairs = [
    ["text/bg", parseColor(v.text), bg],
    ["muted/bg", parseColor(v.muted), bg],
    ["text/panel", parseColor(v.text), panel],
    ["muted/panel", parseColor(v.muted), panel],
    ["accent-ink/accent", parseColor(v["accent-ink"]), parseColor(v.accent)],
    ["card-text/card-bg", parseColor(v["card-text"]), parseColor(v["card-bg"])],
    ["card-muted/card-bg", parseColor(v["card-muted"]), parseColor(v["card-bg"])],
    // three-role colour system: warmth and curiosity are used as text on the page and on surfaces, ember only as a button fill
    ["accent/bg", parseColor(v.accent), bg],
    ["accent-2/bg", parseColor(v["accent-2"]), bg],
    ["muted/bg-2 (menu tile tagline)", parseColor(v.muted), parseColor(v["bg-2"])],
    ["accent/bg-2", parseColor(v.accent), parseColor(v["bg-2"])],
    ["accent-2/bg-2", parseColor(v["accent-2"]), parseColor(v["bg-2"])],
    ["accent-2-ink/accent-2", parseColor(v["accent-2-ink"]), parseColor(v["accent-2"])],
    ["cta-ink/cta (CTA label)", parseColor(v["cta-ink"]), parseColor(v.cta)],
    // the direct view's painted field (the text sits on a scrim of --paint-bg over the fluid)
    ["text/paint-bg", parseColor(v.text), parseColor(v["paint-bg"])],
    ["muted/paint-bg", parseColor(v.muted), parseColor(v["paint-bg"])],
    ["accent/paint-bg", parseColor(v.accent), parseColor(v["paint-bg"])],
    ["accent-2/paint-bg", parseColor(v["accent-2"]), parseColor(v["paint-bg"])],
    // the dark bars (same tokens in every theme)
    ["dock-text/dock-bg", parseColor(d("dock-text")), parseColor(d("dock-bg"))],
  ];
  for (const [label, fg, back] of pairs) {
    const r = ratio(fg.slice(0, 3), back.slice(0, 3));
    const ok = r >= 4.5;
    if (!ok) failures++;
    console.log(`${ok ? "ok  " : "FAIL"} ${t.padEnd(8)} ${label.padEnd(24)} ${r.toFixed(2)}`);
  }
}
console.log(`${failures} failures`);
process.exit(failures ? 1 : 0);
