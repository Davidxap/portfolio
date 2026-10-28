"use client";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import type { Locale } from "@/data/projects";
import { useW, type WKey } from "@/i18n/world";
import { ArtIcon } from "./icons";

/** localStorage flag: the first-visit coach card was dismissed. */
export const GUIDE_KEY = "guide-seen";

// One row per way of moving: a keycap glyph, then the sentence (its lead before " · " is the thing to do, the rest says what it does).
const ROWS: { key: WKey; glyph: string; icon?: ReactNode }[] = [
  { key: "guide.r1", glyph: "1-6" },
  { key: "guide.r2", glyph: "Esc" },
  { key: "guide.r3", glyph: "⇄" },
  { key: "guide.r4", glyph: "", icon: <ArtIcon name="sound" size={18} /> },
];

/** "1-6" never breaks across lines. */
const keep = (t: string) => t.split(/(1-6)/).map((part, i) => (part === "1-6" ? <span key={i} className="nb">{part}</span> : part));

function Rows({ locale, count }: { locale: Locale; count: number }) {
  const w = useW(locale);
  return (
    <ul className="guide-rows">
      {ROWS.slice(0, count).map(({ key, glyph, icon }) => {
        const [lead, ...rest] = w(key).split(" · ");
        const tail = rest.join(" · ");
        // the keycap already says "Esc": the sentence does not repeat it, but screen readers still get it from the kbd
        const keyIsLead = lead === glyph;
        return (
          <li key={key} className="guide-row">
            <kbd className="guide-key mono" aria-hidden={keyIsLead ? undefined : true}>{icon ?? glyph}</kbd>
            <span className="guide-text">{keyIsLead ? tail : <><b>{keep(lead)}</b>{tail && <span className="guide-tail"> · {tail}</span>}</>}</span>
          </li>
        );
      })}
    </ul>
  );
}

/** The "?" pill in the top bar and its popover: how to move around the portfolio. Esc closes it before anything else (the shell ignores a
 * key that was already handled) and focus goes back to the button; a click outside closes it too. */
export function Guide({ locale }: { locale: Locale }) {
  const w = useW(locale);
  const [open, setOpen] = useState(false);
  const id = useId();
  const root = useRef<HTMLDivElement>(null);
  const btn = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.preventDefault();
      e.stopPropagation();
      setOpen(false);
      btn.current?.focus();
    };
    const away = (e: PointerEvent) => { if (!root.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", away);
    return () => { document.removeEventListener("keydown", onKey); document.removeEventListener("pointerdown", away); };
  }, [open]);
  return (
    <div className="guide" ref={root}>
      <button ref={btn} type="button" className="hud-btn guide-btn" aria-haspopup="dialog" aria-expanded={open} aria-controls={open ? id : undefined} aria-label={w("guide.open")} title={w("guide.open")} onClick={() => setOpen((o) => !o)}>
        <span aria-hidden="true">?</span>
      </button>
      {open && (
        <div id={id} className="guide-pop" role="dialog" aria-label={w("guide.label")}>
          <p className="guide-title mono">{w("guide.title")}</p>
          <Rows locale={locale} count={ROWS.length} />
        </div>
      )}
    </div>
  );
}

const seen = () => { try { return localStorage.getItem(GUIDE_KEY) === "1"; } catch { return false; } };

/** The first-visit card above the dock: the first three rows and "Got it". `hidden` is true while a window is open. Dismissal is remembered
 * in localStorage (try/catch: with storage blocked it simply shows again next visit). It renders nothing on the server, so no markup is
 * ever shipped for it and the page stays identical for returning visitors. */
export function Coach({ locale, hidden = false }: { locale: Locale; hidden?: boolean }) {
  const w = useW(locale);
  const [show, setShow] = useState(false);
  useEffect(() => { setShow(!seen()); }, []);
  if (!show || hidden) return null;
  const dismiss = () => { setShow(false); try { localStorage.setItem(GUIDE_KEY, "1"); } catch { /* storage blocked: it comes back next visit */ } };
  return (
    <section className="coach" role="region" aria-label={w("guide.label")}>
      <Rows locale={locale} count={3} />
      <button type="button" className="btn coach-ok" onClick={dismiss}>{w("guide.gotIt")}</button>
    </section>
  );
}
