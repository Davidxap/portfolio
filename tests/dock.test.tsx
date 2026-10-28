import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Dock } from "@/components/world/Dock";
import { places } from "@/data/places";

// next/link renders hrefs without the configured trailing slash outside a Next runtime
const bare = (h: string | null) => (h ?? "").replace(/\/$/, "");

describe("dock", () => {
  for (const locale of ["en", "es"] as const) {
    it(`links the six places with the right hrefs (${locale})`, () => {
      const { container } = render(<Dock locale={locale} current={null} pressed={null} windowOpen={false} onEsc={() => {}} />);
      const links = Array.from(container.querySelectorAll<HTMLAnchorElement>("a.key-place"));
      expect(links.map((a) => bare(a.getAttribute("href")))).toEqual(places.map((p) => bare(p.path[locale])));
      expect(links.map((a) => a.getAttribute("aria-keyshortcuts"))).toEqual(["1", "2", "3", "4", "5", "6"]);
    });
  }
  it("marks the active place with aria-current and the walker is aria-hidden", () => {
    const { container } = render(<Dock locale="en" current="projects" pressed={null} windowOpen onEsc={() => {}} />);
    const cur = container.querySelectorAll("[aria-current='page']");
    expect(cur).toHaveLength(1);
    expect(bare(cur[0].getAttribute("href"))).toBe(bare(places.find((p) => p.id === "projects")!.path.en));
    expect(container.querySelector(".walker")?.getAttribute("aria-hidden")).toBe("true");
  });
  it("flags the pressed keycap", () => {
    const { container } = render(<Dock locale="en" current={null} pressed="p2" windowOpen={false} onEsc={() => {}} />);
    expect(container.querySelectorAll("[data-pressed='true']")).toHaveLength(1);
    expect(container.querySelectorAll("a.key-place")[2].getAttribute("data-pressed")).toBe("true");
  });
  it("Esc is disabled on the empty desktop and closes the front window otherwise", () => {
    const on = vi.fn();
    const a = render(<Dock locale="en" current={null} pressed={null} windowOpen={false} onEsc={on} />);
    const esc = a.getByRole("button", { name: "Close the window (Esc)" });
    expect(esc.getAttribute("aria-disabled")).toBe("true");
    expect(esc.textContent).not.toContain("Desk");
    fireEvent.click(esc);
    expect(on).not.toHaveBeenCalled();
    a.unmount();
    const b = render(<Dock locale="es" current="about" pressed={null} windowOpen onEsc={on} />);
    const close = b.getByRole("button", { name: "Cerrar la ventana (Esc)" });
    expect(close.getAttribute("aria-disabled")).toBeNull();
    expect(close.textContent).toContain("Cerrar");
    fireEvent.click(close);
    expect(on).toHaveBeenCalledTimes(1);
  });
});
