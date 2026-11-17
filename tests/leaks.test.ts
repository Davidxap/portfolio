import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

// The scanner reads a staged diff on stdin, exactly as the pre-commit hook feeds it.
const scan = (added: string, file = "src/data/site.ts") =>
  spawnSync("sh", ["scripts/check/leaks.sh"], { input: `+++ b/${file}\n@@ -0,0 +1 @@\n+${added}\n`, encoding: "utf8" });

describe("check:leaks", () => {
  it("passes ordinary copy, including naming an AI tool as a skill", () => {
    const r = scan('ai: ["Claude Code", "OpenCode", "AI agent workflows"],');
    expect(r.status, r.stdout).toBe(0);
  });
  it.each([
    ["chat transcript", "Assistant: here is the plan you asked for", "docs/notes.md"],
    ["chat transcript", "User: fix the hero please", "docs/notes.md"],
    ["chat transcript", "Prompt: rewrite the hero copy", "docs/notes.md"],
    ["commented chat transcript", "// Assistant: here is the plan", "src/data/site.ts"],
    ["secret", "const key = \"ghp_abcdefghijklmnopqrstuvwxyz0123456789\";", "src/data/site.ts"],
    ["secret", "DATABASE_URL=postgresql://admin:hunter2@db.example.com:5432/app", "src/data/site.ts"],
    ["secret", "-----BEGIN OPENSSH PRIVATE KEY-----", "src/data/site.ts"],
    ["secret on a line starting with ++", "++ ghp_abcdefghijklmnopqrstuvwxyz0123456789", "src/data/site.ts"],
  ])("blocks %s: %s", (_kind, line, file) => {
    const r = scan(line, file);
    expect(r.status).toBe(1);
    expect(r.stdout).toContain(file);
  });
  it.each([
    ["a type member", "  User: string;", "src/types.ts"],
    ["a YAML key", "Prompt: value", "config.yml"],
  ])("passes %s that only looks like chat", (_kind, line, file) => {
    expect(scan(line, file).status).toBe(0);
  });
  it("blocks a path-only header for an empty or binary file", () => {
    const r = spawnSync("sh", ["scripts/check/leaks.sh"], { input: "+++ b/HANDOFF.md\ndiff --git a/x b/x\n", encoding: "utf8" });
    expect(r.status).toBe(1);
  });
  it("blocks every entry of the ignored AI-session section", () => {
    const lines = readFileSync(".gitignore", "utf8").split("\n");
    const start = lines.indexOf("# AI-session artifacts and private notes: never tracked");
    expect(start).toBeGreaterThan(-1);
    const rest = lines.slice(start + 1);
    const entries = rest.slice(0, rest.includes("") ? rest.indexOf("") : rest.length);
    expect(entries.length).toBeGreaterThan(0);
    for (const e of entries) {
      const file = e.endsWith("/") ? `${e}notes.txt` : e;
      expect(scan("anything", file).status, e).toBe(1);
    }
  });
  it.each([".claude/settings.local.json", ".atl/skill-registry.md", ".ollama/history", "HANDOFF.md", "odd/tasks/feature.md", ".env.local"])("blocks the session file %s", (file) => {
    expect(scan("anything", file).status).toBe(1);
  });
  it("allows crediting an AI tool as a co-author", () => {
    expect(scan("Co-Authored-By: Some Model <noreply@example.com>", "docs/notes.md").status).toBe(0);
  });
  it("ignores removed lines", () => {
    const r = spawnSync("sh", ["scripts/check/leaks.sh"], { input: "+++ b/a.ts\n@@ -1 +0,0 @@\n-Assistant: old transcript line\n", encoding: "utf8" });
    expect(r.status).toBe(0);
  });
});
