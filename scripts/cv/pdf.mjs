// Renders cv-src/*.html to ATS-friendly PDFs in public/cv/ with headless Chromium.
import { execFileSync } from "node:child_process";
import { mkdtempSync } from "node:fs";
import { tmpdir, homedir } from "node:os";
import { join, resolve } from "node:path";

const chrome = process.env.CHROME ?? join(homedir(), ".cache/ms-playwright/chromium-1248/chrome-linux64/chrome");
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
