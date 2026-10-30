import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { SteamCanvas } from "@/components/world/SteamCanvas";
import { Settings } from "@/components/world/TopBar";
import { MOTION_INIT_SCRIPT, isMotionPaused, setMotionPaused } from "@/lib/motion";

/** A just-enough 2D context: every method is a spy. */
function fake2d() {
  return new Proxy({} as Record<string, unknown>, {
    get: (t, k: string) => (k in t ? t[k] : vi.fn()),
    set: (t, k: string, v) => { t[k] = v; return true; },
  });
}
const mq = (q: string) => ({ matches: false, media: q, addEventListener: vi.fn(), removeEventListener: vi.fn(), addListener: vi.fn(), removeListener: vi.fn(), onchange: null, dispatchEvent: vi.fn() }) as unknown as MediaQueryList;
class Obs { observe() {} disconnect() {} unobserve() {} constructor(public cb?: unknown) {} }

describe("steam over the mug", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal("ResizeObserver", Obs);
    vi.stubGlobal("IntersectionObserver", Obs);
    vi.stubGlobal("matchMedia", mq);
  });
  afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); vi.restoreAllMocks(); delete document.documentElement.dataset.motion; localStorage.clear(); });

  it("never throws without a 2D canvas", () => {
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
    const { container, unmount } = render(<div><SteamCanvas /></div>);
    expect(container.querySelector("canvas")).toHaveAttribute("aria-hidden", "true");
    expect(() => unmount()).not.toThrow();
  });

  it("starts once the page settles, keeps curling, and stops on unmount", () => {
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(fake2d() as never);
    let pending: FrameRequestCallback | null = null;
    const raf = vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => { pending = cb; return 1; });
    const cancel = vi.spyOn(window, "cancelAnimationFrame");
    const { unmount } = render(<div><SteamCanvas /></div>);
    expect(raf).not.toHaveBeenCalled();
    vi.advanceTimersByTime(800);
    expect(() => { for (let i = 1; i <= 400; i++) { const cb = pending; pending = null; (cb as FrameRequestCallback | null)?.(i * 50); } }).not.toThrow();
    expect(pending).not.toBeNull();
    unmount();
    expect(cancel).toHaveBeenCalled();
  });

  it("does not animate while motion is paused", () => {
    document.documentElement.dataset.motion = "paused";
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(fake2d() as never);
    const raf = vi.spyOn(window, "requestAnimationFrame").mockImplementation(() => 1);
    render(<div><SteamCanvas /></div>);
    vi.advanceTimersByTime(800);
    expect(raf).not.toHaveBeenCalled();
  });
});

describe("motion toggle", () => {
  afterEach(() => { delete document.documentElement.dataset.motion; localStorage.clear(); });

  it("pauses and resumes decorative motion, marks <html> and remembers the choice", () => {
    setMotionPaused(true);
    expect(isMotionPaused()).toBe(true);
    expect(document.documentElement.dataset.motion).toBe("paused");
    expect(localStorage.getItem("motion-paused")).toBe("1");
    setMotionPaused(false);
    expect(isMotionPaused()).toBe(false);
    expect(document.documentElement).not.toHaveAttribute("data-motion");
    expect(localStorage.getItem("motion-paused")).toBe("0");
  });

  it("restores a paused choice before first paint", () => {
    localStorage.setItem("motion-paused", "1");
    new Function(MOTION_INIT_SCRIPT)();
    expect(document.documentElement.dataset.motion).toBe("paused");
  });

  it("is a labelled toggle button in the settings cluster, in both languages", () => {
    const { unmount } = render(<Settings locale="en" altPath="/es/" />);
    const btn = screen.getByRole("button", { name: "Pause animations" });
    expect(btn).toHaveAttribute("aria-pressed", "false");
    fireEvent.click(btn);
    expect(btn).toHaveAttribute("aria-pressed", "true");
    expect(document.documentElement.dataset.motion).toBe("paused");
    unmount();
    render(<Settings locale="es" altPath="/" />);
    expect(screen.getByRole("button", { name: "Pausar animaciones" })).toHaveAttribute("aria-pressed", "true");
  });
});
