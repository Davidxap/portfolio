"use client";
import Link from "next/link";
import { useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { placeIndex, places, type PlaceId } from "@/data/places";
import type { Locale } from "@/data/projects";
import { useW } from "@/i18n/world";
import { ArtIcon } from "./icons";

export type KeyId = "up" | "down" | "left" | "right" | "enter" | "esc" | `p${number}`;
type Props = {
  locale: Locale;
  /** The place whose window is open (null on the empty desktop). */
  current: PlaceId | null;
  selected?: PlaceId | null;
  pressed: KeyId | null;
  /** True when a window is open: Esc closes it. On the empty desktop the key is shown disabled (nothing to close). */
  windowOpen: boolean;
  onEsc: () => void;
};

// Short visible label for the Esc keycap; the long accessible name is the existing dock.escLabel.
const ESC_TEXT = { en: "Close", es: "Cerrar" } as const;

/** The dock on the desktop: a glass strip with an Esc key, then the six places as flat keycaps (real links, keys 1-6).
 * A small pixel David walks above the strip to the active place's key. Hidden on phones (the TabBar takes over). The Esc key is aria-disabled and dimmed while no window is open. */
export function Dock({ locale, current, selected = null, pressed, windowOpen, onEsc }: Props) {
  const w = useW(locale);
  const nav = useRef<HTMLElement>(null);
  const target = placeIndex((current ?? selected ?? places[0].id) as PlaceId);
  const [walker, setWalker] = useState<{ x: number; from: number; dist: number; face: "r" | "l"; walking: boolean; ready: boolean }>({ x: 0, from: target, dist: 0, face: "r", walking: false, ready: false });
  // measure the real keycap centre (the dock may shrink on narrow desktops), and walk there at a constant pace
  useLayoutEffect(() => {
    const at = () => { const k = nav.current?.children[target] as HTMLElement | undefined; return k ? k.offsetLeft + k.offsetWidth / 2 : 0; };
    setWalker((s) => {
      const x = at();
      if (!s.ready) return { ...s, x, from: target, ready: true };
      if (s.from === target) return { ...s, x };
      return { x, from: target, dist: Math.abs(target - s.from), face: target > s.from ? "r" : "l", walking: true, ready: true };
    });
    const onResize = () => setWalker((s) => ({ ...s, x: at(), walking: false }));
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [target]);
  const txt = ESC_TEXT[locale];
  return (
    <div className="dock" role="group" aria-label={w("dock.keys")}>
      <button type="button" className="key key-esc" data-pressed={pressed === "esc"} aria-keyshortcuts="Escape" aria-label={w("dock.escLabel")} aria-disabled={windowOpen ? undefined : true} onClick={() => { if (windowOpen) onEsc(); }}>
        <span className="key-num" aria-hidden="true">{w("dock.esc")}</span>
        <span className="key-label" aria-hidden="true">{txt}</span>
      </button>
      <span className="dock-sep" aria-hidden="true" />
      <nav className="dock-places" aria-label={w("dock.label")} ref={nav}>
        {places.map((p, i) => (
          <Link key={p.id} href={p.path[locale]} className="key key-place" data-key={i + 1} data-pressed={pressed === `p${i}`} aria-current={current === p.id ? "page" : undefined} aria-keyshortcuts={String(i + 1)}>
            <span className="key-num" aria-hidden="true">{i + 1}</span>
            <ArtIcon name={p.id} size={26} className="key-icon" />
            <span className="key-label">{p.label[locale]}</span>
          </Link>
        ))}
        <span className="walker" aria-hidden="true" data-ready={walker.ready} data-walking={walker.walking} data-face={walker.face} style={{ "--wx": `${walker.x}px`, "--wd": walker.dist } as CSSProperties}
          onTransitionEnd={(e) => { if (e.propertyName === "transform") setWalker((s) => ({ ...s, walking: false })); }}>
          <span className="walker-sprite" />
        </span>
      </nav>
    </div>
  );
}
