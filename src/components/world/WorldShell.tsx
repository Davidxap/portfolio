"use client";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { nextPlace, placeIndex, places, prevPlace, type PlaceId } from "@/data/places";
import { cvPath, directPath, useT } from "@/i18n/ui";
import type { Locale } from "@/data/projects";
import { useW } from "@/i18n/world";
import { initGamepad } from "@/lib/gamepad";
import { resolveKey, stepPlace, type Target, type View, type WorldAction } from "@/lib/keys";
import { alternatesFor, parsePath } from "@/lib/routes";
import { play, playKey } from "@/lib/sound";
import { markVisited, readVisited } from "@/lib/visited";
import { nearestInDirection, parentPath, type Dir } from "@/lib/world";
import { CommandPalette } from "../CommandPalette";
import { InputBus, type Action } from "../console/input";
import { Dock, type KeyId } from "./Dock";
import { Coach } from "./Guide";
import { DesktopBar } from "./DesktopBar";
import { TabBar } from "./TabBar";
import { TopBar } from "./TopBar";
import { Wallpaper } from "./Wallpaper";

const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
const INTERACTIVE = "a, button, input, textarea, select, summary, [role=tab], [role=option]";

/** Facts about the element that received a key, so lib/keys.ts can route it without touching the DOM. */
function targetOf(el: EventTarget | null): Target {
  if (!(el instanceof HTMLElement)) return { typing: false, interactive: false, pin: false, neutral: true, body: true };
  const typing = el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName) || !!el.closest('[role="listbox"],[role="combobox"],dialog[open]');
  const pin = el.hasAttribute("data-pin");
  const scroller = el.classList.contains("sheet-scroll") || el.id === "content";
  const body = el === document.body || el === document.documentElement;
  return { typing, pin, interactive: !pin && !!el.closest(INTERACTIVE), neutral: body || scroller || pin, body };
}

/** The scrolling body of the focused window (the desktop's only scroller), or the plain sheet in the flat direct view. */
const focusedScroller = () => document.querySelector<HTMLElement>(".win[data-focus='true'] .win-body") ?? document.querySelector<HTMLElement>(".sheet-scroll");

const viewOf = (kind: ReturnType<typeof parsePath>["kind"]): View => (kind === "project" ? "project" : kind);

/** The persistent world: the Hyprland desktop fills the viewport on every route. `/` and `/es/` show it empty (wallpaper with its glowing
 * points, bar, dock, the identity widget); every other route opens a tiling window on it. Closing the last window lands on the empty desktop,
 * where Esc does nothing. The desktop never unmounts, so nothing flashes while windows come and go. It lives in the locale
 * layouts, so it survives navigation. The direct view is flat. */
