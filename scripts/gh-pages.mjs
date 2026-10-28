// Post-build step for GitHub Pages, which serves the site under /portfolio/.
// Run AFTER `next build` with NEXT_PUBLIC_BASE_PATH set, e.g.: node scripts/gh-pages.mjs out
// Only CSS and the web manifest are rewritten: source code prefixes its own paths with withBase()
// (src/lib/base.ts). HTML, JS and RSC payloads are never edited, because RSC text rows are
// length-prefixed and inserting bytes into them corrupts the stream ("Connection closed").
// Those files are only checked, and any root-absolute asset path left in them fails the build.
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

const rewrite = [".css", ".webmanifest"];
// .txt = Next RSC payloads (__next.*.txt), fetched on client navigation
const check = [".html", ".js", ".css", ".webmanifest", ".txt", ".json"];
let files = 0, edits = 0;
const walk = (d) => {
  for (const entry of readdirSync(d)) {
    const full = join(d, entry);
    if (statSync(full).isDirectory()) walk(full);
    else if (rewrite.some((e) => entry.endsWith(e))) {
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

// Sanity check 1: no root-absolute asset URL left in a real URL slot (HTML attribute or RSC prop).
// Source code shown as text on the game pages and runtime withBase() calls are not URL slots.
const ATTR = new RegExp(String.raw`(?:\b(?:src|srcset|href|poster|content)="|\\?"(?:src|srcSet|href|poster|url|manifest)\\?":\\?")(?:${MEDIA})`, "gi");
// Sanity check 2: every length-prefixed RSC text row (id:T<hex len>,) is followed by its full body,
// so the flight stream parses. A byte count that no longer matches is what broke the arcade pages.
const rscRows = (data) => {
  const bytes = Buffer.from(data, "utf8");
  const head = /(?:^|\n)[0-9a-f]+:T([0-9a-f]+),/g;
  let bad = 0;
  for (let m; (m = head.exec(data)); ) {
    const end = Buffer.byteLength(data.slice(0, m.index + m[0].length), "utf8") + parseInt(m[1], 16);
    // the body is followed by the next row ("<hex id>:"), a newline, or the end of the stream
    const next = bytes.subarray(end, end + 16).toString("utf8");
    if (end > bytes.length || (next && !/^(?:\n|[0-9a-f]+:)/.test(next))) bad += 1;
    // skip the body so text inside it is never read as a row header
    head.lastIndex = Math.max(head.lastIndex, bytes.subarray(0, Math.min(end, bytes.length)).toString("utf8").length);
  }
  return bad;
};
const flight = (html) =>
  [...html.matchAll(/self\.__next_f\.push\(\[1,("(?:[^"\\]|\\.)*")\]\)/g)].map((m) => JSON.parse(m[1])).join("");

let left = 0, corrupt = 0;
const scan = (d) => {
  for (const entry of readdirSync(d)) {
    const full = join(d, entry);
    if (statSync(full).isDirectory()) { scan(full); continue; }
    if (!check.some((e) => entry.endsWith(e))) continue;
    const text = readFileSync(full, "utf8");
    const hits = text.match(ATTR) || [];
    if (hits.length) { left += hits.length; console.error(`unprefixed asset URL in ${full}: ${hits[0]}`); }
    const rows = entry.endsWith(".html") ? rscRows(flight(text)) : entry.endsWith(".txt") ? rscRows(text) : 0;
    if (rows) { corrupt += rows; console.error(`corrupt RSC text row in ${full}`); }
  }
};
scan(dir);
console.log(`gh-pages: rewrote refs in ${files} files (basePath ${bp}), unprefixed asset URLs: ${left}, corrupt RSC rows: ${corrupt}`);
if (left > 0 || corrupt > 0) process.exit(2);
