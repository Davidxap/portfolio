// Renders cv-src/*.html to ATS-friendly PDFs in public/cv/ with headless Chromium.
import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readdirSync } from "node:fs";
import { tmpdir, homedir } from "node:os";
import { join, resolve } from "node:path";

// Playwright's headless shell, newest installed build (the full Chromium build hangs on --print-to-pdf here). Override with CHROME.
const cache = join(homedir(), ".cache/ms-playwright");
const shells = existsSync(cache) ? readdirSync(cache).filter((d) => d.startsWith("chromium_headless_shell-")).sort((a, b) => parseInt(a.split("-").pop()) - parseInt(b.split("-").pop())) : [];
const chrome = process.env.CHROME ?? (shells.length ? join(cache, shells.at(-1), "chrome-headless-shell-linux64/chrome-headless-shell") : "");
if (process.env.CHROME && !existsSync(chrome)) throw new Error(`CHROME points to a missing file: ${chrome}`);
if (!existsSync(chrome)) throw new Error("No headless Chromium found. Run `npx playwright install chromium-headless-shell` or set CHROME.");
const root = resolve(import.meta.dirname, "../..");
const jobs = [
  ["CV_General_EN.html", "David-Arroyave-Perez-Full-Stack-Developer-EN.pdf"],
  ["CV_General_ES.html", "David-Arroyave-Perez-Desarrollador-Full-Stack-ES.pdf"],
];
for (const [src, out] of jobs) {
  execFileSync(chrome, [
    "--headless=new", "--no-sandbox", `--user-data-dir=${mkdtempSync(join(tmpdir(), "cv-"))}`,
    "--no-pdf-header-footer", `--print-to-pdf=${join(root, "public/cv", out)}`,
    `file://${join(root, "cv-src", src)}`,
  ], { stdio: "ignore" });
  console.log("wrote", out);
}
