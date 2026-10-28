"use client";
import { useCallback, useEffect, useRef, useState, type MutableRefObject } from "react";
import "@/styles/demos/howto.css";
import { gameById } from "@/data/games";

const UI = {
  en: { title: "How to play", goal: "Goal", controls: "Controls", gotIt: "Got it" },
  es: { title: "Cómo se juega", goal: "Objetivo", controls: "Controles", gotIt: "Entendido" },
} as const;

export type HowToState = { open: boolean; show: () => void; hide: () => void; openRef: MutableRefObject<boolean> };

const key = (id: string) => `howto:${id}`;
const seen = (id: string) => { try { return sessionStorage.getItem(key(id)) === "1"; } catch { return false; } };

/** Open state of a game's "How to play" panel. It opens the first time in a session; "Got it" hides it and the ? button reopens it. */
export function useHowTo(id: string): HowToState {
  const [open, setOpen] = useState(() => !seen(id));
  const openRef = useRef(open);
  openRef.current = open;
  const show = useCallback(() => setOpen(true), []);
  const hide = useCallback(() => { try { sessionStorage.setItem(key(id), "1"); } catch { /* private mode: it simply opens again next time */ } setOpen(false); }, [id]);
  return { open, show, hide, openRef };
}

/** The "How to play" panel of a game (goal, numbered steps, controls) and the ? button that brings it back. Rendered inside the game's `.dm` box. */
export function HowTo({ id, locale, how }: { id: string; locale: "en" | "es"; how: HowToState }) {
  const g = gameById(id)?.howTo;
  const t = UI[locale];
  const ok = useRef<HTMLButtonElement>(null);
  // Focus "Got it" without scrolling the page: the panel is already centred on the screen.
  useEffect(() => { if (how.open) ok.current?.focus({ preventScroll: true }); }, [how.open]);
  if (!g) return null;
  if (!how.open) return <button type="button" className="ht-q" onClick={how.show} aria-label={t.title} title={t.title}>?</button>;
  return (
    <div className="ht" role="dialog" aria-label={t.title}>
      <div className="ht-card">
        <h3>{t.title}</h3>
        <p className="ht-goal"><small>{t.goal}</small>{g.goal[locale]}</p>
        <ol>{g.steps.map((s, i) => <li key={i}>{s[locale]}</li>)}</ol>
        <p className="ht-keys"><small>{t.controls}</small>{g.controls[locale]}</p>
        <button type="button" className="ht-ok" ref={ok} onClick={how.hide}>{t.gotIt}</button>
      </div>
    </div>
  );
}
