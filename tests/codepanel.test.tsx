import { useState } from "react";
import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CodePanel } from "@/components/console/CodePanel";
import { parseWalkthrough } from "@/lib/walkthrough";

const { code, steps } = parseWalkthrough([
  "const a = 1;",
  "// @step one: First thing.",
  "// @paso one: Primera cosa.",
  "const b = 2;",
  "const c = 3;",
  "// @step two: Second thing.",
  "// @paso two: Segunda cosa.",
  "return b + c;",
].join("\n"));

function Harness({ locale = "en", start = null }: { locale?: "en" | "es"; start?: string | null }) {
  const [active, setActive] = useState<string | null>(start);
  return <CodePanel code={code} steps={steps} active={active} onSelect={setActive} locale={locale} caption="Code" note="Note" />;
}
const on = (c: HTMLElement) => [...c.querySelectorAll('.cs-line[data-on="true"]')].map((l) => l.getAttribute("data-line"));

describe("CodePanel walkthrough", () => {
  it("marks the active step with aria-current and highlights only its lines", () => {
    const { container } = render(<Harness start="one" />);
    expect(screen.getByRole("button", { name: /First thing/ })).toHaveAttribute("aria-current", "step");
    expect(screen.getByRole("button", { name: /Second thing/ })).not.toHaveAttribute("aria-current");
    expect(on(container)).toEqual(["2", "3"]);
    expect(container.querySelector(".cs-src")).toHaveAttribute("data-has-step", "true");
  });

  it("highlights nothing when no step is active", () => {
    const { container } = render(<Harness />);
    expect(on(container)).toEqual([]);
    expect(container.querySelector(".cs-src")).toHaveAttribute("data-has-step", "false");
  });

  it("clicking a step selects it", async () => {
    const user = userEvent.setup();
    const { container } = render(<Harness start="one" />);
    await user.click(screen.getByRole("button", { name: /Second thing/ }));
    expect(screen.getByRole("button", { name: /Second thing/ })).toHaveAttribute("aria-current", "step");
    expect(on(container)).toEqual(["4"]);
  });

  it("shows the explanations in the current locale", () => {
    render(<Harness locale="es" />);
    const list = screen.getByRole("list", { name: "Recorrido" });
    expect(within(list).getByRole("button", { name: /Primera cosa/ })).toBeInTheDocument();
  });

  it("keeps the code text intact across line spans", () => {
    const { container } = render(<Harness />);
    const lines = [...container.querySelectorAll(".cs-line")].map((l) => l.textContent);
    expect(lines).toEqual(code.split("\n"));
  });
});
