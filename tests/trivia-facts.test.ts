import { describe, expect, it } from "vitest";
import { questions } from "@/data/trivia";

// Runs every snippet of src/data/trivia.ts for real and checks that the marked answer is what JavaScript does.
// Each case gives the exact outcome in the same words as the option text.
type Outcome = { value?: string; error?: string };
const show = (v: unknown): string => (typeof v === "string" ? `'${v}'` : Array.isArray(v) ? `[${v.map((x) => (typeof x === "string" ? `'${x}'` : String(x))).join(", ")}]` : String(v));

async function run(code: string): Promise<{ out: string[]; value?: unknown; error?: string }> {
  const out: string[] = [];
  const logs = { log: (...a: unknown[]) => out.push(a.map(String).join(" ")) };
  try {
    const fn = new Function("console", `"use strict";\nreturn (async () => {\n${code}\n})();`);
    await fn(logs);
    await new Promise((r) => setTimeout(r, 20));
    return { out };
  } catch (e) {
    return { out, error: (e as Error).name };
  }
}

// Snippets that end in a statement, not an expression: what to look at afterwards.
const OBSERVE: Record<string, string> = { "const a = [1, 2, 3];\na.length = 1;": "a" };

async function evaluate(code: string): Promise<Outcome & { out: string[] }> {
  if (OBSERVE[code]) return { value: show(new Function(`"use strict";\n${code}\nreturn ${OBSERVE[code]};`)()), out: [] };
  // A single expression is evaluated for its value; anything else is run as statements.
  try {
    const v = new Function(`"use strict"; return (${code});`)();
    if (v && typeof (v as Promise<unknown>).then === "function") {
      try { const r = await (v as Promise<unknown>); return { value: `fulfills with ${show(r)}`, out: [] }; }
      catch (e) { return { value: `rejects with ${show(e)}`, out: [] }; }
    }
    return { value: show(v), out: [] };
  } catch (e) {
    if (!(e instanceof SyntaxError)) return { error: (e as Error).name, out: [] };
  }
  const r = await run(code);
  return { error: r.error, out: r.out };
}

const norm = (s: string) => s.replace(/^prints /, "").replace(/ /g, "");

describe("trivia facts are real JavaScript behaviour", () => {
  it.each(questions.map((q, i) => [i, q] as const))("question %i: the marked answer is what Node does", async (_i, q) => {
    const r = await evaluate(q.code);
    const right = q.options[q.answer].en;
    const wrong = q.options.filter((_, k) => k !== q.answer).map((o) => o.en);
    const wasRight = (opt: string): boolean => {
      if (r.error) return opt === r.error;
      if (r.value !== undefined) return norm(opt) === norm(r.value);
      // statements: an order of printed letters, a printed value or a final state
      return norm(opt) === norm(r.out.join(" ")) || norm(opt) === norm(r.out.join(""));
    };
    expect(wasRight(right), `${q.code} -> ${JSON.stringify(r)} but marked "${right}"`).toBe(true);
    for (const w of wrong) expect(wasRight(w), `${q.code}: wrong option "${w}" also matches`).toBe(false);
  });

  it("the parseInt explanation is accurate: radix 1 is invalid and 3 is not a base-2 digit", () => {
    expect(parseInt("2", 1)).toBeNaN();
    expect(parseInt("3", 2)).toBeNaN();
    expect(parseInt("1", 0)).toBe(1);
    const q = questions.find((x) => x.code.includes("parseInt"))!;
    expect(q.why.en).toMatch(/radix 1 is invalid/);
    expect(q.why.es).toMatch(/base 1 no es válida/);
  });

  it("the timer-and-microtask question prints A D C B", async () => {
    const q = questions.find((x) => x.code.includes("setTimeout(() => console.log('B'), 0)"))!;
    const r = await run(q.code);
    expect(r.out).toEqual(["A", "D", "C", "B"]);
  });

  it("the var loop prints 3 3 3 and the let loop 0 1 2", async () => {
    const q = questions.find((x) => x.code.startsWith("for (var i"))!;
    expect((await run(q.code)).out).toEqual(["3", "3", "3"]);
    expect((await run(q.code.replace("var", "let"))).out).toEqual(["0", "1", "2"]);
  });

  it("the temporal dead zone throws a ReferenceError", async () => {
    const q = questions.find((x) => x.code.includes("let x"))!;
    expect((await run(q.code)).error).toBe("ReferenceError");
  });
});
