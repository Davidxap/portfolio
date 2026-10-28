import { places } from "@/data/places";

export type View = "home" | "place" | "project" | "game" | "direct";
export type Dir = "up" | "down" | "left" | "right";

/** What the key event hit, reduced to facts so the routing below stays pure and testable. */
export type Target = {
  /** Text field, editable, listbox, combobox or an open dialog: the console never touches keys there. */
  typing: boolean;
  /** A link, button, summary or form control other than a pin: it owns Enter and Space. */
  interactive: boolean;
  /** The map pin links. */
  pin: boolean;
  /** document.body or the panel scroller itself, i.e. nothing more specific has focus. */
  neutral: boolean;
  /** document.body only (nothing focused): native keyboard scrolling has no scroller to act on. */
  body: boolean;
};

export type Key = { key: string; ctrlKey?: boolean; metaKey?: boolean; altKey?: boolean; shiftKey?: boolean };

export type WorldAction =
  | { type: "place"; index: number }
  | { type: "move"; dir: Dir }
  | { type: "open" }
  | { type: "back" }
  | { type: "palette" }
  | { type: "scroll"; dy: number }
  | { type: "game"; action: "up" | "down" | "left" | "right" | "a" | "b" };

const SCROLL_KEYS = new Set(["PageDown", "PageUp", " ", "Home", "End", "ArrowDown", "ArrowUp"]);

/** Routes one key press. Returns null when the browser should keep it (native scrolling, links, buttons, text fields).
 * Rules that fix the old scroll bug: up/down and PageUp/PageDown/Space/Home/End are never taken from a place panel (they scroll it
 * natively; if nothing is focused they are scrolled by hand), and left/right only switch places when nothing more specific has focus. */
export function resolveKey(e: Key, view: View, t: Target): WorldAction | null {
  if (e.ctrlKey || e.metaKey || e.altKey || t.typing) return null;
  const k = e.key;
  if (k === "m" || k === "M") return { type: "palette" };

  if (view === "game") {
    const map: Record<string, "up" | "down" | "left" | "right" | "a" | "b"> = {
      ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right", z: "a", Z: "a", x: "b", X: "b", Backspace: "b",
    };
    if (k === "Escape") return { type: "back" };
    if (k === "Enter" || k === " ") return t.interactive ? null : { type: "game", action: "a" };
    const a = map[k];
    return a && (t.neutral || a === "b") ? { type: "game", action: a } : null;
  }

  if (/^[1-9]$/.test(k) && !e.shiftKey) {
    const index = Number(k) - 1;
    return index < places.length ? { type: "place", index } : null;
  }
  if (k === "Escape") return view === "home" ? null : { type: "back" };
  if (k === "Backspace") return t.neutral && view !== "home" ? { type: "back" } : null;

  if (view === "home") {
    if (k === "Enter") return t.pin || t.interactive ? null : { type: "open" };
    const dir = ({ ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right" } as Record<string, Dir>)[k];
    return dir && (t.neutral || t.pin) ? { type: "move", dir } : null;
  }

  if (SCROLL_KEYS.has(k)) {
    if (!t.body) return null;
    const dy = k === "ArrowDown" ? 60 : k === "ArrowUp" ? -60 : k === "Home" ? -1e6 : k === "End" ? 1e6 : k === "PageUp" || (k === " " && e.shiftKey) ? -0.85 : 0.85;
    return { type: "scroll", dy };
  }
  if (view === "place" && (k === "ArrowLeft" || k === "ArrowRight") && t.neutral) return { type: "move", dir: k === "ArrowRight" ? "right" : "left" };
  return null;
}

/** The place index one step from `index` in a direction (wraps). */
export const stepPlace = (index: number, delta: 1 | -1) => (index + delta + places.length) % places.length;
