import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { games } from "@/data/games";
import { HowTo, useHowTo } from "@/components/console/HowTo";

function Harness({ id, locale }: { id: string; locale: "en" | "es" }) {
  const how = useHowTo(id);
  return <div className="dm"><HowTo id={id} locale={locale} how={how} /><p>game</p></div>;
}

describe("every game explains itself", () => {
  it("has a goal, 2 or 3 steps and the controls, in both locales, with no CJK", () => {
    for (const g of games) {
      expect(g.howTo, g.id).toBeDefined();
      for (const l of ["en", "es"] as const) {
        expect(g.howTo!.goal[l].length, `${g.id} goal ${l}`).toBeGreaterThan(12);
        expect(g.howTo!.steps.length, g.id).toBeGreaterThanOrEqual(2);
        expect(g.howTo!.steps.length, g.id).toBeLessThanOrEqual(3);
        for (const s of g.howTo!.steps) expect(s[l].length, `${g.id} step ${l}`).toBeGreaterThan(8);
        expect(g.howTo!.controls[l].length, `${g.id} controls ${l}`).toBeGreaterThan(8);
      }
      expect(JSON.stringify(g.howTo)).not.toMatch(/[぀-ヿ㐀-鿿]/);
    }
  });
  it("never mentions an A or B button", () => {
    for (const g of games) expect(JSON.stringify(g.howTo), g.id).not.toMatch(/\b[AB] button|botón [AB]\b/);
  });
});

describe("the how-to overlay", () => {
  it("opens first, hides with Got it and reopens with the ? button", async () => {
    sessionStorage.clear();
    const user = userEvent.setup();
    render(<Harness id="zen" locale="en" />);
    expect(screen.getByRole("dialog", { name: "How to play" })).toBeInTheDocument();
    expect(screen.getAllByRole("listitem").length).toBeGreaterThanOrEqual(2);
    await user.click(screen.getByRole("button", { name: "Got it" }));
    expect(screen.queryByRole("dialog")).toBeNull();
    await user.click(screen.getByRole("button", { name: "How to play" }));
    expect(screen.getByRole("dialog", { name: "How to play" })).toBeInTheDocument();
  });
  it("speaks Spanish and stays hidden once dismissed in this session", async () => {
    sessionStorage.clear();
    const user = userEvent.setup();
    const { unmount } = render(<Harness id="films" locale="es" />);
    expect(screen.getByRole("dialog", { name: "Cómo se juega" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Entendido" }));
    unmount();
    render(<Harness id="films" locale="es" />);
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(screen.getByRole("button", { name: "Cómo se juega" })).toBeInTheDocument();
  });
});
