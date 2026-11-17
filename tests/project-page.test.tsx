import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { projects } from "@/data/projects";
import { ProjectPage } from "@/components/ProjectPage";

const tcg = projects.find((p) => p.slug === "tcg-store")!;

describe("project page with a deep dive", () => {
  it("shows the architecture decisions before the feature inventory", () => {
    const { container } = render(<ProjectPage locale="en" project={tcg} />);
    const arch = container.querySelector(".arch")!;
    const deep = container.querySelector(".deep")!;
    expect(arch.compareDocumentPosition(deep) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });
  it("keeps every inventory area collapsed, with its title and lead as the summary", () => {
    const { container } = render(<ProjectPage locale="es" project={tcg} />);
    const areas = [...container.querySelectorAll<HTMLDetailsElement>(".deep details")];
    expect(areas).toHaveLength(tcg.deep!.length);
    areas.forEach((d, i) => {
      expect(d.open).toBe(false);
      expect(d.querySelector("summary")!.textContent).toContain(tcg.deep![i].title.es);
      expect(d.querySelector("summary")!.textContent).toContain(tcg.deep![i].lead.es);
      expect(d.querySelectorAll("li")).toHaveLength(tcg.deep![i].points.length);
    });
  });
  it("still renders a project without a deep dive", () => {
    const plain = projects.find((p) => !p.deep)!;
    const { container } = render(<ProjectPage locale="en" project={plain} />);
    expect(container.querySelector(".deep")).toBeNull();
    expect(container.querySelector("h1")!.textContent).toBe(plain.name);
  });
});
