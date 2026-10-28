// Regenerates public/media/projects/<slug>/* from real sources (real screenshots only, never retouched).
// Needs: gh (authenticated), curl, ffmpeg (libwebp), avifenc, Playwright's Chromium.
// Usage: node scripts/capture/capture.mjs   (prints "slug/file width height bytes" per image)
//        ONLY=slug1,slug2 node scripts/capture/capture.mjs   (capture just those slugs; SOURCES.md rows are merged, never dropped)
// PAGE sources (headless chrome-headless-shell through puppeteer-core) honour a colour scheme and can scroll to a heading:
//   CHROME_SHELL=<chrome-headless-shell binary>  PUPPETEER=<path to puppeteer-core.js>
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync, statSync, rmSync } from "node:fs";
import { tmpdir, homedir } from "node:os";
import { join } from "node:path";

const CHROME = process.env.CHROME ?? join(homedir(), ".cache/ms-playwright/chromium-1248/chrome-linux64/chrome");
const OUT = "public/media/projects";
const BUDGET = 120 * 1024;
const work = mkdtempSync(join(tmpdir(), "portfolio-capture-"));
const sh = (cmd, args) => execFileSync(cmd, args, { stdio: ["ignore", "pipe", "inherit"] }).toString().trim();
const today = new Date().toISOString().slice(0, 10);

const GH = (repo, path) => ({ type: "gh", repo, path });
const WEB = (url, w, h, crop) => ({ type: "web", url, w, h, crop }); // crop = "w:h:x:y" (framing only)

const PAGE = (url, w, h, opts = {}) => ({ type: "page", url, w, h, ...opts }); // opts: scheme "dark"|"light", heading (scrolls it to the top), note

