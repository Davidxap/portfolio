// Generates 1200x630 Open Graph PNGs into public/og/ using headless Chromium.
// Usage: node scripts/og/generate.mjs
import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync, mkdirSync } from "node:fs";
import { tmpdir, homedir } from "node:os";
import { join, resolve } from "node:path";
import { projects } from "../../src/data/projects.ts";

const chrome = process.env.CHROME ?? join(homedir(), ".cache/ms-playwright/chromium-1248/chrome-linux64/chrome");
const root = resolve(import.meta.dirname, "../..");
const outDir = join(root, "public/og");
mkdirSync(outDir, { recursive: true });
const tmp = mkdtempSync(join(tmpdir(), "og-"));

const role = { en: "Full-Stack Developer · Manizales, Colombia", es: "Desarrollador Full-Stack · Manizales, Colombia" };
const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

const cards = [
  { file: "home-en", locale: "en", kicker: "Portfolio", title: "David Arroyave Pérez", sub: "I build and ship web applications, end to end." },
  { file: "home-es", locale: "es", kicker: "Portafolio", title: "David Arroyave Pérez", sub: "Construyo y despliego aplicaciones web, de punta a punta." },
];
for (const p of projects) {
  for (const locale of ["en", "es"]) {
    cards.push({ file: `${p.slug}-${locale}`, locale, kicker: `${locale === "en" ? "Expedition" : "Expedición"} ${p.chapter}`, title: p.name, sub: p.tagline[locale], tag: p.status[locale], hue: p.hue });
  }
}

const html = (c) => `<!doctype html><meta charset="utf-8"><style>
*{box-sizing:border-box}html,body{margin:0;width:1200px;height:630px;overflow:hidden}
body{background:#16232a;color:#f2eadb;font-family:Fraunces,Georgia,'Times New Roman',serif;position:relative}
.sun{position:absolute;right:-120px;top:-160px;width:620px;height:620px;border-radius:50%;background:radial-gradient(circle,${c.hue?.[1] ?? "#f2b27a"}cc 0,#f2b27a33 45%,transparent 70%)}
.hill{position:absolute;left:0;right:0;bottom:0;height:150px;background:linear-gradient(#1f3a40,#16232a)}
.hill2{position:absolute;left:0;right:0;bottom:0;height:70px;background:#8fd0c222;border-top:2px solid #8fd0c255}
.wrap{position:absolute;left:84px;top:84px;right:84px}
.k{color:#f2b27a;letter-spacing:.2em;text-transform:uppercase;font-size:24px}
h1{font-size:${c.title.length > 18 ? 84 : 104}px;line-height:1.05;margin:28px 0 20px;font-weight:600}
p{font-size:36px;line-height:1.3;margin:0;color:#f2eadbcc;max-width:860px}
.tag{display:inline-block;margin-top:28px;color:#8fd0c2;border:2px solid #8fd0c2;padding:6px 18px;border-radius:999px;font-size:24px}
.foot{position:absolute;left:84px;bottom:44px;font-size:26px;color:#f2b27a;z-index:2}
</style><div class="sun"></div><div class="hill"></div><div class="hill2"></div>
<div class="wrap"><div class="k">${esc(c.kicker)}</div><h1>${esc(c.title)}</h1><p>${esc(c.sub)}</p>${c.tag ? `<span class="tag">${esc(c.tag)}</span>` : ""}</div>
<div class="foot">David Arroyave Pérez · ${esc(role[c.locale])}</div>`;

for (const c of cards) {
  const f = join(tmp, `${c.file}.html`);
  writeFileSync(f, html(c));
  execFileSync(chrome, [
    "--headless=new", "--no-sandbox", `--user-data-dir=${mkdtempSync(join(tmpdir(), "chr-"))}`,
    "--window-size=1200,630", "--hide-scrollbars", `--screenshot=${join(outDir, c.file + ".png")}`, `file://${f}`,
  ], { stdio: "ignore" });
  console.log("wrote", c.file + ".png");
}
