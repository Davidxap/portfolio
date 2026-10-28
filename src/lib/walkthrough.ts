// Parses `// @step id: text` + `// @paso id: text` annotation pairs out of a demo source (Code Hike style).
// Pure and build-time safe: malformed annotations throw so the build fails loudly.
export type Step = { id: string; en: string; es: string; from: number; to: number };
export type Walkthrough = { code: string; steps: Step[] };

const ANNOTATION = /^\s*\/\/\s*@(step|paso)\s+([a-z0-9]+(?:-[a-z0-9]+)*)\s*:\s*(.+?)\s*$/;
const LOOSE = /^\s*\/\/\s*@(step|paso)\b/;

export function parseWalkthrough(source: string): Walkthrough {
  const kept: string[] = [];
  const steps: Step[] = [];
  const seen = new Set<string>();
  let pending: { id: string; en?: string; es?: string; at: number } | null = null;

  const close = (end: number) => {
    const last = steps[steps.length - 1];
    if (last && last.to === 0) last.to = end;
  };
  const open = () => {
    if (!pending) return;
    if (pending.en === undefined || pending.es === undefined) {
      throw new Error(`walkthrough: step "${pending.id}" needs both "// @step" and "// @paso" lines`);
    }
    steps.push({ id: pending.id, en: pending.en, es: pending.es, from: kept.length + 1, to: 0 });
    pending = null;
  };

  source.split("\n").forEach((line, n) => {
    const m = ANNOTATION.exec(line);
    if (!m) {
      if (LOOSE.test(line)) throw new Error(`walkthrough: malformed annotation on line ${n + 1}: ${line.trim()}`);
      open();
      kept.push(line);
      return;
    }
    const [, kind, id, text] = m;
    if (kind === "step") {
      if (pending) open(); // throws: previous @step has no @paso
      if (seen.has(id)) throw new Error(`walkthrough: duplicate step id "${id}" (line ${n + 1})`);
      seen.add(id);
      close(kept.length);
      pending = { id, en: text, at: n + 1 };
    } else {
      if (!pending || pending.id !== id || pending.es !== undefined) {
        throw new Error(`walkthrough: "// @paso ${id}" on line ${n + 1} must directly follow its "// @step ${id}"`);
      }
      pending.es = text;
    }
  });
  if (pending) open(); // throws if @paso is missing
  close(kept.length);

  for (const s of steps) {
    if (s.to < s.from) throw new Error(`walkthrough: step "${s.id}" has no code below it`);
  }
  return { code: kept.join("\n"), steps };
}
