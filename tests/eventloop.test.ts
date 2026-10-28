import { describe, expect, it } from "vitest";
import { examples, scenarios } from "@/data/eventloop";

describe("lab examples", () => {
  it("has 3 or 4 examples", () => {
    expect(examples.length).toBeGreaterThanOrEqual(3);
    expect(examples.length).toBeLessThanOrEqual(4);
  });
  it.each(examples.map((e) => [e.id, e] as const))("%s: steps and final output match real execution", async (_id, ex) => {
    const out: string[] = [];
    new Function("console", ex.code.join("\n"))({ log: (v: unknown) => out.push(String(v)) });
    await new Promise((r) => setTimeout(r, 20));
    expect(ex.steps.at(-1)!.out).toEqual(out);
    for (const s of ex.steps) {
      expect(s.boxes).toHaveLength(ex.panels.length);
      expect(s.note.en && s.note.es).toBeTruthy();
    }
  });
});


describe("event loop explainer scenarios", () => {
  it("has 4 or 5 scenarios with unique ids", () => {
    expect(scenarios.length).toBeGreaterThanOrEqual(4);
    expect(scenarios.length).toBeLessThanOrEqual(5);
    expect(new Set(scenarios.map((s) => s.id)).size).toBe(scenarios.length);
  });

  it.each(scenarios.map((s) => [s.id, s] as const))("%s: the last frame prints exactly what Node prints", async (_id, sc) => {
    const out: string[] = [];
    new Function("console", sc.code.join("\n"))({ log: (v: unknown) => out.push(String(v)) });
    await new Promise((r) => setTimeout(r, 150));
    expect(sc.frames.at(-1)!.out.map((o) => o.label)).toEqual(out);
  });

  it.each(scenarios.map((s) => [s.id, s] as const))("%s: emits each state once and keeps the rules", (_id, sc) => {
    const key = (f: (typeof sc.frames)[number]) => JSON.stringify([f.line, f.stack, f.api, f.micro, f.tasks, f.out, !!f.paint]);
    sc.frames.forEach((f, i) => {
      if (i) expect(key(f), `frame ${i} repeats frame ${i - 1}`).not.toBe(key(sc.frames[i - 1]));
      // A line number points inside the code; console output only grows.
      if (f.line !== null) { expect(f.line).toBeGreaterThanOrEqual(0); expect(f.line).toBeLessThan(sc.code.length); }
      if (i) expect(f.out.slice(0, sc.frames[i - 1].out.length)).toEqual(sc.frames[i - 1].out);
      // A task starts only when no microtask is waiting; the browser paints only between tasks.
      const prev = sc.frames[i - 1];
      if (prev) {
        const before = new Set(prev.tasks.map((t) => t.id));
        const started = f.stack.some((t) => before.has(t.id));
        if (started) expect(f.micro, `frame ${i} starts a task with microtasks pending`).toHaveLength(0);
      }
      if (f.paint) { expect(f.stack).toHaveLength(0); expect(f.micro).toHaveLength(0); }
      // Token ids are unique across the whole frame.
      const ids = [...f.stack, ...f.api, ...f.micro, ...f.tasks, ...f.out].map((t) => t.id);
      expect(new Set(ids).size, `frame ${i}`).toBe(ids.length);
    });
  });

  it("lets timers run by delay: the fast timer reaches the task queue first", () => {
    const sc = scenarios.find((s) => s.id === "delays")!;
    const firstTask = sc.frames.find((f) => f.tasks.length)!;
    expect(firstTask.tasks[0].label).toBe("fast cb");
  });

  it("covers setTimeout vs Promise, nested microtasks, async/await, queueMicrotask and a render note", () => {
    const code = scenarios.map((s) => s.code.join("\n")).join("\n");
    for (const w of ["setTimeout", "Promise.resolve", "async function", "await", "queueMicrotask"]) expect(code).toContain(w);
    expect(scenarios.some((s) => s.frames.some((f) => f.paint))).toBe(true);
  });

  it("narrates every frame in both languages with one plain sentence, no CJK", () => {
    for (const sc of scenarios) for (const f of sc.frames) {
      for (const l of ["en", "es"] as const) {
        expect(f.note[l].length).toBeGreaterThan(8);
        expect(f.note[l].length).toBeLessThan(190);
        expect(f.note[l]).not.toMatch(/[\u3040-\u30ff\u3400-\u9fff]/);
      }
    }
  });
});
