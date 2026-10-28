// Runs every Event Loop Lab example for real and checks the authored traces against Node.
// Usage: node --experimental-strip-types scripts/check/eventloop.mjs [dataModule]
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";

const mod = await import(pathToFileURL(resolve(process.argv[2] ?? "src/data/eventloop.ts")).href);
const { examples, scenarios = [] } = mod;

let failures = 0;
const fail = (m) => { failures++; console.error(`FAIL ${m}`); };
const summary = [];

for (const ex of examples) {
  const out = [];
  const sandboxConsole = { log: (v) => out.push(String(v)) };
  new Function("console", ex.code.join("\n"))(sandboxConsole);
  await new Promise((r) => setTimeout(r, 20));

  const { steps, panels } = ex;
  const expected = steps.at(-1).out;
  if (JSON.stringify(out) !== JSON.stringify(expected)) fail(`${ex.id} final console: real ${JSON.stringify(out)} vs trace ${JSON.stringify(expected)}`);
  steps.forEach((s, i) => {
    const prev = i ? steps[i - 1].out : [];
    if (JSON.stringify(s.out.slice(0, prev.length)) !== JSON.stringify(prev)) fail(`${ex.id} step ${i}: console rewrites earlier output`);
    if (s.line !== null && (s.line < 0 || s.line >= ex.code.length)) fail(`${ex.id} step ${i}: line out of range`);
    if (s.boxes.length !== panels.length) fail(`${ex.id} step ${i}: ${s.boxes.length} boxes for ${panels.length} panels`);
    if (!s.note.en || !s.note.es) fail(`${ex.id} step ${i}: missing note`);
  });
  summary.push(`${ex.id}: ${out.join(" ")}`);
}
// Step-by-step explainer scenarios: the last frame's console must equal what Node really prints, and the simulator-built frames must be legal.
for (const sc of scenarios) {
  const out = [];
  new Function("console", sc.code.join("\n"))({ log: (v) => out.push(String(v)) });
  await new Promise((r) => setTimeout(r, 150));
  const last = sc.frames.at(-1).out.map((o) => o.label);
  if (JSON.stringify(out) !== JSON.stringify(last)) fail(`${sc.id} final console: real ${JSON.stringify(out)} vs trace ${JSON.stringify(last)}`);
  sc.frames.forEach((f, i) => {
    const prev = i ? sc.frames[i - 1].out.map((o) => o.label) : [];
    if (JSON.stringify(f.out.map((o) => o.label).slice(0, prev.length)) !== JSON.stringify(prev)) fail(`${sc.id} frame ${i}: console rewrites earlier output`);
    if (!f.note.en || !f.note.es) fail(`${sc.id} frame ${i}: missing note`);
  });
  summary.push(`${sc.id}: ${out.join(" / ")}`);
}
console.log(`${examples.length} examples + ${scenarios.length} scenarios · ${summary.join(" | ")} · ${failures} failure(s)`);
process.exit(failures ? 1 : 0);