// name -> { source, maxW }
const SHOTS = {
  ikai: {
    "bar-dark": { src: GH("Davidxap/ikai-shell", "docs/screenshots/bar-dark.png"), maxW: 1600 },
    "bar-light": { src: GH("Davidxap/ikai-shell", "docs/screenshots/bar-light.png"), maxW: 1600 },
    "icons-dark": { src: GH("Davidxap/ikai-shell", "docs/screenshots/cc-widgets-dark.png"), maxW: 1600 },
    "icons-light": { src: GH("Davidxap/ikai-shell", "docs/screenshots/cc-widgets-light.png"), maxW: 1600 },
  },
  "omarchy-zen": {
    "zen-blackturq": { src: GH("Davidxap/omarchy-zen", "screenshots/zen-blackturq.png"), maxW: 1600 },
    "zen-floral": { src: GH("Davidxap/omarchy-zen", "screenshots/zen-floral.png"), maxW: 1600 },
    "zen-osiris": { src: GH("Davidxap/omarchy-zen", "screenshots/zen-osiris.png"), maxW: 1600 },
  },
  "javascript-para-subir-de-nivel": {
    // crops frame the main reading column only (the sidebar's active item renders as an empty blue box in headless Chromium)
    "landing-desktop": { src: WEB("https://davidxap.github.io/javascript-para-subir-de-nivel/", 1440, 900, "780:836:300:64"), maxW: 1600 },
    "chapter-code-desktop": { src: WEB("https://davidxap.github.io/javascript-para-subir-de-nivel/cap-03/", 1440, 2400, "780:800:300:1010"), maxW: 1600 },
    "landing-mobile": { src: WEB("https://davidxap.github.io/javascript-para-subir-de-nivel/", 390, 844), maxW: 800 },
  },
  "tcg-store": {
    "home-desktop": { src: WEB("https://tcg-store-sage.vercel.app/", 1440, 900), maxW: 1600 },
    "home-mobile": { src: WEB("https://tcg-store-sage.vercel.app/", 390, 844), maxW: 800 },
  },
  "amplixme-fs-0009": {
    // The project has no deployed front end, so these are the public repository page and its rendered README on github.com.
    "repo-dark": { src: PAGE("https://github.com/amplixme/FS-0009", 1440, 900, { scheme: "dark", note: "repository page" }), maxW: 1600 },
    "repo-light": { src: PAGE("https://github.com/amplixme/FS-0009", 1440, 900, { scheme: "light", note: "repository page" }), maxW: 1600 },
    "readme-api": { src: PAGE("https://github.com/amplixme/FS-0009", 1440, 900, { scheme: "dark", heading: "Documentación de la API", note: "rendered README, API documentation" }), maxW: 1600 },
  },
  "obsidian-backend-template": {
    "dashboard-top": { src: GH("Davidxap/obsidian-backend-template", "docs/img/dashboard-top.png"), maxW: 1600 },
    "dashboard-bottom": { src: GH("Davidxap/obsidian-backend-template", "docs/img/dashboard-bottom.png"), maxW: 1600 },
    "repo-dark": { src: PAGE("https://github.com/Davidxap/obsidian-backend-template", 1440, 900, { scheme: "dark", heading: "The approach", note: "rendered README" }), maxW: 1600 },
  },
  "skorify-frontend": {
    "repo-dark": { src: PAGE("https://github.com/aws-ug-manizales/Skorify_Frontend", 1440, 900, { scheme: "dark", note: "repository page" }), maxW: 1600 },
    "pr-44": { src: PAGE("https://github.com/aws-ug-manizales/Skorify_Frontend/pull/44", 1440, 900, { scheme: "dark", note: "merged pull request #44" }), maxW: 1600 },
    "pr-63": { src: PAGE("https://github.com/aws-ug-manizales/Skorify_Frontend/pull/63", 1440, 900, { scheme: "dark", note: "merged pull request #63" }), maxW: 1600 },
  },
  "fitness-tracker": {
    "readme-dark": { src: PAGE("https://github.com/Davidxap/Fitness_Tracker", 1440, 900, { scheme: "dark", note: "rendered README" }), maxW: 1600 },
    "readme-light": { src: PAGE("https://github.com/Davidxap/Fitness_Tracker", 1440, 900, { scheme: "light", note: "rendered README" }), maxW: 1600 },
  },
  "weather-app": {
    // The live demo is offline (Vercel deployment not found), so these are the public repository page.
    "repo-dark": { src: PAGE("https://github.com/Davidxap/weather-app-react", 1440, 900, { scheme: "dark", note: "repository page" }), maxW: 1600 },
    "repo-light": { src: PAGE("https://github.com/Davidxap/weather-app-react", 1440, 900, { scheme: "light", note: "repository page" }), maxW: 1600 },
  },
  "ghibli-explorer": {
    "repo-dark": { src: PAGE("https://github.com/Davidxap/studio-ghilbli-api", 1440, 900, { scheme: "dark", note: "repository page" }), maxW: 1600 },
    "repo-light": { src: PAGE("https://github.com/Davidxap/studio-ghilbli-api", 1440, 900, { scheme: "light", note: "repository page" }), maxW: 1600 },
  },
  "linux-win-setup": {
    "readme-dark": { src: PAGE("https://github.com/Davidxap/linux-win-setup", 1440, 900, { scheme: "dark", heading: "linux-win-setup", note: "rendered README" }), maxW: 1600 },
    "readme-light": { src: PAGE("https://github.com/Davidxap/linux-win-setup", 1440, 900, { scheme: "light", heading: "linux-win-setup", note: "rendered README" }), maxW: 1600 },
  },
};

const ONLY = process.env.ONLY?.split(",").filter(Boolean);
if (ONLY) for (const k of Object.keys(SHOTS)) if (!ONLY.includes(k)) delete SHOTS[k];

const origin = (s) => (s.type === "gh" ? `https://github.com/${s.repo}/blob/HEAD/${s.path}` : s.type === "page" ? `${s.url} (puppeteer-core, headless Chrome, ${s.scheme ?? "default"} scheme, ${s.w}x${s.h}${s.heading ? `, scrolled to "${s.heading}"` : ""}, ${s.note ?? "page"})` : s.url);
const sources = [];

