"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Locale } from "@/data/projects";
import { person } from "@/data/site";
import { useT } from "@/i18n/ui";
import { copyText } from "@/lib/copy";
import { buildCommands, filterCommands, type Command } from "@/lib/palette";
import { applyTheme } from "@/lib/theme";

export function CommandPalette({ locale, altPath, onNavigate }: { locale: Locale; altPath: string; onNavigate?: (href: string) => void }) {
  const t = useT(locale);
  const all = useMemo(() => buildCommands(locale), [locale]);
  const dlg = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const lastFocus = useRef<HTMLElement | null>(null);
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(0);
  const shown = useMemo(() => filterCommands(all, q), [all, q]);
  const selected = Math.min(sel, Math.max(shown.length - 1, 0));

  const show = () => {
    lastFocus.current = document.activeElement as HTMLElement | null;
    setQ(""); setSel(0); setOpen(true);
  };
  const hide = () => setOpen(false);

  useEffect(() => {
    const d = dlg.current;
    if (!d) return;
    if (open && !d.open) { if (typeof d.showModal === "function") d.showModal(); else d.setAttribute("open", ""); input.current?.focus(); }
    if (!open && d.open) { if (typeof d.close === "function") d.close(); else d.removeAttribute("open"); lastFocus.current?.focus?.(); }
  }, [open]);

  const run = (c: Command) => {
    hide();
    if (c.action === "nav" && c.href) { if (onNavigate) onNavigate(c.href); else location.href = c.href; }
    else if (c.action === "cv" && c.href) { const l = document.createElement("a"); l.href = c.href; l.download = ""; document.body.append(l); l.click(); l.remove(); }
    else if (c.action === "copy") void copyText(person.email);
    else if (c.action === "lang") location.href = altPath;
    else if (c.action === "theme" && c.theme) { const th = c.theme; setTimeout(() => applyTheme(th, { x: innerWidth / 2, y: innerHeight / 2 }), 0); }
  };

  // Refs keep the global listeners stable while state changes.
  const state = useRef({ open, shown, selected, run });
  state.current = { open, shown, selected, run };
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); state.current.open ? hide() : show(); }
    };
    const onOpen = () => show();
    const onPadMove = (ev: Event) => { if (state.current.open) setSel((s) => s + ((ev as CustomEvent).detail.dy || 0)); };
    const onPadA = () => { const s = state.current; if (s.open && s.shown[s.selected]) s.run(s.shown[s.selected]); };
    addEventListener("keydown", onKey);
    addEventListener("palette:open", onOpen);
    document.addEventListener("pad:move", onPadMove);
    document.addEventListener("pad:a", onPadA);
    document.addEventListener("pad:b", hide);
    return () => {
      removeEventListener("keydown", onKey); removeEventListener("palette:open", onOpen);
      document.removeEventListener("pad:move", onPadMove); document.removeEventListener("pad:a", onPadA); document.removeEventListener("pad:b", hide);
    };
  }, []);

  const onKeyDown = (e: React.KeyboardEvent) => {
    const n = shown.length;
    if (e.key === "ArrowDown") { e.preventDefault(); setSel(n ? (selected + 1) % n : 0); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setSel(n ? (selected - 1 + n) % n : 0); }
    else if (e.key === "Home") { e.preventDefault(); setSel(0); }
    else if (e.key === "End") { e.preventDefault(); setSel(Math.max(n - 1, 0)); }
    else if (e.key === "Enter") { e.preventDefault(); if (shown[selected]) run(shown[selected]); }
  };

  useEffect(() => { document.getElementById(`pal-${shown[selected]?.id}`)?.scrollIntoView?.({ block: "nearest" }); }, [selected, shown]);

  return (
    <dialog ref={dlg} className="palette" aria-label={t("pal.title")} onClose={hide} onKeyDown={onKeyDown} onClick={(e) => { if (e.target === dlg.current) hide(); }}>
      <div className="palette-box">
        <input
          ref={input} className="palette-input" type="text" role="combobox" aria-expanded="true" aria-controls="palette-list" aria-autocomplete="list"
          aria-activedescendant={shown[selected] ? `pal-${shown[selected].id}` : undefined} aria-label={t("pal.title")} placeholder={t("pal.placeholder")}
          autoComplete="off" spellCheck={false} value={q} onChange={(e) => { setQ(e.target.value); setSel(0); }}
        />
        <ul className="palette-list" id="palette-list" role="listbox" aria-label={t("pal.title")}>
          {shown.map((c, i) => (
            <li key={c.id} id={`pal-${c.id}`} role="option" aria-selected={i === selected} onClick={() => run(c)} onPointerMove={() => setSel(i)}>{c.label}</li>
          ))}
        </ul>
        {shown.length === 0 && <p className="palette-empty mono tiny" role="status">{t("pal.empty")}</p>}
        <p className="palette-hint mono tiny">{t("pal.hint")}</p>
      </div>
    </dialog>
  );
}