export function WorldShell({ locale, children }: { locale: Locale; children: ReactNode }) {
  const t = useT(locale);
  const w = useW(locale);
  const pathname = usePathname();
  const router = useRouter();
  const info = parsePath(pathname);
  const view = viewOf(info.kind);
  const flat = view === "direct";
  const active: PlaceId | null = info.kind === "place" ? info.id : info.kind === "project" ? "projects" : info.kind === "game" ? "arcade" : null;
  const alt = alternatesFor(pathname)[locale === "en" ? "es" : "en"];
  const [selected, setSelected] = useState<PlaceId | null>(null);
  const [visited, setVisited] = useState<string[]>([]);
  const subs = useRef(new Set<(a: Action) => void>());
  const prev = useRef<string | null>(null);
  const first = useRef(true);
  const viaPad = useRef(false);
  const [tune, setTune] = useState(0);
  // which way the workspace changed (+1 = a place further along the bar), so windows slide in from that side; derived once per navigation
  const [nav, setNav] = useState({ path: pathname, dir: 0 });
  if (nav.path !== pathname) {
    const a = parsePath(nav.path), b = parsePath(pathname);
    const ia = a.kind === "place" ? placeIndex(a.id) : -1, ib = b.kind === "place" ? placeIndex(b.id) : -1;
    setNav({ path: pathname, dir: ia >= 0 && ib >= 0 && ia !== ib ? Math.sign(ib - ia) : 0 });
  }
  const bus = useMemo(() => ({ subscribe: (fn: (a: Action) => void) => { subs.current.add(fn); return () => { subs.current.delete(fn); }; } }), []);

  useEffect(() => initGamepad(), []);

  useEffect(() => {
    const read = () => setVisited(readVisited());
    read();
    window.addEventListener("visited:change", read);
    return () => window.removeEventListener("visited:change", read);
  }, []);

  const go = useCallback((href: string) => { router.push(href); }, [router]);

  // On every change: count the visit, reset the scroller, put focus on it (so PageUp/PageDown/Space/arrows scroll it natively).
  useEffect(() => {
    const i = parsePath(pathname);
    if (i.kind === "place") markVisited(i.id); else if (i.kind === "project") markVisited("projects"); else if (i.kind === "game") markVisited("arcade");
    setSelected(null);
    if (first.current) { first.current = false; prev.current = pathname; return; }
    // channel change: a short flicker on the glass and a sound that says what happened (open / close / move between places)
    const before = prev.current ? viewOf(parsePath(prev.current).kind) : null;
    const now = viewOf(i.kind);
    if (before !== now || before !== "direct") {
      if (!reduced()) setTune((n) => n + 1);
      play(now === "home" ? "close" : before === "home" ? "open" : "whoosh");
    }
    const sc = focusedScroller();
    sc?.scrollTo({ top: 0 });
    if (document.documentElement.scrollTop) window.scrollTo({ top: 0 });
    (sc ?? document.getElementById("content"))?.focus({ preventScroll: true });
    return () => { prev.current = pathname; };
  }, [pathname]);

  const [pressed, setPressed] = useState<KeyId | null>(null);
  const pressTimer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(pressTimer.current), []);
  const flash = (k: KeyId) => {
    if (viaPad.current) play("pad"); else playKey(k);
    setPressed(k);
    window.clearTimeout(pressTimer.current);
    pressTimer.current = window.setTimeout(() => setPressed(null), 140);
  };

  const back = useCallback(() => {
    const up = parentPath(pathname);
    if (!up) return;
    // closing the last window lands on the empty desktop
    if (parsePath(up).kind === "home") router.replace(up, { scroll: false });
    else if (prev.current === up) router.back(); else go(up);
  }, [pathname, go, router]);

  /** Closing a window plays its exit (the focused one, or all of them when the next stop is the bare desktop), then goes up one level. */
  const closeWin = useCallback(() => {
    const up = parentPath(pathname);
    if (!up) return;
    const toDesktop = parsePath(up).kind === "home";
    const wins = toDesktop ? document.querySelectorAll(".win") : document.querySelectorAll(".win[data-focus='true']");
    if (wins.length && !reduced()) { wins.forEach((el) => el.classList.add("is-closing")); window.setTimeout(back, 190); } else back();
  }, [pathname, back]);
  const closeRef = useRef(closeWin);
  closeRef.current = closeWin;

  const scrollSheet = (dy: number) => {
    const el = focusedScroller();
    const behavior = reduced() ? "auto" : "smooth";
    const target = view === "direct" || !el || el.scrollHeight <= el.clientHeight + 1 ? window : el;
    const h = target === window ? innerHeight : el!.clientHeight;
    target.scrollBy({ top: Math.abs(dy) <= 1 ? dy * h : dy, behavior });
  };

  const pins = () => Array.from(document.querySelectorAll<HTMLAnchorElement>("a[data-pin]"));
  const moveOnMap = (dir: Dir) => {
    const list = pins();
    const cur = list.indexOf(document.activeElement as HTMLAnchorElement);
    const boxes = list.map((p) => { const r = p.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
    const n = nearestInDirection(boxes, cur, dir);
    if (n >= 0) list[n].focus({ preventScroll: true });
  };

  const run = useCallback((a: WorldAction) => {
    switch (a.type) {
      case "palette": window.dispatchEvent(new Event("palette:open")); return;
      case "scroll": scrollSheet(a.dy); return;
      case "back": flash("esc"); closeWin(); return;
      case "place": flash(`p${a.index}`); go(places[a.index].path[locale]); return;
      case "game": {
        flash(a.action === "a" ? "enter" : a.action === "b" ? "esc" : a.action);
        if (a.action === "b") return back();
        subs.current.forEach((fn) => fn(a.action));
        return;
      }
      case "open": {
        flash("enter");
        const focused = document.activeElement as HTMLElement | null;
        if (focused?.hasAttribute("data-pin")) { focused.click(); return; }
        if (view === "home") {
          const list = pins();
          (list.find((p) => p.dataset.pin === selected) ?? list[0])?.focus({ preventScroll: true });
          return;
        }
        if (focused?.closest(".sheet-scroll") && focused.matches("a, button")) focused.click();
        else document.querySelector<HTMLElement>("[data-next-place]")?.click();
        return;
      }
      case "move": {
        flash(a.dir);
        if (view === "home") return moveOnMap(a.dir);
        if (view === "place" && info.kind === "place") { go((a.dir === "right" ? nextPlace(info.id) : prevPlace(info.id)).path[locale]); }
        else if (a.dir === "up" || a.dir === "down") scrollSheet(a.dir === "down" ? 60 : -60);
      }
    }
  }, [view, info, go, back, closeWin, locale, selected]); // eslint-disable-line react-hooks/exhaustive-deps

  const runRef = useRef(run);
  runRef.current = run;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented) return;
      const v = viewOf(parsePath(location.pathname).kind);
      const a = resolveKey(e, v, targetOf(e.target));
      if (!a) return;
      e.preventDefault();
      runRef.current(a);
    };
    const open = () => !!document.querySelector("dialog[open]");
    const move = (ev: Event) => {
      if (open()) return;
      const { dx, dy } = (ev as CustomEvent<{ dx: number; dy: number }>).detail;
      const v = viewOf(parsePath(location.pathname).kind);
      const dir: Dir | null = dx ? (dx > 0 ? "right" : "left") : dy ? (dy > 0 ? "down" : "up") : null;
      if (!dir) return;
      pad(() => {
        if (v === "game") runRef.current({ type: "game", action: dir });
        else if (v !== "home" && (dir === "up" || dir === "down")) runRef.current({ type: "scroll", dy: dir === "down" ? 0.5 : -0.5 });
        else runRef.current({ type: "move", dir });
      });
    };
    const pad = (fn: () => void) => { viaPad.current = true; try { fn(); } finally { viaPad.current = false; } };
    const a = () => {
      if (open()) return;
      const v = viewOf(parsePath(location.pathname).kind);
      pad(() => runRef.current(v === "game" ? { type: "game", action: "a" } : { type: "open" }));
    };
    const b = () => { if (!open()) pad(() => runRef.current(viewOf(parsePath(location.pathname).kind) === "game" ? { type: "game", action: "b" } : { type: "back" })); };
    const onClose = () => closeRef.current();
    window.addEventListener("keydown", onKey);
    window.addEventListener("win:close", onClose);
    document.addEventListener("pad:move", move); document.addEventListener("pad:a", a); document.addEventListener("pad:b", b);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("win:close", onClose);
      document.removeEventListener("pad:move", move); document.removeEventListener("pad:a", a); document.removeEventListener("pad:b", b);
    };
  }, []);

  // Any internal plain link (cards, project links, palette) navigates inside the world, so the stage never reloads.
  const onClick = (e: React.MouseEvent) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = (e.target as Element).closest("a");
    if (!a || a.hasAttribute("download") || a.target || a.origin !== location.origin || a.getAttribute("hreflang")) return;
    const url = new URL(a.href);
    if (!url.pathname.endsWith("/") || parsePath(url.pathname).locale !== locale) return;
    if (url.pathname === location.pathname && url.hash) return;
    e.preventDefault();
    go(url.pathname + url.search + url.hash);
  };

  const current = info.kind === "place" ? info.id : active;
  const onPinFocus = useCallback((id: PlaceId) => setSelected(id), []);
  const sel = selected ?? (view === "home" ? null : current);

  const content = (
    <InputBus.Provider value={bus}>
      {flat
        ? <main id="content" className="sheet-scroll" tabIndex={-1}>{children}</main>
        : <main id="content" className="windows" data-dir={nav.dir} tabIndex={-1} aria-label={w("desk.label")}>{children}</main>}
    </InputBus.Provider>
  );

  return (
    <div className="world" data-mode={flat ? "flat" : "world"} data-view={view} data-place={active ?? "map"} onClick={onClick}>
      <a className="skip" href="#content">{t("skip")}</a>
      <div className="grain" aria-hidden="true" />
      {flat ? (
        <>
          <TopBar locale={locale} altPath={alt} flat />
          {content}
        </>
      ) : (
        <div className="screen-layer world-card">
          <Wallpaper locale={locale} active={active} selected={sel} visited={visited} onPinFocus={onPinFocus} />
          <DesktopBar locale={locale} altPath={alt} active={active} visited={visited} />
          <div className="desktop" data-view={view} role="region" aria-label={w("stage.label")}>{content}</div>
          <Dock locale={locale} current={current} selected={sel} pressed={pressed} windowOpen={view !== "home"} onEsc={closeWin} />
          <Coach locale={locale} hidden={view !== "home"} />
          <TabBar locale={locale} current={current} />
          <div className="screen-fx" aria-hidden="true">{tune > 0 && <span key={tune} className="fx-tune" />}</div>
        </div>
      )}
      <footer className="mirror">
        <nav aria-label={t("bz.mirror")}>
          {places.map((p) => <a key={p.id} href={p.path[locale]}>{p.label[locale]}</a>)}
          <a href={directPath(locale)}>{t("bz.direct")}</a>
          <a href={cvPath(locale)} download>{t("cv.download")}</a>
        </nav>
        <p className="mono tiny">{t("foot.built")}</p>
      </footer>
      <CommandPalette locale={locale} altPath={alt} onNavigate={(href) => go(href)} />
    </div>
  );
}
