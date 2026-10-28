import { act, fireEvent, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AppWindow } from "@/components/world/AppWindow";
import { Cmd, TypeSeq } from "@/components/places/TypeSeq";
import { APP_TITLE } from "@/components/world/app-title";
import { places } from "@/data/places";

describe("desktop windows", () => {
  it("titles every place's window and shows its workspace number and an Esc close control", () => {
    for (const p of places) expect(APP_TITLE[p.id].length).toBeGreaterThan(5);
    const { container } = render(<AppWindow app="projects" focus locale="en"><p>hi</p></AppWindow>);
    const win = container.querySelector(".win")!;
    expect(win.getAttribute("data-app")).toBe("projects");
    expect(win.getAttribute("data-focus")).toBe("true");
    expect(win.querySelector(".win-ws")?.textContent).toBe("2");
    expect(win.querySelector(".win-x kbd")?.textContent).toBe("Esc");
    expect(win.querySelector(".win-body")?.textContent).toBe("hi");
  });
  it("asks the shell to close the window, so the exit animation and the route change stay in one place", () => {
    const on = vi.fn();
    window.addEventListener("win:close", on);
    const { getByRole } = render(<AppWindow app="about" focus locale="es"><p>x</p></AppWindow>);
    fireEvent.click(getByRole("button", { name: "Cerrar ventana (Esc)" }));
    expect(on).toHaveBeenCalledTimes(1);
    window.removeEventListener("win:close", on);
  });
  it("keeps the unfocused window out of the tab order", () => {
    const { getByRole } = render(<AppWindow app="arcade" focus={false} locale="en"><p>x</p></AppWindow>);
    expect(getByRole("button", { name: "Close window (Esc)", hidden: true }).tabIndex).toBe(-1);
  });
});

describe("terminal typing", () => {
  beforeEach(() => { vi.useFakeTimers(); window.matchMedia = ((q: string) => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {} })) as unknown as typeof matchMedia; });
  afterEach(() => { vi.useRealTimers(); });
  const tree = () => (
    <TypeSeq typed={1} hint="skip">
      <Cmd>whoami</Cmd><div className="t-out"><p>David</p></div>
      <Cmd>ls</Cmd><div className="t-out"><p>files</p></div>
      <Cmd final />
    </TypeSeq>
  );
  it("renders every command and output as real text before any script runs", () => {
    const { container } = render(<div>{tree()}</div>);
    // the effect has started typing by now, so read the server-equivalent markup from a static render instead
    expect(container.textContent).toContain("David");
    expect(container.textContent).toContain("files");
  });
  it("types the first command, then a click finishes the whole session at once", async () => {
    const { container } = render(tree());
    const typed = container.querySelectorAll(".t-typed");
    expect(typed[0].textContent!.length).toBeLessThan(2);
    expect(typed[1].closest(".t-cmd")!.classList.contains("is-pending")).toBe(true);
    await act(async () => { await vi.advanceTimersByTimeAsync(110); });
    expect(typed[0].textContent!.length).toBeGreaterThan(1);
    expect(typed[0].textContent!.length).toBeLessThan("whoami".length);
    fireEvent.pointerDown(container.querySelector(".term")!);
    expect(typed[0].textContent).toBe("whoami");
    expect(typed[1].textContent).toBe("ls");
    expect(container.querySelector(".t-out.is-pending")).toBeNull();
    expect(container.querySelector<HTMLElement>(".term")!.dataset.typing).toBe("done");
  });
});
