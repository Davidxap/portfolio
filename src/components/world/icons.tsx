import type { CSSProperties } from "react";
import { withBase } from "@/lib/base";

/** The pixel icon set from David's asset pack (public/art/v3/icons, transparent WebP: 64 px, and 128 px for the six places). Decorative by default: the label next to it
 * (keycap, button, heading) already names the thing, so alt is empty. */
export type ArtIconName = "about" | "projects" | "experience" | "stack" | "arcade" | "contact" | "cv" | "map" | "sound" | "muted";

export function ArtIcon({ name, size = 24, className }: { name: ArtIconName; size?: number; className?: string }) {
  if (name === "cv") return <CvIcon size={size} className={className} />;
  // 64 px files cover up to 32 CSS px at 2x density; larger icons use the 128 px file
  const file = size > 32 ? 128 : 64;
  const style = { width: size, height: size } as CSSProperties;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img className={`art-icon${className ? ` ${className}` : ""}`} src={withBase(`/art/v3/icons/${name}-${file}.webp`)} width={size} height={size} alt="" aria-hidden="true" decoding="async" loading="lazy" style={style} />
  );
}

/** The CV icon: a page with a folded corner and a bold arrow dropping into a tray. Inline, currentColor, so it reads on the orange CTA,
 * the dark pills and Páramo Morning at 20 px (the old raster was mush at that size). */
function CvIcon({ size, className }: { size: number; className?: string }) {
  return (
    <svg className={`art-icon cv-icon${className ? ` ${className}` : ""}`} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d="M5.5 12V2.8h8.2l4.8 4.8V12" />
      <path d="M13.7 2.8v4.8h4.8" />
      <path d="M12 8.6v8" />
      <path d="M8.6 13.4 12 16.8l3.4-3.4" />
      <path d="M4 18.6v2.6h16v-2.6" />
    </svg>
  );
}
