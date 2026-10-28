import { describe, expect, it } from "vitest";
import { filterProjects } from "@/lib/project-select";

const items = [{ id: 1, category: "full-stack" }, { id: 2, category: "tools" }, { id: 3, category: "full-stack" }, { id: 4, category: "learning" }];
describe("project filters", () => {
  it("keeps all in order, or one group", () => {
    expect(filterProjects(items, "all")).toHaveLength(4);
    expect(filterProjects(items, "full-stack").map((p) => p.id)).toEqual([1, 3]);
    expect(filterProjects(items, "learning").map((p) => p.id)).toEqual([4]);
  });
});
