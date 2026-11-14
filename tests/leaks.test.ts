import { spawnSync } from "node:child_process";
import { describe, expect, it } from "vitest";

// The scanner reads a staged diff on stdin, exactly as the pre-commit hook feeds it.
const scan = (added: string, file = "src/data/site.ts") =>
  spawnSync("sh", ["scripts/check/leaks.sh"], { input: `+++ b/${file}\n+${added}\n`, encoding: "utf8" });

describe("check:leaks", () => {
  it("passes ordinary copy, including naming an AI tool as a skill", () => {
    const r = scan('ai: ["Claude Code", "OpenCode", "AI agent workflows"],');
    expect(r.status, r.stdout).toBe(0);
  });
  it.each([
    ["chat transcript", "Assistant: here is the plan you asked for"],
    ["chat transcript", "User: fix the hero please"],
    ["chat transcript", "Prompt: rewrite the hero copy"],
    ["secret", "const key = \"ghp_abcdefghijklmnopqrstuvwxyz0123456789\";"],
    ["secret", "DATABASE_URL=postgresql://admin:hunter2@db.example.com:5432/app"],
    ["secret", "-----BEGIN OPENSSH PRIVATE KEY-----"],
  ])("blocks %s: %s", (_kind, line) => {
    const r = scan(line);
    expect(r.status).toBe(1);
    expect(r.stdout).toContain("src/data/site.ts");
  });
  it.each([".claude/settings.local.json", ".atl/skill-registry.md", ".ollama/history", "HANDOFF.md", "odd/tasks/feature.md", ".env.local"])("blocks the session file %s", (file) => {
    expect(scan("anything", file).status).toBe(1);
  });
  it("allows crediting an AI tool as a co-author", () => {
    expect(scan("Co-Authored-By: Some Model <noreply@example.com>", "docs/notes.md").status).toBe(0);
  });
  it("ignores removed lines", () => {
    const r = spawnSync("sh", ["scripts/check/leaks.sh"], { input: "+++ b/a.ts\n-Assistant: old transcript line\n", encoding: "utf8" });
    expect(r.status).toBe(0);
  });
});
