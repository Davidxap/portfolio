import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { Wallpaper, phaseAt } from "@/components/world/Wallpaper";

beforeEach(() => {
  window.matchMedia = ((q: string) => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {} })) as unknown as typeof matchMedia;
});

const wall = (props: Partial<Parameters<typeof Wallpaper>[0]> = {}) =>
  render(<Wallpaper locale="en" active={null} selected={null} visited={[]} onPinFocus={() => {}} {...props} />).container;

describe("the painting follows Manizales time", () => {
  it("maps the Manizales hour to dawn, day, dusk and night at the edges", () => {
    expect(phaseAt("04:59")).toBe("night");
    expect(phaseAt("05:00")).toBe("dawn");
    expect(phaseAt("07:00")).toBe("day");
    expect(phaseAt("16:59")).toBe("day");
    expect(phaseAt("17:00")).toBe("dusk");
    expect(phaseAt("19:00")).toBe("night");
    expect(phaseAt("--:--")).toBe("dusk");
  });

  it("puts the phase on the effects layer", () => {
    expect(wall().querySelector(".wp-fx")?.getAttribute("data-phase")).toMatch(/^(dawn|day|dusk|night)$/);
  });
});
