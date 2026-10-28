import type { CSSProperties, SVGProps } from "react";

/** The brand mark: the coffee mug of the favicon (scripts/art/favicon.py), drawn from the same 16x16 grid.
 * Palette: k tile, a body, d body shade, c rim and steam, t saucer. `bare` drops the tile and follows the theme; `tile` keeps the dark tile. */
export const MUG = [
  "..kkkkkkkkkkkk..",
  ".kkkkkkkkkkkkkk.",
  "kkkkkkckkkckkkkk",
  "kkkkkckkkckkkkkk",
  "kkkkkkckkkckkkkk",
  "kkkkkkkkkkkkkkkk",
  "kkkcccccccccckkk",
  "kkkacaaaaaaddaak",
  "kkkacaaaaaaddkak",
  "kkkaaaaaaaaddkak",
  "kkkaaaaaaaaddaak",
  "kkkaaaaaaaaddkkk",
  "kkkkaaaaaaaddkkk",
  "kktttttttttttkkk",
  ".kkkkkkkkkkkkkk.",
  "..kkkkkkkkkkkk..",
] as const;

const TILE: Record<string, string> = { k: "#16120f", a: "#e9a55c", d: "#b8743a", c: "#f4e9d8", t: "#6fcfc2" };
const BARE: Record<string, string> = {
  a: "var(--accent)",
  d: "color-mix(in srgb, var(--accent) 70%, #000)",
  c: "color-mix(in srgb, var(--text) 85%, transparent)",
  t: "var(--accent-2)",
};

type Run = { x: number; y: number; w: number; ch: string };
const RUNS: Run[] = MUG.flatMap((row, y) => {
  const runs: Run[] = [];
  for (let x = 0; x < row.length; ) {
    let w = 1;
    while (x + w < row.length && row[x + w] === row[x]) w++;
    if (row[x] !== ".") runs.push({ x, y, w, ch: row[x] });
    x += w;
  }
  return runs;
});

export function BrandMark({ size = 20, className, variant = "bare", ...rest }: { size?: number | string; className?: string; variant?: "bare" | "tile" } & Omit<SVGProps<SVGSVGElement>, "width" | "height">) {
  const palette = variant === "tile" ? TILE : BARE;
  return (
    <svg className={`brand-art${className ? ` ${className}` : ""}`} width={size} height={size} viewBox="0 0 16 16" aria-hidden="true" focusable="false" shapeRendering="crispEdges" data-variant={variant} {...rest}>
      {RUNS.filter((r) => palette[r.ch]).map((r) => (
        <rect key={`${r.x}-${r.y}`} x={r.x} y={r.y} width={r.w} height={1} style={{ fill: palette[r.ch] } as CSSProperties} />
      ))}
    </svg>
  );
}
