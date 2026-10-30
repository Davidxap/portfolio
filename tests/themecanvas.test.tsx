import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import { ThemeCanvas } from "@/components/world/ThemeCanvas";

/** A just-enough 2D context: every method is a spy, gradients accept colour stops. */
function fake2d() {
  const grad = { addColorStop: vi.fn() };
  return new Proxy({ createRadialGradient: () => grad, createLinearGradient: () => grad, fillStyle: "#000000" } as Record<string, unknown>, {
    get: (t, k: string) => (k in t ? t[k] : vi.fn()),
    set: (t, k: string, v) => { t[k] = v; return true; },
  });
}
const mq = (q: string) => ({ matches: false, media: q, addEventListener: vi.fn(), removeEventListener: vi.fn(), addListener: vi.fn(), removeListener: vi.fn(), onchange: null, dispatchEvent: vi.fn() }) as unknown as MediaQueryList;
class Obs { observe() {} disconnect() {} unobserve() {} constructor(public cb?: unknown) {} }

describe("ThemeCanvas", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal("ResizeObserver", Obs);
    vi.stubGlobal("IntersectionObserver", Obs);
    vi.stubGlobal("matchMedia", mq);
    document.documentElement.dataset.theme = "nevado";
  });
  afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); vi.restoreAllMocks(); });

  it("renders a decorative canvas and never throws when 2D canvas is unavailable", () => {
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
    const { container, unmount } = render(<div><ThemeCanvas place="window" /></div>);
    expect(container.querySelector("canvas.fx-canvas")).toHaveAttribute("aria-hidden", "true");
    expect(() => unmount()).not.toThrow();
  });

  it("waits for the page to settle before animating", () => {
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(fake2d() as never);
    const raf = vi.spyOn(window, "requestAnimationFrame").mockImplementation(() => 1);
    const { container } = render(<div><ThemeCanvas place="page" /></div>);
    expect(raf).not.toHaveBeenCalled();
    vi.advanceTimersByTime(800);
    expect(raf).toHaveBeenCalled();
    expect(container.querySelector("canvas")).toHaveAttribute("data-live", "true");
  });

  it.each(["chipre", "paramo", "tinto", "cafetal", "niebla", "nevado", "cable", "catedral"])("runs the %s effect, takes a click burst and stops on unmount", (theme) => {
    document.documentElement.dataset.theme = theme;
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(fake2d() as never);
    let pending: FrameRequestCallback | null = null;
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => { pending = cb; return 1; });
    const cancel = vi.spyOn(window, "cancelAnimationFrame");
    const { container, unmount } = render(<div className="direct"><span className="bare" /><ThemeCanvas place="page" /></div>);
    vi.advanceTimersByTime(800);
    const tick = (ms: number) => { const cb = pending; pending = null; cb?.(ms); };
    expect(() => { for (let i = 1; i <= 4; i++) tick(i * 16); }).not.toThrow();
    container.querySelector(".bare")!.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, clientX: 0, clientY: 0 }));
    expect(() => tick(90)).not.toThrow();
    unmount();
    expect(cancel).toHaveBeenCalled();
  });
});
