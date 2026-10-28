// Rewrites root-absolute asset references (/art/..., /media/..., /cv/...) inside the
// static export so the site works when GitHub Pages serves it under /portfolio/.
// Run AFTER `next build` with NEXT_PUBLIC_BASE_PATH set, e.g.: node scripts/gh-pages.mjs out
// Routes (/_next, /es, /projects...) are left alone: next/link applies basePath at runtime.
import { readdirSync, readFileSync, statSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const [dir] = process.argv.slice(2);
const bp = process.env.NEXT_PUBLIC_BASE_PATH;
if (!dir || !bp) {
  console.error("usage: NEXT_PUBLIC_BASE_PATH=/portfolio node scripts/gh-pages.cjs out");
  process.exit(1);
}
if (!existsSync(join(dir, "index.html"))) {
  console.error(`no index.html under ${dir} — run this after \`next build\``);
  process.exit(1);
}

const MEDIA = String.raw`\/(?:art|media|og|cv|fonts|audio|screencast)\/|\/(?:favicon[a-z0-9.-]*|apple-touch-icon[a-z0-9.-]*|icon-\d+)|\/site\.webmanifest`;

const exts = [".html", ".js", ".css", ".xml", ".webmanifest"];
let files = 0, edits = 0;
const walk = (d) => {
  for (const entry of readdirSync(d)) {
    const full = join(d, entry);
    if (statSync(full).isDirectory()) walk(full);
    else if (exts.some((e) => entry.endsWith(e))) {
      const text = readFileSync(full, "utf8");
      // Wrap the alternation so every branch requires a boundary char ahead of it.
      // \x60 = backtick: template literals like src:`/art/v3/icons/...` live in client chunks.
      const re = new RegExp(String.raw`(["'(\x60=\s])(?:${MEDIA})`, "g");
      const before = (text.match(re) || []).length;
      if (!before) continue;
      const next = text.replace(re, (m, boundary) => m.slice(0, 1) + bp + m.slice(1));
      writeFileSync(full, next);
      files += 1;
      edits += before;
    }
  }
};
walk(dir);

// Sanity check: no root-absolute media refs left in the export.
let left = 0;
const scan = (d) => {
  for (const entry of readdirSync(d)) {
    const full = join(d, entry);
    if (statSync(full).isDirectory()) scan(full);
    else if (entry.endsWith(".html")) left += (readFileSync(full, "utf8").match(new RegExp(String.raw`["'(\x60=\s](?:${MEDIA})`, "g")) || []).length;
  }
};
scan(dir);
console.log(`gh-pages: rewrote refs in ${files} files (basePath ${bp}), root-media refs left in html: ${left}`);
if (left > 0) process.exit(2);
