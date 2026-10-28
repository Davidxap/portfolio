import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, describe, expect, it } from "vitest";

const names = "IKAI omarchy-zen TCG Store AmplixMe JavaScript para Subir de Nivel";
const dirs: string[] = [];
const page = (dir: string, rel: string, body: string) => {
  const f = join(dir, rel);
  mkdirSync(join(f, ".."), { recursive: true });
  writeFileSync(f, `<html><body><main>${body}</main></body></html>`);
};
const run = (body: string) => {
  const dir = mkdtempSync(join(tmpdir(), "honesty-"));
  dirs.push(dir);
  for (const rel of ["projects/index.html", "es/proyectos/index.html", "direct/index.html", "es/directo/index.html"]) page(dir, rel, names);
  page(dir, "index.html", body);
  return spawnSync("node", ["scripts/check/honesty.mjs", dir], { encoding: "utf8" });
};

afterAll(() => { for (const d of dirs) rmSync(d, { recursive: true, force: true }); });

describe("check:honesty", () => {
  it("passes clean copy", () => {
    const r = run("Studied AWS's official training material; certification pending. IKAI is a fork of Shibumi-Shell.");
    expect(r.status, r.stderr).toBe(0);
  });
  it.each([
    "I am a published technical author",
    "Five years of AWS experience",
    "Tres años de experiencia en AWS",
    "IKAI was built from scratch by me",
    "IKAI, construido desde cero",
    "I worked at AmplixMe for a summer",
    "AmplixMe was great, although we missed the deadline",
    "I was a digital marketing consultant",
    "Consultor de marketing digital",
    "consultoría de marketing digital",
    "A free bilingual learning site",
    "un sitio bilingüe para aprender",
    "Django (basics) and FastAPI",
    "Django (básico) y FastAPI",
  ])("fails on: %s", (bad) => {
    const r = run(bad);
    expect(r.status).toBe(1);
    expect(r.stderr).toMatch(/FAIL/);
  });
  it("does not flag 'built from scratch' away from IKAI", () => {
    expect(run("A tiny site built from scratch in an afternoon, nothing else here").status).toBe(0);
  });
  it("lets IKAI Shell be called open source (it is MIT)", () => {
    expect(run("IKAI Shell is open source (MIT). omarchy-zen is open source too.").status).toBe(0);
  });
  it("lets the now-featured Skorify contributions through", () => {
    expect(run("Two merged pull requests to Skorify").status).toBe(0);
  });
});
