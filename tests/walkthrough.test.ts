import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { parseWalkthrough } from "@/lib/walkthrough";

const src = [
  "const a = 1;",
  "// @step setup: Create state.",
  "// @paso setup: Crea el estado.",
  "const b = 2;",
  "const c = 3;",
  "// @step done: Finish.",
  "// @paso done: Termina.",
  "return b + c;",
].join("\n");

describe("parseWalkthrough", () => {
  it("strips annotation comments from the displayed code", () => {
    const { code } = parseWalkthrough(src);
    expect(code).toBe("const a = 1;\nconst b = 2;\nconst c = 3;\nreturn b + c;");
    expect(code).not.toMatch(/@step|@paso/);
  });

  it("returns 1-based inclusive line ranges in the stripped code", () => {
    const { steps } = parseWalkthrough(src);
    expect(steps.map((s) => [s.id, s.from, s.to])).toEqual([["setup", 2, 3], ["done", 4, 4]]);
  });

  it("pairs the English and Spanish text", () => {
    const { steps } = parseWalkthrough(src);
    expect(steps[0]).toMatchObject({ en: "Create state.", es: "Crea el estado." });
    expect(steps[1]).toMatchObject({ en: "Finish.", es: "Termina." });
  });

  it("throws when @paso is missing", () => {
    expect(() => parseWalkthrough("// @step a: Only English.\nconst x = 1;")).toThrow(/@paso/);
  });

  it("throws on duplicate ids", () => {
    const dup = "// @step a: One.\n// @paso a: Uno.\nx();\n// @step a: Two.\n// @paso a: Dos.\ny();";
    expect(() => parseWalkthrough(dup)).toThrow(/duplicate.*a/i);
  });

  it("every real demo has at least 3 well-formed steps", () => {
    const dir = join(process.cwd(), "src/components/console/demos");
    const files = readdirSync(dir).filter((f) => f.endsWith(".tsx"));
    expect(files.length).toBeGreaterThanOrEqual(4);
    for (const f of files) {
      const { steps, code } = parseWalkthrough(readFileSync(join(dir, f), "utf8").trim());
      expect(steps.length, f).toBeGreaterThanOrEqual(3);
      expect(steps.length, f).toBeLessThanOrEqual(6);
      expect(code, f).not.toMatch(/@step|@paso/);
      for (const s of steps) expect(s.to, `${f}:${s.id}`).toBeGreaterThanOrEqual(s.from);
    }
  });
});
