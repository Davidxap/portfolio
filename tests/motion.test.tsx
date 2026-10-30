import { afterEach, describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { Settings } from "@/components/world/TopBar";
import { MOTION_INIT_SCRIPT, isMotionPaused, setMotionPaused } from "@/lib/motion";

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
