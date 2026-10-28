// Tiny TSX tokenizer for the console code panel. Lossless: joining every token's text gives back the source.
export type TokenKind = "text" | "keyword" | "string" | "comment" | "number" | "tag";
export type Token = { kind: TokenKind; text: string };

const KEYWORDS = new Set([
  "const", "let", "var", "function", "return", "if", "else", "for", "while", "import", "from", "export", "default", "type",
  "new", "true", "false", "null", "undefined", "as", "of", "in", "typeof", "async", "await", "switch", "case", "break",
]);
const isIdStart = (c: string) => /[A-Za-z_$]/.test(c);
const isId = (c: string) => /[\w$]/.test(c);

export function tokenize(src: string): Token[] {
  const out: Token[] = [];
  const push = (kind: TokenKind, text: string) => {
    const last = out[out.length - 1];
    if (kind === "text" && last?.kind === "text") last.text += text;
    else out.push({ kind, text });
  };
  let prev = ""; // last significant (non-space) character, used to tell a JSX tag from a less-than sign
  let i = 0;
  while (i < src.length) {
    const c = src[i];
    if (c === "/" && src[i + 1] === "/") {
      let j = src.indexOf("\n", i); if (j < 0) j = src.length;
      push("comment", src.slice(i, j)); i = j; continue;
    }
    if (c === "/" && src[i + 1] === "*") {
      let j = src.indexOf("*/", i + 2); j = j < 0 ? src.length : j + 2;
      push("comment", src.slice(i, j)); i = j; continue;
    }
    if (c === '"' || c === "'" || c === "`") {
      let j = i + 1;
      while (j < src.length && src[j] !== c) j += src[j] === "\\" ? 2 : 1;
      j = Math.min(j + 1, src.length);
      push("string", src.slice(i, j)); prev = c; i = j; continue;
    }
    if (/[0-9]/.test(c) && !isId(prev)) {
      let j = i + 1;
      while (j < src.length && /[\d._]/.test(src[j])) j++;
      push("number", src.slice(i, j)); prev = "0"; i = j; continue;
    }
    if (isIdStart(c)) {
      let j = i + 1;
      while (j < src.length && isId(src[j])) j++;
      const w = src.slice(i, j);
      push(KEYWORDS.has(w) ? "keyword" : "text", w); prev = "a"; i = j; continue;
    }
    if (c === "<" && !isId(prev) && prev !== ")" && prev !== "]") {
      const slash = src[i + 1] === "/" ? 1 : 0;
      if (isIdStart(src[i + 1 + slash] ?? "")) {
        let j = i + 1 + slash;
        const s = j;
        while (j < src.length && /[\w$.]/.test(src[j])) j++;
        push("text", src.slice(i, s)); push("tag", src.slice(s, j)); prev = "a"; i = j; continue;
      }
    }
    push("text", c);
    if (!/\s/.test(c)) prev = c;
    i++;
  }
  return out;
}
