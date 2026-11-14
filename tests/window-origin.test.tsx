import { render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AppWindow } from "@/components/world/AppWindow";

const rect = (left: number, top: number, width: number, height: number) => ({ left, top, width, height, right: left + width, bottom: top + height, x: left, y: top, toJSON() {} }) as DOMRect;

afterEach(() => { vi.restoreAllMocks(); document.body.innerHTML = ""; });

describe("window entrance origin", () => {
  it("scales from the centre of its pin on the wallpaper", () => {
    document.body.insertAdjacentHTML("beforeend", '<a data-pin="about"></a>');
    vi.spyOn(Element.prototype, "getBoundingClientRect").mockImplementation(function (this: Element) {
      return this.matches("[data-pin]") ? rect(1300, 400, 20, 20) : rect(100, 60, 600, 700);
    });
    const { container } = render(<AppWindow app="about" focus locale="en">body</AppWindow>);
    expect(container.querySelector<HTMLElement>(".win")!.style.transformOrigin).toBe("1210px 350px");
  });
  it("keeps the default origin when no pin is on the page", () => {
    const { container } = render(<AppWindow app="about" focus locale="en">body</AppWindow>);
    expect(container.querySelector<HTMLElement>(".win")!.style.transformOrigin).toBe("");
  });
});
