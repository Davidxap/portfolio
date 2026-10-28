import type { ReactNode } from "react";
import type { PlaceId } from "@/data/places";
import type { Locale } from "@/data/projects";
import { AppWindow } from "./AppWindow";
import { APP_TITLE } from "./app-title";

type Partner = { app: PlaceId; node: ReactNode };

/** Wraps a page's content. A place, project or game page passes its `app`: the content becomes the focused tiling window, and an optional
 * `partner` (the launcher beside a game, the explorer beside a project) is the second window, tiled next to it on wide screens. Without
 * `app` (the desktop widget, the direct view) it is a plain wrapper. The desktop itself never unmounts, so nothing flashes or reflows
 * while windows come and go; every new page mounts its windows and CSS (`.win` in desktop.css) plays their entrance. */
export function PlaceView({ children, app, locale, sub, partner }: { children: ReactNode; app?: PlaceId; locale?: Locale; sub?: string; partner?: Partner }) {
  if (!app || !locale) return <div className="place-view">{children}</div>;
  const title = sub ? `${APP_TITLE[app].split(" — ")[0]} — ${sub}` : undefined;
  return (
    <>
      {partner && <AppWindow app={partner.app} focus={false} locale={locale}>{partner.node}</AppWindow>}
      <AppWindow app={app} focus locale={locale} title={title}>{children}</AppWindow>
    </>
  );
}
