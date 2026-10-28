import { describe, expect, it } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { Coach, Guide, GUIDE_KEY } from "@/components/world/Guide";
import { WorldIntro } from "@/components/world/WorldIntro";

describe("guide dialog (the ? button in the top bar)", () => {
  it("is closed at first and opens a labelled dialog with the four rows", () => {
    render(<Guide locale="en" />);
    const btn = screen.getByRole("button", { name: "How to move around" });
    expect(btn.getAttribute("aria-haspopup")).toBe("dialog");
    expect(btn.getAttribute("aria-expanded")).toBe("false");
    expect(screen.queryByRole("dialog")).toBeNull();
    fireEvent.click(btn);
    const dlg = screen.getByRole("dialog", { name: "How to move around" });
    expect(dlg.querySelectorAll("li")).toHaveLength(4);
    expect(dlg.textContent).toContain("Click the glowing points on the painting, or press 1-6");
    expect(dlg.textContent).toContain("closes the window in front");
    expect(dlg.textContent).toContain("Interactive / Direct (top bar)");
    expect(dlg.textContent).toContain("Theme, language and sound");
    expect(btn.getAttribute("aria-expanded")).toBe("true");
  });
  it("speaks Spanish", () => {
    render(<Guide locale="es" />);
    fireEvent.click(screen.getByRole("button", { name: "Cómo moverte" }));
    const dlg = screen.getByRole("dialog", { name: "Cómo moverte" });
    expect(dlg.textContent).toContain("Haz clic en los puntos de la pintura o pulsa 1-6");
    expect(dlg.textContent).toContain("Esc");
    expect(dlg.textContent).toContain("cierra la ventana al frente");
  });
  it("Esc closes it first (the event is consumed so the shell does not also close a window) and focus returns to the button", () => {
    render(<Guide locale="en" />);
    const btn = screen.getByRole("button", { name: "How to move around" });
    fireEvent.click(btn);
    const ev = new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true });
    act(() => { document.body.dispatchEvent(ev); });
    expect(ev.defaultPrevented).toBe(true);
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(document.activeElement).toBe(btn);
    const again = new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true });
    act(() => { document.body.dispatchEvent(again); });
    expect(again.defaultPrevented).toBe(false);
  });
  it("closes with the button again and on an outside click", () => {
    render(<Guide locale="en" />);
    const btn = screen.getByRole("button", { name: "How to move around" });
    fireEvent.click(btn);
    fireEvent.click(btn);
    expect(screen.queryByRole("dialog")).toBeNull();
    fireEvent.click(btn);
    fireEvent.pointerDown(document.body);
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});

describe("coach card (first visit only)", () => {
  it("shows the first three rows once, and Got it remembers the dismissal", () => {
    const a = render(<Coach locale="en" />);
    const card = screen.getByRole("region", { name: "How to move around" });
    expect(card.querySelectorAll("li")).toHaveLength(3);
    expect(card.textContent).not.toContain("Theme, language and sound");
    fireEvent.click(screen.getByRole("button", { name: "Got it" }));
    expect(screen.queryByRole("region", { name: "How to move around" })).toBeNull();
    expect(localStorage.getItem(GUIDE_KEY)).toBe("1");
    expect(GUIDE_KEY).toBe("guide-seen");
    a.unmount();
    render(<Coach locale="en" />);
    expect(screen.queryByRole("region", { name: "How to move around" })).toBeNull();
  });
  it("is not shown while a window is open, and comes back when the desktop is empty again", () => {
    const { rerender } = render(<Coach locale="es" hidden />);
    expect(screen.queryByRole("region", { name: "Cómo moverte" })).toBeNull();
    rerender(<Coach locale="es" />);
    expect(screen.getByRole("button", { name: "Entendido" })).toBeTruthy();
    expect(localStorage.getItem(GUIDE_KEY)).toBeNull();
  });
  it("still shows (and does not throw) when storage is unavailable", () => {
    const orig = Storage.prototype.getItem;
    Storage.prototype.getItem = () => { throw new Error("blocked"); };
    try {
      render(<Coach locale="en" />);
      expect(screen.getByRole("button", { name: "Got it" })).toBeTruthy();
    } finally { Storage.prototype.getItem = orig; }
  });
});

describe("home route headings", () => {
  it.each(["en", "es"] as const)("the identity widget carries the page's only h1 (%s)", (locale) => {
    const { container } = render(<WorldIntro locale={locale} />);
    expect(container.querySelectorAll("h1")).toHaveLength(1);
    expect(container.querySelectorAll("h2")).toHaveLength(0);
    expect(container.querySelector("h1")?.textContent).toContain("David");
  });
});
