// Fails the build output if it contains claims or characters the portfolio must never show.
// Usage: node scripts/check/honesty.mjs [outDir]
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const dist = process.argv[2] ?? "out";
const files = [];
(function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p);
    else if (p.endsWith(".html")) files.push(p);
  }
})(dist);

const rules = [
  { name: "CJK characters", re: /[぀-ヿ㐀-鿿豈-﫿]/ },
  // Allowed: "not in production", and the CV's freelance line about client production fixes.
  { name: "production claim", re: /(?<!not )in production(?! fixes)|(?<!no |arreglos )en producción/i },
  { name: "live production wording", re: /live production/i },
  { name: "fork presented as own: Omarchy-Spotify", re: /omarchy-spotify/i },
  { name: "third-party repo: ai-job-search", re: /ai-job-search/i },
  // The JavaScript site is a learning project, never claimed as authorship.
  { name: "book authorship framing", re: /book I wrote|libro .{0,20}que escribí|published book|book published|libro publicado|autor técnico|technical author|I published/i },
  // v3 brief "Never say" list. AWS is studied, never worked with: certification pending.
  { name: "published technical author", re: /published technical author|autor técnico publicado/i },
  { name: "AWS experience", re: /AWS (cloud )?experience|experience (with|in|on) AWS|AWS developer|experiencia (en|con) AWS|desarrollador AWS/i },
  // IKAI's bar engine is a fork of Shibumi-Shell: never "from scratch" in the same sentence.
  { name: "IKAI built from scratch", re: /IKAI[^.!?]{0,120}from scratch|from scratch[^.!?]{0,120}IKAI|IKAI[^.!?]{0,120}desde cero|desde cero[^.!?]{0,120}IKAI/i },
  // AmplixMe FS-0009 is a training-program team project, not employment, and the missed deadline is never mentioned.
  { name: "AmplixMe presented as a job", re: /(worked (at|for)|job at|employed (by|at)|employee of|trabajé (en|para)|empleado de|empleo en) AmplixMe/i },
  // David freelanced on digital marketing campaigns; he was never a consultant. Never "bilingual" (his words: it sounds bad).
  { name: "marketing consultant", re: /marketing consultant|consultor(a)? de marketing|consultoría de marketing|consultoria de marketing/i },
  { name: "bilingual wording", re: /bilingual|bilingüe|bilingue/i },
  { name: "Django (basics)", re: /Django \((basics|básico|basico)/i },
  { name: "football (David does not like it)", re: /\b(football|soccer|fútbol|futbol)\b/i },
  { name: "AmplixMe deadline mention", re: /AmplixMe[^.!?]{0,160}(deadline|missed|\blate\b|fecha límite|plazo|\btarde\b)|(deadline|missed|fecha límite|plazo)[^.!?]{0,160}AmplixMe/i },
];

const text = (html) => html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, " ").replace(/<[^>]+>/g, " ");
let failures = 0;
for (const f of files) {
  const body = text(readFileSync(f, "utf8"));
  for (const r of rules) {
    const m = body.match(r.re);
    if (m) { failures++; console.error(`FAIL ${f}: ${r.name} → "${body.slice(Math.max(0, m.index - 40), m.index + 40).trim()}"`); }
  }
}

// Text-first: the projects place and the direct view must carry every featured project name without JavaScript.
const featured = ["IKAI", "omarchy-zen", "TCG Store", "AmplixMe", "JavaScript para Subir de Nivel"];
for (const [page, names] of [
  [join(dist, "projects/index.html"), featured], [join(dist, "es/proyectos/index.html"), featured],
  [join(dist, "direct/index.html"), featured], [join(dist, "es/directo/index.html"), featured],
]) {
  const body = text(readFileSync(page, "utf8"));
  for (const n of names) if (!body.includes(n)) { failures++; console.error(`FAIL ${page}: missing "${n}" in static HTML`); }
}

console.log(`${files.length} pages checked, ${failures} failure(s)`);
process.exit(failures ? 1 : 0);
