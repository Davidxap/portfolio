import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { BrandMark, MUG } from "@/components/world/BrandMark";
import { ArtIcon } from "@/components/world/icons";

describe("brand mark and CV icon", () => {
  it("draws a 16 px square grid, hidden from assistive tech, at the requested size", () => {
    expect(MUG).toHaveLength(16);
    for (const r of MUG) expect(r).toHaveLength(16);
    const { container } = render(<BrandMark size={14} className="x" />);
    const svg = container.querySelector("svg")!;
    expect(svg).toHaveAttribute("aria-hidden", "true");
    expect(svg).toHaveAttribute("width", "14");
    expect(svg).toHaveClass("x");
  });
  it("bare drops the dark tile and follows the theme; tile keeps it", () => {
    const bare = render(<BrandMark />).container.querySelectorAll("rect");
    const tile = render(<BrandMark variant="tile" />).container.querySelectorAll("rect");
    expect(tile.length).toBeGreaterThan(bare.length);
    expect(Array.from(bare).every((r) => !/#16120f/i.test(r.getAttribute("style") ?? ""))).toBe(true);
    expect(Array.from(bare).some((r) => (r.getAttribute("style") ?? "").includes("var(--accent)"))).toBe(true);
  });
  it("renders the CV icon as an inline currentColor svg, not a raster", () => {
    const { container } = render(<ArtIcon name="cv" size={20} />);
    expect(container.querySelector("img")).toBeNull();
    const svg = container.querySelector("svg")!;
    expect(svg).toHaveAttribute("stroke", "currentColor");
    expect(svg).toHaveAttribute("width", "20");
  });
});