let browser;
const pageShot = async (src, raw) => {
  if (!browser) {
    const { default: puppeteer } = await import(process.env.PUPPETEER ?? "puppeteer-core");
    browser = await puppeteer.launch({ executablePath: process.env.CHROME_SHELL, args: ["--no-sandbox"] });
  }
  const page = await browser.newPage();
  await page.setViewport({ width: src.w, height: src.h });
  await page.emulateMediaFeatures([{ name: "prefers-color-scheme", value: src.scheme ?? "light" }]);
  await page.goto(src.url, { waitUntil: "networkidle2" });
  if (src.heading) {
    await page.waitForSelector("article.markdown-body h1, article.markdown-body h2");
    const ok = await page.evaluate((t) => {
      const el = [...document.querySelectorAll("article.markdown-body h1, article.markdown-body h2, article.markdown-body h3")].find((h) => h.textContent.trim().replace(/^[^\p{L}]+/u, "").startsWith(t));
      if (!el) return false;
      el.scrollIntoView({ block: "start" });
      return true;
    }, src.heading);
    if (!ok) throw new Error(`heading not found: ${src.heading}`);
    await new Promise((r) => setTimeout(r, 600));
  }
  await page.screenshot({ path: raw });
  await page.close();
};

for (const [slug, shots] of Object.entries(SHOTS)) {
  const dir = join(OUT, slug);
  mkdirSync(dir, { recursive: true });
  for (const [name, { src, maxW }] of Object.entries(shots)) {
    const raw = join(work, `${slug}-${name}.png`);
    if (src.type === "gh") {
      const url = sh("gh", ["api", `repos/${src.repo}/contents/${src.path}`, "--jq", ".download_url"]);
      sh("curl", ["-sfL", url, "-o", raw]);
    } else if (src.type === "page") {
      await pageShot(src, raw);
    } else {
      sh(CHROME, ["--headless=new", "--no-sandbox", `--user-data-dir=${mkdtempSync(join(work, "u-"))}`,
        `--window-size=${src.w},${src.h}`, "--hide-scrollbars", "--virtual-time-budget=6000", `--screenshot=${raw}`, src.url]);
    }
    const vf = [src.crop ? `crop=${src.crop}` : null, `scale='min(${maxW},iw)':-2:flags=lanczos`].filter(Boolean).join(",");
    const resized = join(work, `${slug}-${name}-r.png`);
    sh("ffmpeg", ["-v", "error", "-y", "-i", raw, "-vf", vf, resized]);
    const avif = join(dir, `${name}.avif`);
    sh("avifenc", ["-q", "55", "-s", "4", resized, avif]);
    sh("ffmpeg", ["-v", "error", "-y", "-i", resized, "-c:v", "libwebp", "-q:v", "72", join(dir, `${name}.webp`)]);
    const dims = sh("ffprobe", ["-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height", "-of", "csv=p=0:s=x", resized]);
    const size = statSync(avif).size;
    if (size > BUDGET) console.warn(`OVER BUDGET ${slug}/${name}.avif ${size}`);
    console.log(`${slug}/${name} ${dims} avif=${size}`);
    sources.push(`| ${slug}/${name}.avif, .webp | ${origin(src)}${src.crop ? ` (cropped ${src.crop})` : ""} | ${today} |`);
  }
}

await browser?.close();

// Merge with existing rows so a partial (ONLY=) run never drops other projects' sources.
const SRC_FILE = join(OUT, "SOURCES.md");
const key = (row) => row.split("|")[1].trim();
const rows = new Map();
if (existsSync(SRC_FILE)) for (const l of readFileSync(SRC_FILE, "utf8").split("\n")) if (/^\| \S+\/\S+\.avif/.test(l)) rows.set(key(l), l);
for (const r of sources) rows.set(key(r), r);
writeFileSync(SRC_FILE, [
  "# Preview sources",
  "",
  "Real screenshots only; resized/cropped for framing, never retouched. Regenerate with `node scripts/capture/capture.mjs`.",
  "",
  "| File | Origin | Captured |",
  "|---|---|---|",
  ...rows.values(), "",
].join("\n"));
rmSync(work, { recursive: true, force: true });
