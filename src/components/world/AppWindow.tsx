"use client";
import type { ReactNode } from "react";
import { placeIndex, type PlaceId } from "@/data/places";
import type { Locale } from "@/data/projects";
import { useW } from "@/i18n/world";
import { APP_TITLE } from "./app-title";
import { BrandMark } from "./BrandMark";
import { ArtIcon } from "./icons";

/** A tiling window on the desktop: rounded, translucent and blurred, with the animated gradient active border, a title bar with the app
 * name, its workspace number and the close control (Esc). Mounted by the page, so each navigation plays the entrance; the shell plays the
 * exit before it leaves. The focused window owns the keyboard (scrolling) and the border. */
export function AppWindow({ app, focus, locale, title, children }: { app: PlaceId; focus: boolean; locale: Locale; title?: string; children: ReactNode }) {
  const w = useW(locale);
  return (
    <section className="win" data-app={app} data-focus={focus} aria-label={title ?? APP_TITLE[app]}>
      <header className="win-bar">
        <ArtIcon name={app} size={18} className="win-ic" />
        <BrandMark size={14} className="win-brand" />
        <span className="win-title mono">{title ?? APP_TITLE[app]}</span>
        <span className="win-ws mono" aria-hidden="true">{placeIndex(app) + 1}</span>
        <button className="win-x" type="button" tabIndex={focus ? 0 : -1} aria-label={w("win.close")} title={w("win.close")} onClick={() => window.dispatchEvent(new Event("win:close"))}>
          <span aria-hidden="true">✕</span><kbd className="mono" aria-hidden="true">Esc</kbd>
        </button>
      </header>
      <div className="win-body sheet-scroll" tabIndex={focus ? -1 : undefined}>{children}</div>
    </section>
  );
}
