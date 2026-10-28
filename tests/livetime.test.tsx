import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { LiveTime, formatManizales } from "@/components/world/LiveTime";

describe("LiveTime", () => {
  it("always formats in America/Bogota, whatever the visitor's zone", () => {
    const d = new Date("2026-10-28T01:45:00Z");
    expect(formatManizales(d)).toBe(new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "America/Bogota" }).format(d));
    expect(formatManizales(d)).toBe("20:45");
  });
  it("labels the time element with title and aria-label", () => {
    const { container } = render(<LiveTime label="Local time in Manizales (UTC-5)" />);
    const el = container.querySelector("time")!;
    expect(el).toHaveAttribute("title", "Local time in Manizales (UTC-5)");
    expect(el).toHaveAttribute("aria-label", "Local time in Manizales (UTC-5)");
  });
});
