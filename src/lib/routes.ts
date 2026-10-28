import { games } from "@/data/games";
import { places, type PlaceId } from "@/data/places";
import { projects, type Locale } from "@/data/projects";
import { directPath, gamePath, homePath, projectPath } from "@/i18n/ui";

export type PageInfo =
  | { locale: Locale; kind: "home" }
  | { locale: Locale; kind: "project"; slug: string }
  | { locale: Locale; kind: "place"; id: PlaceId }
  | { locale: Locale; kind: "game"; id: string }
  | { locale: Locale; kind: "direct" };

export function parsePath(path: string): PageInfo {
  const locale: Locale = path.startsWith("/es/") ? "es" : "en";
  const place = places.find((p) => p.path[locale] === path);
  if (place) return { locale, kind: "place", id: place.id };
  if (path === directPath(locale)) return { locale, kind: "direct" };
  const game = path.match(/^\/(?:es\/)?arcade\/([^/]+)\/$/);
  if (game) return { locale, kind: "game", id: game[1] };
  const m = path.match(/^\/(es\/proyectos|projects)\/([^/]+)\/$/);
  if (m) return { locale: m[1] === "projects" ? "en" : "es", kind: "project", slug: m[2] };
  return { locale, kind: "home" };
}

/** The English and Spanish URL of the page at `path` (project slugs and game ids are shared, parents differ). */
export function alternatesFor(path: string): Record<Locale, string> {
  const info = parsePath(path);
  switch (info.kind) {
    case "project": return { en: projectPath("en", info.slug), es: projectPath("es", info.slug) };
    case "place": { const p = places.find((x) => x.id === info.id)!; return { en: p.path.en, es: p.path.es }; }
    case "game": return { en: gamePath("en", info.id), es: gamePath("es", info.id) };
    case "direct": return { en: directPath("en"), es: directPath("es") };
    default: return { en: homePath("en"), es: homePath("es") };
  }
}

/** Every public page, English first: map, places, direct view, games, project details. */
export function allPages(): string[] {
  return (["en", "es"] as const).flatMap((l) => [
    homePath(l),
    ...places.map((p) => p.path[l]),
    directPath(l),
    ...games.map((g) => gamePath(l, g.id)),
    ...projects.map((p) => projectPath(l, p.slug)),
  ]);
}
