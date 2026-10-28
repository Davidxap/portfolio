import { projects, type Locale } from "@/data/projects";
import { places } from "@/data/places";
import { cvPath, directPath, homePath, projectPath, useT } from "@/i18n/ui";
import { THEME_META, THEMES, type Theme } from "@/lib/theme";

export type Action = "nav" | "cv" | "copy" | "lang" | "theme";
export type Command = { id: string; label: string; group: string; action: Action; href?: string; theme?: Theme };

export function buildCommands(locale: Locale): Command[] {
  const t = useT(locale);
  const home = homePath(locale);
  return [
    { id: "nav-map", label: `${t("pal.go")} ${t("bz.map")}`, group: t("pal.g.nav"), action: "nav", href: home },
    ...places.map((p): Command => ({ id: `nav-${p.id}`, label: `${t("pal.go")} ${p.label[locale]}`, group: t("pal.g.nav"), action: "nav", href: p.path[locale] })),
    { id: "nav-direct", label: `${t("pal.go")} ${t("bz.direct")}`, group: t("pal.g.nav"), action: "nav", href: directPath(locale) },
    ...projects.map((p): Command => ({ id: `proj-${p.slug}`, label: `${t("pal.open")} ${p.chapter} · ${p.name}`, group: t("pal.g.proj"), action: "nav", href: projectPath(locale, p.slug) })),
    ...THEMES.map((th): Command => ({ id: `theme-${th}`, label: `${t("pal.theme")}: ${THEME_META[th].name}`, group: t("pal.g.theme"), action: "theme", theme: th })),
    { id: "cv", label: t("cv.download"), group: t("pal.g.act"), action: "cv", href: cvPath(locale) },
    { id: "copy", label: t("pal.copy"), group: t("pal.g.act"), action: "copy" },
    { id: "lang", label: t("pal.lang"), group: t("pal.g.act"), action: "lang" },
  ];
}

export function filterCommands(cmds: Command[], query: string): Command[] {
  const q = query.trim().toLowerCase();
  return q ? cmds.filter((c) => c.label.toLowerCase().includes(q)) : cmds;
}
