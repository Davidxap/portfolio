import { describe, expect, it } from "vitest";
import {
  CASE_NO, CLUES, CODE, HOTSPOTS, addClue, caseClosed, dread, eyeLook, RADIO, SEAL_ORDER, canLeave, cycle, isEnding, leave, roomNumber, newGame, pressSeal, proximity, radioStatic, submitCode, tuneRadio,
  type Game, type SealId,
} from "@/lib/games/ikai";

const solveRadio = (g: Game) => tuneRadio(g, RADIO.target);
const solveSeals = (g: Game) => SEAL_ORDER.reduce((acc, id) => pressSeal(acc, id).game, g);
const toRoom2 = () => leave(solveRadio(newGame()));
const toRoom3 = () => leave(solveSeals(toRoom2()));

describe("ikai rooms", () => {
  it("starts in room 1 with nothing solved and cannot leave", () => {
    const g = newGame();
    expect(g.room).toBe(1);
    expect(canLeave(g)).toBe(false);
    expect(leave(g)).toEqual(g);
  });

  it("moves 1 -> 2 -> 3 only after each puzzle is solved", () => {
    expect(toRoom2().room).toBe(2);
    expect(canLeave(toRoom2())).toBe(false);
    expect(leave(toRoom2()).room).toBe(2);
    expect(toRoom3().room).toBe(3);
  });

  it("room 3 has no exit: only the door code ends the game", () => {
    const g = solveSeals(toRoom2());
    expect(canLeave(toRoom3())).toBe(false);
    expect(leave(toRoom3()).room).toBe(3);
    expect(g.room).toBe(2);
  });

  it("every room has hotspots and cycling wraps both ways", () => {
    for (const r of [1, 2, 3] as const) {
      expect(HOTSPOTS[r].length).toBeGreaterThanOrEqual(3);
      expect(cycle(r, 0, -1)).toBe(HOTSPOTS[r].length - 1);
      expect(cycle(r, HOTSPOTS[r].length - 1, 1)).toBe(0);
      expect(cycle(r, 0, 1)).toBe(1);
    }
  });
});

describe("room 1: the radio", () => {
  it("static is 0 on the station and grows with distance", () => {
    expect(radioStatic(RADIO.target)).toBe(0);
    expect(radioStatic(RADIO.target + RADIO.tolerance)).toBe(0);
    expect(radioStatic(RADIO.target + 10)).toBeGreaterThan(0);
    expect(radioStatic(RADIO.target + 10)).toBeLessThan(radioStatic(RADIO.target + 25));
    expect(radioStatic(RADIO.target + 90)).toBeLessThanOrEqual(1);
  });

  it("wrong frequencies do not solve it; the right one (within tolerance) does", () => {
    expect(tuneRadio(newGame(), 10).radio).toBe(false);
    expect(tuneRadio(newGame(), RADIO.target + RADIO.tolerance + 1).radio).toBe(false);
    expect(tuneRadio(newGame(), RADIO.target - RADIO.tolerance).radio).toBe(true);
    expect(tuneRadio(newGame(), 9999).radio).toBe(false);
  });

  it("ignores tuning outside room 1", () => {
    expect(tuneRadio(toRoom2(), 10)).toEqual(toRoom2());
  });
});

describe("room 2: the spiral seals", () => {
  it("accepts the three seals in order", () => {
    let g = toRoom2();
    const results: string[] = [];
    for (const id of SEAL_ORDER) { const r = pressSeal(g, id); g = r.game; results.push(r.result); }
    expect(results).toEqual(["placed", "placed", "solved"]);
    expect(g.seals).toBe(true);
    expect(canLeave(g)).toBe(true);
  });

  it("a wrong order resets the sequence and does not solve", () => {
    const wrong: SealId[] = [SEAL_ORDER[1], SEAL_ORDER[0], SEAL_ORDER[2]];
    let g = toRoom2();
    expect(pressSeal(g, wrong[0]).result).toBe("wrong");
    g = pressSeal(g, wrong[0]).game;
    expect(g.pressed).toEqual([]);
    expect(g.seals).toBe(false);
  });

  it("a mistake on the third press also resets", () => {
    let g = toRoom2();
    g = pressSeal(g, SEAL_ORDER[0]).game;
    g = pressSeal(g, SEAL_ORDER[1]).game;
    expect(g.pressed).toEqual([SEAL_ORDER[0], SEAL_ORDER[1]]);
    const r = pressSeal(g, SEAL_ORDER[0]);
    expect(r.result).toBe("ignored");
    expect(r.game.pressed).toEqual(g.pressed);
  });

  it("ignores seals in other rooms and after solving", () => {
    expect(pressSeal(newGame(), SEAL_ORDER[0]).result).toBe("ignored");
    expect(pressSeal(solveSeals(toRoom2()), SEAL_ORDER[0]).result).toBe("ignored");
  });
});

