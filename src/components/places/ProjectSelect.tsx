"use client";
import { ArrowUpRight, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useMemo, useRef, useState, type CSSProperties } from "react";
import { filterProjects, type ProjectFilter } from "@/lib/project-select";

export type SelectItem = {
  slug: string; name: string; tagline: string; summary: string; status: string; role: string; period: string; metric?: string; color: string;
  category: Exclude<ProjectFilter, "all">; stack: string[]; href: string; featured: boolean;
  cover?: { src: string; width: number; height: number; alt: string };
  links: { label: string; url: string }[];
};
export type SelectLabels = { filters: string; all: string; "full-stack": string; tools: string; learning: string; list: string; preview: string; open: string; hint: string; empty: string; role: string; period: string; stack: string; tap: string };

const GROUPS: Exclude<ProjectFilter, "all">[] = ["full-stack", "tools", "learning"];
const key = (c: string) => ({ "--k": c }) as CSSProperties;

/** The projects place as a file explorer: a tree of folders on the left (one per group, one row per project: key colour, name, period),
 * a path bar on top and a big preview on the right (capture, metric, role, period, stack, links). Real links throughout: without JS the
 * first project is previewed and every row still opens its page. Works for any number of projects and groups; `initial` picks the
 * highlighted project (the explorer tiled beside an open project). */
export function ProjectSelect({ items, labels, locale, initial }: { items: SelectItem[]; labels: SelectLabels; locale: string; initial?: string }) {
  const [slug, setSlug] = useState(initial && items.some((p) => p.slug === initial) ? initial : (items[0]?.slug ?? ""));
  const list = useRef<HTMLDivElement>(null);
  const groups = useMemo(() => GROUPS.map((g) => ({ id: g, items: filterProjects(items, g) })).filter((g) => g.items.length > 0), [items]);
  const current = items.find((p) => p.slug === slug) ?? items[0];

  const focusRow = (i: number) => { const rows = list.current?.querySelectorAll<HTMLAnchorElement>("a.row"); if (rows?.length) rows[(i + rows.length) % rows.length].focus({ preventScroll: false }); };
  const rowIndex = (el: HTMLElement) => Array.from(list.current?.querySelectorAll("a.row") ?? []).indexOf(el);
  const onRowKey = (e: React.KeyboardEvent<HTMLAnchorElement>) => {
    const i = rowIndex(e.currentTarget), n = list.current?.querySelectorAll("a.row").length ?? 0;
    if (e.key === "ArrowDown") focusRow(i + 1);
    else if (e.key === "ArrowUp") focusRow(i - 1);
    else if (e.key === "Home") focusRow(0);
    else if (e.key === "End") focusRow(n - 1);
    else return;
    e.preventDefault();
    e.stopPropagation();
  };
  // On touch screens the first tap previews a row and the second opens it.
  const onRowClick = (e: React.MouseEvent, p: SelectItem) => {
    if (typeof matchMedia === "function" && matchMedia("(hover: none)").matches && current?.slug !== p.slug) { e.preventDefault(); setSlug(p.slug); }
  };

  return (
    <div className="select fm" data-own-keys>
      <p className="fm-path mono" aria-hidden="true"><span className="fm-home">~</span>/projects/<span className="fm-grp">{current?.category}</span>/<span className="fm-cur">{current?.slug}</span></p>
      <div className="select-grid fm-grid">
        <div className="fm-tree" ref={list} role="group" aria-label={labels.list}>
          {items.length === 0 && <p className="select-empty">{labels.empty}</p>}
          {groups.map((g) => (
            <section key={g.id} className="fm-group" aria-label={labels[g.id]}>
              <h2 className="fm-folder mono"><span className="fm-caret" aria-hidden="true">▾</span><span className="fm-fic" aria-hidden="true" />{g.id}/<span className="count">{g.items.length}</span></h2>
              <ul className="select-list">
                {g.items.map((p) => (
                  <li key={p.slug}>
                    <Link className="row" href={p.href} style={key(p.color)} data-current={current?.slug === p.slug} aria-current={current?.slug === p.slug ? "true" : undefined}
                      onFocus={() => setSlug(p.slug)} onMouseEnter={() => setSlug(p.slug)} onClick={(e) => onRowClick(e, p)} onKeyDown={onRowKey}>
                      <span className="row-bar" aria-hidden="true" />
                      <span className="row-main"><b>{p.name}</b><span className="row-role">{p.role}</span></span>
                      <span className="row-period mono">{p.period}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
        {current && (
          <section className="preview" aria-label={labels.preview} aria-live="polite" style={key(current.color)} key={current.slug}>
            {current.cover && (
              <figure className="preview-shot">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={current.cover.src} width={current.cover.width} height={current.cover.height} alt={current.cover.alt} decoding="async" />
              </figure>
            )}
            <div className="preview-body">
              <div className="chips">
                {current.metric && <span className="chip chip-key">{current.metric}</span>}
                <span className="chip">{current.status}</span>
              </div>
              <h2 lang={locale}>{current.name}</h2>
              <p className="preview-tagline">{current.tagline}</p>
              <p className="preview-sum">{current.summary}</p>
              <dl className="preview-meta">
                <div><dt>{labels.role}</dt><dd>{current.role}</dd></div>
                <div><dt>{labels.period}</dt><dd>{current.period}</dd></div>
              </dl>
              <ul className="tags" aria-label={labels.stack}>
                {current.stack.map((s, i) => <li key={s} className="tag" data-i={i % 4}>{s}</li>)}
              </ul>
              <div className="preview-actions">
                <Link className="btn primary" href={current.href}>{labels.open}<ArrowUpRight className="ic" size={16} aria-hidden="true" /></Link>
                {current.links.map((l) => <a key={l.url} className="btn" href={l.url} target="_blank" rel="noopener noreferrer">{l.label}<ExternalLink className="ic" size={15} aria-hidden="true" /></a>)}
              </div>
            </div>
          </section>
        )}
      </div>
      <p className="select-hint mono tiny">{labels.hint}</p>
    </div>
  );
}
