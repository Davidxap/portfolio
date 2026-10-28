import { describe, expect, it } from "vitest";
import { tokenize } from "@/lib/tokenize";

const kinds = (src: string) => tokenize(src).filter((t) => t.kind !== "text").map((t) => [t.kind, t.text]);

describe("tsx tokenizer", () => {
  it("round-trips the source exactly", () => {
    const src = 'const a = "x"; // hi\nreturn <div className="b">{1}</div>;\n/* c */';
    expect(tokenize(src).map((t) => t.text).join("")).toBe(src);
  });
  it("marks keywords, strings, numbers and comments", () => {
    expect(kinds('const n = 42; // note')).toEqual([["keyword", "const"], ["number", "42"], ["comment", "// note"]]);
    expect(kinds("let s = 'a\\'b';")).toEqual([["keyword", "let"], ["string", "'a\\'b'"]]);
    expect(kinds("/* x\ny */ 1")).toEqual([["comment", "/* x\ny */"], ["number", "1"]]);
  });
  it("marks JSX tag names", () => {
    expect(kinds("<Foo bar={1}></Foo>")).toContainEqual(["tag", "Foo"]);
    expect(kinds("a < b")).not.toContainEqual(["tag", "b"]);
  });
  it("does not treat keywords inside identifiers as keywords", () => {
    expect(kinds("constant = iffy")).toEqual([]);
  });
});