describe("room 3: the door and the ending", () => {
  it("rejects wrong or malformed codes", () => {
    for (const bad of ["000", "471", "41", "4177", "abc", ""]) {
      const r = submitCode(toRoom3(), bad);
      expect(r.ok, bad).toBe(false);
      expect(isEnding(r.game)).toBe(false);
    }
  });

  it("the right code reaches the ending", () => {
    const r = submitCode(toRoom3(), CODE);
    expect(r.ok).toBe(true);
    expect(isEnding(r.game)).toBe(true);
  });

  it("the ending cannot be reached from earlier rooms, even with the right code", () => {
    expect(submitCode(newGame(), CODE).ok).toBe(false);
    expect(submitCode(toRoom2(), CODE).ok).toBe(false);
    expect(isEnding(newGame())).toBe(false);
  });
});

describe("clue proximity (drives the radio static)", () => {
  it("is 1 on the clue, falls with distance and is 0 once solved", () => {
    const radio = HOTSPOTS[1].find((h) => h.kind === "radio")!;
    expect(proximity({ x: radio.x, y: radio.y }, newGame())).toBe(1);
    expect(proximity({ x: radio.x + 20, y: radio.y }, newGame())).toBeLessThan(1);
    expect(proximity({ x: radio.x + 20, y: radio.y }, newGame())).toBeGreaterThan(0);
    expect(proximity({ x: 0, y: 100 }, newGame())).toBe(0);
    expect(proximity({ x: radio.x, y: radio.y }, solveRadio(newGame()))).toBe(0);
  });
});

describe("progress for the header (Escape the three rooms)", () => {
  it("reports room 1/3, 2/3, 3/3 and stays at 3/3 after escaping", () => {
    expect(roomNumber(newGame())).toBe(1);
    expect(roomNumber(toRoom2())).toBe(2);
    expect(roomNumber(toRoom3())).toBe(3);
    expect(roomNumber(submitCode(toRoom3(), CODE).game)).toBe(3);
  });
});

describe("detective notebook", () => {
  const room3 = () => toRoom3();
  it("starts empty and adds each clue once", () => {
    let g = newGame();
    expect(g.notes).toEqual([]);
    g = addClue(g, "poster");
    expect(g.notes).toEqual(["poster"]);
    expect(addClue(g, "poster")).toBe(g);
    g = addClue(g, "bed");
    expect(g.notes).toEqual(["poster", "bed"]);
  });

  it("only takes clues that belong to the current room, and ignores unknown ids", () => {
    expect(addClue(newGame(), "stairs").notes).toEqual([]);
    expect(addClue(newGame(), "nope").notes).toEqual([]);
    expect(addClue(room3(), "poster").notes).toEqual(room3().notes);
  });

  it("solving the radio and the seals writes their clue by itself", () => {
    expect(solveRadio(newGame()).notes).toContain("radio");
    expect(solveSeals(toRoom2()).notes).toContain("seal");
    expect(tuneRadio(newGame(), 10).notes).toEqual([]);
    expect(pressSeal(toRoom2(), SEAL_ORDER[1]).game.notes).toEqual(toRoom2().notes);
  });

  it("every clue belongs to a real room and has a unique id", () => {
    expect(new Set(CLUES.map((c) => c.id)).size).toBe(CLUES.length);
    for (const c of CLUES) expect([1, 2, 3]).toContain(c.room);
    expect(CASE_NO).toBe(CODE);
  });

  it("the case closes only on the ending, after all three rooms", () => {
    expect(caseClosed(newGame())).toBe(false);
    expect(caseClosed(toRoom2())).toBe(false);
    expect(caseClosed(room3())).toBe(false);
    expect(caseClosed(submitCode(room3(), CODE).game)).toBe(true);
    expect(caseClosed(submitCode(room3(), "000").game)).toBe(false);
  });

  it("dread rises with the rooms and the clues", () => {
    expect(dread(newGame())).toBe(0);
    expect(dread(addClue(newGame(), "poster"))).toBeGreaterThan(0);
    expect(dread(toRoom2())).toBeGreaterThan(dread(addClue(newGame(), "poster")));
    expect(dread(toRoom3())).toBeGreaterThan(dread(toRoom2()));
    expect(dread(submitCode(room3(), CODE).game)).toBe(1);
    for (const g of [newGame(), toRoom2(), toRoom3()]) expect(dread(g)).toBeLessThanOrEqual(1);
  });

  it("the eye looks toward the light but stays inside its socket", () => {
    const eye = { x: 50, y: 20 };
    expect(eyeLook(eye, eye)).toEqual({ x: 0, y: 0 });
    const right = eyeLook(eye, { x: 100, y: 20 });
    expect(right.x).toBeGreaterThan(0);
    expect(Math.abs(right.y)).toBeLessThan(0.001);
    const far = eyeLook(eye, { x: 100, y: 100 });
    expect(Math.hypot(far.x, far.y)).toBeLessThanOrEqual(1.0001);
  });
});
