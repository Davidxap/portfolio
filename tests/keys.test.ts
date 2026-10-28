import { describe, expect, it } from "vitest";
import { resolveKey, type Target } from "@/lib/keys";

const t = (o: Partial<Target> = {}): Target => ({ typing: false, interactive: false, pin: false, neutral: true, body: true, ...o });

describe("world keys", () => {
  it("jumps to a place with 1-6 and ignores 7+", () => {
    expect(resolveKey({ key: "3" }, "home", t())).toEqual({ type: "place", index: 2 });
    expect(resolveKey({ key: "6" }, "place", t())).toEqual({ type: "place", index: 5 });
    expect(resolveKey({ key: "7" }, "place", t())).toBeNull();
  });
  it("never takes scroll keys from a focused panel", () => {
    for (const key of ["ArrowDown", "ArrowUp", "PageDown", "PageUp", " ", "Home", "End"]) {
      expect(resolveKey({ key }, "place", t({ body: false, neutral: true }))).toBeNull();
      expect(resolveKey({ key }, "direct", t({ body: false }))).toBeNull();
    }
  });
  it("scrolls by hand only when nothing is focused", () => {
    expect(resolveKey({ key: "PageDown" }, "place", t())).toEqual({ type: "scroll", dy: 0.85 });
    expect(resolveKey({ key: "ArrowUp" }, "place", t())).toEqual({ type: "scroll", dy: -60 });
  });
  it("arrows switch places only when nothing more specific has focus", () => {
    expect(resolveKey({ key: "ArrowRight" }, "place", t({ body: false, neutral: true }))).toEqual({ type: "move", dir: "right" });
    expect(resolveKey({ key: "ArrowRight" }, "place", t({ body: false, neutral: false, interactive: true }))).toBeNull();
  });
  it("leaves text fields, modifiers and Enter on links alone; Esc goes back except on the map", () => {
    expect(resolveKey({ key: "1" }, "home", t({ typing: true }))).toBeNull();
    expect(resolveKey({ key: "ArrowLeft", ctrlKey: true }, "place", t())).toBeNull();
    expect(resolveKey({ key: "Enter" }, "home", t({ pin: true }))).toBeNull();
    expect(resolveKey({ key: "Escape" }, "place", t())).toEqual({ type: "back" });
    expect(resolveKey({ key: "Escape" }, "home", t())).toBeNull();
  });
  it("forwards keys to the game", () => {
    expect(resolveKey({ key: "ArrowUp" }, "game", t())).toEqual({ type: "game", action: "up" });
    expect(resolveKey({ key: "Enter" }, "game", t())).toEqual({ type: "game", action: "a" });
  });
});
