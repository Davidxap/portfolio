"use client";
import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { places, type Place, type PlaceId } from "@/data/places";
import type { Locale } from "@/data/projects";
import { useW } from "@/i18n/world";
import { STAGE_ART, STAGE_RATIO } from "@/lib/stage";

type Props = {
  locale: Locale;
  /** The place whose window is focused, or null on the bare desktop. */
  active: PlaceId | null;
  selected: PlaceId | null;
  visited: string[];
  onPinFocus: (id: PlaceId) => void;
};

/** The painting is drawn like `object-fit: cover` (day and night grade stacked; the theme picks one) inside a size container, so the
 * hotspots, positioned in % of the image, stay glued to the painted objects at any screen shape. */
const SIZES = "(max-width: 720px) 700px, 100vw";

const cover = { "--ratio": STAGE_RATIO.toFixed(4) } as CSSProperties;

/** The night grade is only fetched once a theme asks for it (--wall-night: 1), so day themes never download it. */
function useNightArt() {
  const [night, setNight] = useState(false);
  useEffect(() => {
    const check = () => { if (getComputedStyle(document.documentElement).getPropertyValue("--wall-night").trim() === "1") setNight(true); };
    check();
    window.addEventListener("themechange", check);
    return () => window.removeEventListener("themechange", check);
  }, []);
  return night;
}

/** Particles of the theme atmosphere: x and y in % of the window view, duration and phase in seconds, and a size factor. Fixed values,
 * so the server and the client render the same markup. Each theme decides in CSS whether they fall, rise, drift or blink. */
const MOTES = [
  [4, 62, 11, 0.0, 1], [11, 38, 14, 3.1, 0.7], [18, 74, 9, 6.2, 1.2], [26, 48, 13, 1.4, 0.8], [33, 22, 10, 8.3, 1.1], [41, 66, 15, 4.6, 0.6],
  [49, 30, 12, 2.2, 1.3], [57, 80, 10, 7.4, 0.9], [64, 44, 14, 5.1, 1], [71, 58, 11, 9.6, 0.7], [79, 26, 13, 0.8, 1.2], [86, 70, 9, 3.9, 0.8],
  [92, 40, 12, 6.8, 1], [97, 54, 15, 2.7, 0.9],
] as const;
const mote = ([x, y, d, ph, k]: (typeof MOTES)[number]) => ({ "--x": `${x}%`, "--y": `${y}%`, "--d": d, "--ph": ph, "--k": k }) as CSSProperties;

/** The theme atmosphere over the painting: snow on the Nevado, fog down the hills, steam from the tinto, a cabin crossing on the cable...
 * Glued to the painted objects like the pins, drawn with transforms and opacity only, and nudged by the pointer on desktop. */
function ThemeFx() {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = root.current;
    if (!el || !matchMedia("(pointer: fine)").matches) return;
    let raf = 0, x = 0, y = 0;
    const paint = () => { raf = 0; el.style.setProperty("--mx", x.toFixed(3)); el.style.setProperty("--my", y.toFixed(3)); };
    const onMove = (e: PointerEvent) => {
      x = e.clientX / window.innerWidth - 0.5; y = e.clientY / window.innerHeight - 0.5;
      if (!raf) raf = requestAnimationFrame(paint);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => { window.removeEventListener("pointermove", onMove); cancelAnimationFrame(raf); };
  }, []);
  return (
    <div ref={root} className="wp-fx" aria-hidden="true">
      <div className="fx-box">
        <span className="fx-sun" />
        <span className="fx-peak" />
        <span className="fx-glass" />
        <span className="fx-wire"><span /></span>
        <span className="fx-lamp" />
        <span className="fx-steam"><i /><i /><i /></span>
        <div className="fx-win">{MOTES.map((m, i) => <i key={i} style={mote(m)} />)}</div>
      </div>
    </div>
  );
}

/** The desktop wallpaper and its hotspots: a glint on each painted object and a label on hover or focus; each opens its place's window. */
export function Wallpaper({ locale, active, selected, visited, onPinFocus }: Props) {
  const w = useW(locale);
  const night = useNightArt();
  return (
    <div className="wallpaper" style={cover} data-focus={active ?? "desktop"}>
      <div className="wp-field" aria-hidden="true" />
      <div className="wp-art" aria-hidden="true">
        <picture className="wp-day">
          <source type="image/avif" srcSet={STAGE_ART.avif.join(", ")} sizes={SIZES} />
          <source type="image/webp" srcSet={STAGE_ART.webp.join(", ")} sizes={SIZES} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={STAGE_ART.fallback} width={STAGE_ART.width} height={STAGE_ART.height} alt="" decoding="async" fetchPriority="high" />
        </picture>
        <picture className="wp-night">
          {night && <>
            <source type="image/avif" srcSet={STAGE_ART.night.avif.join(", ")} sizes={SIZES} />
            <source type="image/webp" srcSet={STAGE_ART.night.webp.join(", ")} sizes={SIZES} />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={STAGE_ART.night.fallback} width={STAGE_ART.night.width} height={STAGE_ART.night.height} alt="" decoding="async" />
          </>}
        </picture>
      </div>
      <ThemeFx />
      <div className="wp-shade" aria-hidden="true" />
      <nav className="pins" aria-label={w("stage.pins")}>
        <ul>
          {places.map((p) => <Pin key={p.id} p={p} locale={locale} on={active === p.id} sel={selected === p.id} seen={visited.includes(p.id)} onFocus={onPinFocus} />)}
        </ul>
      </nav>
    </div>
  );
}

function Pin({ p, locale, on, sel, seen, onFocus }: { p: Place; locale: Locale; on: boolean; sel: boolean; seen: boolean; onFocus: (id: PlaceId) => void }) {
  const style = { "--px": p.pin.x / 100, "--py": p.pin.y / 100 } as CSSProperties;
  return (
    <li className="pin-wrap" style={style} data-at={p.at ?? "bottom"}>
      <Link className="pin" href={p.path[locale]} aria-label={`${p.label[locale]}. ${p.teaser[locale]}`} data-pin={p.id} data-sel={sel} data-seen={seen} aria-current={on ? "page" : undefined} onFocus={() => onFocus(p.id)} onMouseEnter={() => onFocus(p.id)}>
        <span className="pin-glint" aria-hidden="true" />
        <span className="pin-leader" aria-hidden="true" />
        <span className="pin-card" aria-hidden="true">
          <span className="pin-label">{p.label[locale]}</span>
          <span className="pin-title">{p.label[locale]}</span>
          <span className="pin-teaser">{p.teaser[locale]}</span>
        </span>
      </Link>
    </li>
  );
}
