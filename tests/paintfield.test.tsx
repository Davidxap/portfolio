import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { PaintField } from "@/components/world/PaintField";

/** A just-enough WebGL stub: every call succeeds, the program links. */
function fakeGl() {
  return new Proxy({ getProgramParameter: () => true, getExtension: () => ({ loseContext: vi.fn() }) } as Record<string, unknown>, {
    get: (t, k: string) => (k in t ? t[k] : typeof k === "string" && /^[A-Z_0-9]+$/.test(k) ? 1 : vi.fn(() => ({}))),
  });
}
const mq = (reduce: boolean) => (q: string) => ({ matches: reduce && q.includes("reduce"), media: q, addEventListener: vi.fn(), removeEventListener: vi.fn(), addListener: vi.fn(), removeListener: vi.fn(), onchange: null, dispatchEvent: vi.fn() }) as unknown as MediaQueryList;

class Obs { observe() {} disconnect() {} unobserve() {} constructor(public cb?: unknown) {} }

describe("PaintField", () => {
  beforeEach(() => {
    vi.stubGlobal("ResizeObserver", Obs);
    vi.stubGlobal("IntersectionObserver", Obs);
    vi.stubGlobal("matchMedia", mq(false));
  });
  afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); });

  it("renders the CSS fallback on the server so the page is never blank", () => {
    const html = renderToString(<PaintField />);
    expect(html).toContain('data-shader="css"');
    expect(html).toContain("paintfield");
    expect(html).toContain('aria-hidden="true"');
  });

  it("never throws and stays on the fallback when WebGL is unavailable", () => {
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
    const { container, unmount } = render(<PaintField />);
    expect(container.querySelector(".paintfield")).toHaveAttribute("data-shader", "css");
    expect(() => unmount()).not.toThrow();
  });

  it("paints one still frame, starts no animation loop before the first interaction, and animates after it", () => {
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(fakeGl() as never);
    const raf = vi.spyOn(window, "requestAnimationFrame").mockImplementation(() => 1);
    const { container } = render(<PaintField />);
    expect(container.querySelector(".paintfield")).toHaveAttribute("data-shader", "on");
    expect(raf).not.toHaveBeenCalled();
    window.dispatchEvent(new Event("pointermove"));
    expect(raf).toHaveBeenCalled();
  });

  it("is static under prefers-reduced-motion: no rAF loop even after interaction", () => {
    vi.stubGlobal("matchMedia", mq(true));
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(fakeGl() as never);
    const raf = vi.spyOn(window, "requestAnimationFrame").mockImplementation(() => 1);
    const { container } = render(<PaintField />);
    window.dispatchEvent(new Event("pointermove"));
    window.dispatchEvent(new Event("scroll"));
    expect(container.querySelector(".paintfield")).toHaveAttribute("data-shader", "on");
    expect(raf).not.toHaveBeenCalled();
  });

  it("removes every listener and the loop on unmount", () => {
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(fakeGl() as never);
    vi.spyOn(window, "requestAnimationFrame").mockImplementation(() => 7);
    const cancel = vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => {});
    const add = vi.spyOn(window, "addEventListener");
    const remove = vi.spyOn(window, "removeEventListener");
    const { unmount } = render(<PaintField />);
    window.dispatchEvent(new Event("pointermove"));
    const added = new Set(add.mock.calls.map((c) => c[0]));
    unmount();
    const removed = new Set(remove.mock.calls.map((c) => c[0]));
    for (const e of ["pointermove", "pointerdown", "scroll", "keydown", "touchstart"]) { expect(added.has(e)).toBe(true); expect(removed.has(e)).toBe(true); }
    expect(cancel).toHaveBeenCalled();
  });
});
