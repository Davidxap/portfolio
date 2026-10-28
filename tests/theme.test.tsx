import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeMenu } from "@/components/ThemeMenu";
import { currentTheme, DEFAULT_THEME, THEME_INIT_SCRIPT } from "@/lib/theme";

const NAMES = ["Chipre", "Páramo", "Tinto", "Cafetal", "Niebla", "Nevado", "Cable", "Catedral"];
const names = () => screen.getAllByRole("option").map((o) => o.getAttribute("aria-label"));

beforeEach(() => { localStorage.clear(); document.documentElement.dataset.theme = "chipre"; });

describe("default theme (Chipre)", () => {
  const runInit = () => { document.documentElement.dataset.theme = "cable"; new Function(THEME_INIT_SCRIPT)(); return document.documentElement.dataset.theme; };
  it("is Chipre on first entry and the trigger shows it", () => {
    expect(DEFAULT_THEME).toBe("chipre");
    expect(currentTheme()).toBe("chipre");
    expect(runInit()).toBe("chipre");
    render(<ThemeMenu locale="en" />);
    expect(screen.getByRole("button", { name: /Chipre/ })).toBeInTheDocument();
  });
  it("a stored choice wins, legacy ids migrate and are rewritten, garbage falls back to Chipre", () => {
    localStorage.setItem("theme", "nevado");
    expect(runInit()).toBe("nevado");
    for (const [old, now] of [["dusk", "chipre"], ["dawn", "paramo"], ["night", "cable"]]) {
      localStorage.setItem("theme", old);
      expect(runInit()).toBe(now);
      expect(localStorage.getItem("theme")).toBe(now);
    }
    localStorage.setItem("theme", "nope");
    expect(runInit()).toBe("chipre");
  });
});

describe("theme menu", () => {
  it("lists the eight themes in order with taglines; selecting one sets data-theme and persists it", async () => {
    const user = userEvent.setup();
    render(<ThemeMenu locale="en" />);
    await user.click(screen.getByRole("button", { name: /Chipre/ }));
    expect(names()).toEqual(NAMES);
    expect(screen.getByRole("option", { name: "Cafetal" })).toHaveTextContent("Jade rows of the coffee farm");
    await user.click(screen.getByRole("option", { name: "Páramo" }));
    expect(document.documentElement.dataset.theme).toBe("paramo");
    expect(localStorage.getItem("theme")).toBe("paramo");
    expect(screen.queryByRole("listbox")).toBeNull();
  });

  it("shows Spanish taglines", async () => {
    const user = userEvent.setup();
    render(<ThemeMenu locale="es" />);
    await user.click(screen.getByRole("button"));
    expect(screen.getByRole("option", { name: "Tinto" })).toHaveTextContent("Un tinto para conversarlo");
  });

  it("marks the selected tile and keeps the aria contract", async () => {
    const user = userEvent.setup();
    render(<ThemeMenu locale="en" />);
    const btn = screen.getByRole("button");
    expect(btn).toHaveAttribute("aria-haspopup", "listbox");
    expect(btn).toHaveAttribute("aria-expanded", "false");
    await user.click(btn);
    expect(btn).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("option", { name: "Chipre" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getAllByRole("option").filter((o) => o.getAttribute("aria-selected") === "true")).toHaveLength(1);
  });

  it("keyboard: Enter opens, Left/Right move 1, Up/Down move 2, Home/End jump, Enter selects, Escape closes and returns focus", async () => {
    const user = userEvent.setup();
    render(<ThemeMenu locale="es" />);
    const btn = screen.getByRole("button");
    btn.focus();
    await user.keyboard("{Enter}");
    const list = screen.getByRole("listbox");
    const act = () => list.getAttribute("aria-activedescendant")!.split("-").pop();
    expect(act()).toBe("chipre");
    await user.keyboard("{ArrowRight}");
    expect(act()).toBe("paramo");
    await user.keyboard("{ArrowDown}");
    expect(act()).toBe("cafetal");
    await user.keyboard("{ArrowLeft}");
    expect(act()).toBe("tinto");
    await user.keyboard("{ArrowUp}");
    expect(act()).toBe("chipre");
    await user.keyboard("{End}");
    expect(act()).toBe("catedral");
    await user.keyboard("{Home}");
    expect(act()).toBe("chipre");
    await user.keyboard("{ArrowDown}{ArrowDown}{ArrowRight}{Enter}");
    expect(document.documentElement.dataset.theme).toBe("nevado");
    expect(btn).toHaveFocus();
    await user.keyboard("{Enter}{Escape}");
    expect(screen.queryByRole("listbox")).toBeNull();
    expect(btn).toHaveFocus();
  });

  it("Space selects the active tile", async () => {
    const user = userEvent.setup();
    render(<ThemeMenu locale="en" />);
    screen.getByRole("button").focus();
    await user.keyboard("{Enter}{ArrowRight}{ArrowRight}{ }");
    expect(document.documentElement.dataset.theme).toBe("tinto");
  });
});
