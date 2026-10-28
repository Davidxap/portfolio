import { afterEach, describe, expect, it, vi } from "vitest";

const load = async () => { vi.resetModules(); return import("@/lib/sound"); };

afterEach(() => { vi.unstubAllGlobals(); });

describe("sound mute", () => {
  it("is muted until the user opts in, and persists the toggle", async () => {
    localStorage.removeItem("sound-muted");
    const s = await load();
    expect(s.isMuted()).toBe(true);
    s.setMuted(false);
    expect(s.isMuted()).toBe(false);
    expect(localStorage.getItem("sound-muted")).toBe("0");
    const again = await load();
    expect(again.isMuted()).toBe(false);
    again.setMuted(true);
    expect(localStorage.getItem("sound-muted")).toBe("1");
  });
  it("survives a throwing localStorage", async () => {
    const bad = { getItem() { throw new Error("no"); }, setItem() { throw new Error("no"); } };
    vi.stubGlobal("localStorage", bad);
    const s = await load();
    expect(s.isMuted()).toBe(true);
    expect(() => s.setMuted(false)).not.toThrow();
    expect(s.isMuted()).toBe(false);
  });
  it("creates no AudioContext before a gesture and notifies subscribers on change", async () => {
    const Ctx = vi.fn();
    vi.stubGlobal("AudioContext", Ctx);
    const s = await load();
    const fn = vi.fn();
    const off = s.onMuteChange(fn);
    s.play("blip");
    s.setMuted(true);
    expect(Ctx).not.toHaveBeenCalled();
    expect(fn).toHaveBeenCalledWith(true);
    off();
  });
  it("gives each key its own stable voice and exports the success sting", async () => {
    const s = await load();
    expect(s.keyVariant("enter")).toBe(s.keyVariant("enter"));
    expect(new Set(["enter", "esc", "left", "right", "up", "down", "p0", "p1", "p2"].map(s.keyVariant)).size).toBeGreaterThan(2);
    expect(typeof s.playSuccess).toBe("function");
    expect(() => { s.playSuccess(); s.playKey("enter"); }).not.toThrow();
  });
});
