import { describe, expect, it } from "vitest";
import { buildCommands, filterCommands } from "@/lib/palette";

describe("command palette", () => {
  const cmds = buildCommands("en");
  it("offers navigation, chapters, a theme command per theme, and actions", () => {
    const ids = cmds.map((c) => c.id);
    expect(ids).toEqual(expect.arrayContaining(["nav-map", "nav-about", "nav-projects", "nav-experience", "nav-stack", "nav-arcade", "nav-contact", "nav-direct", "cv", "copy", "lang", "theme-chipre", "theme-paramo", "theme-tinto", "theme-cafetal", "theme-niebla", "theme-nevado", "theme-cable", "theme-catedral"]));
    expect(ids).not.toContain("nav-road");
  });
  it("filters case-insensitively and returns everything for an empty query", () => {
    expect(filterCommands(cmds, "")).toHaveLength(cmds.length);
    const r = filterCommands(cmds, "PÁRAMO");
    expect(r.map((c) => c.id)).toEqual(["theme-paramo"]);
    expect(filterCommands(cmds, "zzzz")).toEqual([]);
  });
  it("localises labels", () => {
    expect(filterCommands(buildCommands("es"), "cafetal").map((c) => c.id)).toEqual(["theme-cafetal"]);
  });
});
