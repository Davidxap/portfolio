import type { CSSProperties } from "react";
import { withBase } from "@/lib/base";

/** David's calm pixel figure (public/art/v3/david-calm-px.webp, 220x288 real pixel grid). It is never interactive: no hover, focus or
 * after-boot swap. Shown at 1x or larger it is scaled with image-rendering: pixelated; smaller sizes are smoothed. */
export function PixelDavid({ height = 144, className }: { height?: number; className?: string }) {
  const style = { "--h": `${height}px` } as CSSProperties;
  return (
    <span className={`pdavid${className ? ` ${className}` : ""}`} data-crisp={height >= 288} style={style} aria-hidden="true">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="calm" src={withBase("/art/v3/david-calm-px.webp")} width={220} height={288} alt="" decoding="async" />
    </span>
  );
}
