"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { tokenize } from "@/lib/tokenize";
import type { Step } from "@/lib/walkthrough";

const reduced = () => typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
const heading = { en: "Walkthrough", es: "Recorrido" } as const;


/** Code of the running cartridge: highlighted, with line numbers, typed in whenever the cartridge changes (not for reduced motion). */
export function CodePanel({ code, steps, active, onSelect, locale, caption, note }: {
  code: string; steps: Step[]; active: string | null; onSelect: (id: string) => void; locale: "en" | "es"; caption: string; note: string;
}) {
  const tokens = useMemo(() => tokenize(code), [code]);
  const lines = useMemo(() => code.split("\n").length, [code]);
  const [shown, setShown] = useState(code.length);
  const first = useRef(true);

  useEffect(() => {
    if (first.current) { first.current = false; return; }
    if (reduced()) { setShown(code.length); return; }
    setShown(0);
    const step = Math.max(8, Math.ceil(code.length / 26));
    let at = 0;
    const id = setInterval(() => {
      at = Math.min(code.length, at + step);
      setShown(at);
      if (at >= code.length) clearInterval(id);
    }, 24);
    return () => clearInterval(id);
  }, [code]);

  // Split tokens into lines (a token may span newlines); characters past `shown` are still "typing in".
  const rows: React.ReactNode[][] = [[]];
  let pos = 0;
  tokens.forEach((t, i) => {
    t.text.split("\n").forEach((part, j) => {
      if (j > 0) { rows.push([]); pos += 1; }
      if (part) {
        const k = Math.max(0, Math.min(part.length, shown - pos));
        if (k > 0) rows[rows.length - 1].push(<span key={`${i}.${j}`} className={`tk-${t.kind}`}>{part.slice(0, k)}</span>);
        if (k < part.length) rows[rows.length - 1].push(<span key={`${i}.${j}r`} className="tk-rest">{part.slice(k)}</span>);
      }
      pos += part.length;
    });
  });

  const cur = steps.find((x) => x.id === active) ?? null;
  const box = useRef<HTMLDivElement>(null);
  // Bring the active range into view by scrolling the code box only, never the page.
  useEffect(() => {
    const el = box.current;
    const first = cur && (el?.querySelector(`[data-line="${cur.from}"]`) as HTMLElement | null);
    if (!el || !cur || !first) return;
    const last = el.querySelector(`[data-line="${cur.to}"]`) as HTMLElement | null;
    const base = el.getBoundingClientRect().top - el.scrollTop;
    const top = first.getBoundingClientRect().top - base;
    const bottom = (last ?? first).getBoundingClientRect().bottom - base;
    if (top >= el.scrollTop && bottom <= el.scrollTop + el.clientHeight) return;
    const to = Math.max(0, top - 8);
    if (typeof el.scrollTo === "function") el.scrollTo({ top: to, behavior: reduced() ? "auto" : "smooth" });
    else el.scrollTop = to;
  }, [cur]);
  return (
    <figure className="cs-code">
      <figcaption className="mono tiny">{caption}</figcaption>
      <div className="cs-src" ref={box} tabIndex={0} data-has-step={cur ? "true" : "false"}>
        <span className="cs-ln" aria-hidden="true">{Array.from({ length: lines }, (_, i) => i + 1).join("\n")}</span>
        <pre><code>{rows.map((r, i) => {
          const n = i + 1;
          const on = !!cur && n >= cur.from && n <= cur.to;
          return <span key={n} className="cs-line" data-line={n} data-on={on ? "true" : "false"}>{r.length ? r : " "}</span>;
        })}</code></pre>
      </div>
      {steps.length > 0 && (
        <ol className="cs-steps" aria-label={heading[locale]}>
          {steps.map((x) => (
            <li key={x.id}>
              <button type="button" className="cs-step" aria-current={x.id === active ? "step" : undefined} onClick={() => onSelect(x.id)}>
                <span className="mono tiny">{x.from === x.to ? x.from : `${x.from}-${x.to}`}</span> {x[locale]}
              </button>
            </li>
          ))}
        </ol>
      )}
      <p className="tiny">{note}</p>
    </figure>
  );
}
