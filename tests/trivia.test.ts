import { describe, expect, it } from "vitest";
import { questions, rankFor } from "@/data/trivia";

describe("book trivia data", () => {
  it("has 8 to 10 questions", () => {
    expect(questions.length).toBeGreaterThanOrEqual(8);
    expect(questions.length).toBeLessThanOrEqual(10);
  });
  it("each question has 3 options, a valid answer and both locales", () => {
    for (const q of questions) {
      expect(q.options).toHaveLength(3);
      expect([0, 1, 2]).toContain(q.answer);
      for (const l of ["en", "es"] as const) {
        expect(q.q[l]).toBeTruthy();
        expect(q.why[l]).toBeTruthy();
        q.options.forEach((o) => expect(o[l]).toBeTruthy());
        expect(new Set(q.options.map((o) => o[l])).size).toBe(3);
      }
    }
  });
  it("ranks by ratio", () => {
    expect(rankFor(0, 10, "en")).toBe("Apprentice");
    expect(rankFor(10, 10, "es")).toBe("Maestro del Event Loop");
  });
});
