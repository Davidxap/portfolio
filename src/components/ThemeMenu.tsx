"use client";
import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { Locale } from "@/data/projects";
import { Check, ChevronDown, Palette } from "lucide-react";
import { useT } from "@/i18n/ui";
import { applyTheme, currentTheme, DEFAULT_THEME, syncThemeColor, THEME_META, THEMES, type Theme } from "@/lib/theme";

/** Round swatch for the trigger: background, accent and third colour as three bands. */
const Swatch = ({ theme }: { theme: Theme }) => {
  const [a, b, c] = THEME_META[theme].swatch;
  return <span className="swatch" aria-hidden="true" style={{ background: `linear-gradient(135deg, ${a} 40%, ${b} 40% 70%, ${c} 70%)` }} />;
};
/** Wide strip for the menu tiles (36x12). */
const Strip = ({ theme }: { theme: Theme }) => {
  const [a, b, c] = THEME_META[theme].swatch;
  return <span className="swatch-strip" aria-hidden="true" style={{ background: `linear-gradient(90deg, ${a} 34%, ${b} 34% 67%, ${c} 67%)` }} />;
};

/** Accessible theme menu: button + 2-column listbox of tiles, keyboard (arrows move, Home/End, Enter/Space choose, Esc closes), persisted and applied before paint.
 * Left/Right move by 1, Up/Down by 2 (one grid row), clamped to the ends. */
export function ThemeMenu({ locale }: { locale: Locale }) {
  const t = useT(locale);
  const listId = useId();
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState<Theme>(DEFAULT_THEME);
  const [active, setActive] = useState(0);
  const [sheet, setSheet] = useState(false);
  const btn = useRef<HTMLButtonElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const root = useRef<HTMLDivElement>(null);
  const label = (th: Theme) => THEME_META[th].name;

  useEffect(() => {
    setTheme(currentTheme());
    syncThemeColor();
    const on = (e: Event) => setTheme((e as CustomEvent<Theme>).detail);
    window.addEventListener("themechange", on);
    return () => window.removeEventListener("themechange", on);
  }, []);

  useEffect(() => {
    if (!open) return;
    list.current?.focus();
    const away = (e: PointerEvent) => { const n = e.target as Node; if (!root.current?.contains(n) && !list.current?.contains(n)) setOpen(false); };
    document.addEventListener("pointerdown", away);
    return () => document.removeEventListener("pointerdown", away);
  }, [open]);

  /** At phone width the list is a bottom sheet rendered in <body>, so no bar or tab bar stacking context can cover it. */
  const openMenu = () => { setActive(THEMES.indexOf(theme)); setSheet(typeof matchMedia === "function" && matchMedia("(max-width: 720px)").matches); setOpen(true); };
  const close = (focusButton = true) => { setOpen(false); if (focusButton) btn.current?.focus(); };
  const choose = (th: Theme) => {
    const r = btn.current?.getBoundingClientRect();
    applyTheme(th, r ? { x: r.left + r.width / 2, y: r.top + r.height / 2 } : undefined);
    setTheme(th);
    close();
  };

  const onButtonKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") { e.preventDefault(); openMenu(); }
  };
  const onListKey = (e: React.KeyboardEvent) => {
    const n = THEMES.length;
    const move = (d: number) => setActive(Math.min(n - 1, Math.max(0, active + d)));
    if (e.key === "ArrowRight") move(1);
    else if (e.key === "ArrowLeft") move(-1);
    else if (e.key === "ArrowDown") move(2);
    else if (e.key === "ArrowUp") move(-2);
    else if (e.key === "Home") setActive(0);
    else if (e.key === "End") setActive(n - 1);
    else if (e.key === "Enter" || e.key === " ") choose(THEMES[active]);
    else if (e.key === "Escape") close();
    else if (e.key === "Tab") close(false);
    else return;
    e.preventDefault();
  };

  const menu = (
    <ul id={listId} ref={list} className="theme-list tm-list" role="listbox" tabIndex={-1} aria-label={t("hud.theme")} aria-activedescendant={`${listId}-${THEMES[active]}`} onKeyDown={onListKey}>
      {THEMES.map((th, i) => (
        <li key={th} id={`${listId}-${th}`} role="option" aria-label={label(th)} aria-describedby={`${listId}-${th}-tag`} aria-selected={th === theme} data-active={i === active} className="theme-opt tm-opt" onClick={() => choose(th)} onPointerMove={() => setActive(i)}>
          <Strip theme={th} />
          <span className="tm-name">{label(th)}</span>
          <span className="tm-tag" id={`${listId}-${th}-tag`}>{THEME_META[th].tagline[locale]}</span>
          {th === theme && <Check className="ic ic-check tm-check" size={16} aria-hidden="true" />}
        </li>
      ))}
    </ul>
  );

  return (
    <div className="theme-menu" ref={root}>
      <button
        ref={btn} className="hud-btn" type="button" aria-haspopup="listbox" aria-expanded={open} aria-controls={open ? listId : undefined}
        onClick={() => (open ? close() : openMenu())} onKeyDown={onButtonKey}
      >
        <Palette className="ic ic-opt" size={16} aria-hidden="true" />
        <Swatch theme={theme} />
        <span className="sr-only">{t("hud.theme")}: </span>
        <span className="theme-name">{label(theme)}</span>
        <ChevronDown className="ic" size={14} aria-hidden="true" />
      </button>
      {open && (sheet ? createPortal(menu, document.body) : menu)}
    </div>
  );
}
