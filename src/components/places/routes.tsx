import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { gameById, gameTitle, games } from "@/data/games";
import { placeById, type PlaceId } from "@/data/places";
import type { Locale } from "@/data/projects";
import { directPath, gamePath, useT } from "@/i18n/ui";
import { pageMetadata } from "@/lib/seo";
import { JsonLd } from "../JsonLd";
import { PlaceView } from "../world/PlaceView";
import { AboutPanel } from "./AboutPanel";
import { ArcadePanel } from "./ArcadePanel";
import { ContactPanel } from "./ContactPanel";
import { DirectView } from "./DirectView";
import { ExperiencePanel } from "./ExperiencePanel";
import { GamePanel } from "./GamePanel";
import { ProjectsPanel } from "./ProjectsPanel";
import { StackPanel } from "./StackPanel";

const panels: Record<PlaceId, (p: { locale: Locale }) => ReactNode | Promise<ReactNode>> = {
  about: AboutPanel, projects: ProjectsPanel, experience: ExperiencePanel, stack: StackPanel, arcade: ArcadePanel, contact: ContactPanel,
};

/** Route module pieces for one place and locale: metadata and the page. Each app route file is three lines that call this. */
export function placeRoute(id: PlaceId, locale: Locale) {
  const place = placeById(id);
  const t = useT(locale);
  const path = place.path[locale];
  const title = `${place.label[locale]} — ${t("meta.suffix")}`;
  const description = place.description[locale];
  const Panel = panels[id] as (p: { locale: Locale }) => Promise<ReactNode>;
  return {
    generateMetadata: () => pageMetadata({ locale, path, title, description }),
    Page: async function Page() {
      return (<><JsonLd locale={locale} path={path} title={title} description={description} /><PlaceView app={id} locale={locale}>{await Panel({ locale })}</PlaceView></>);
    },
  };
}

export function directRoute(locale: Locale) {
  const t = useT(locale);
  const path = directPath(locale);
  const title = `${t("bz.direct")} — ${t("meta.suffix")}`;
  const description = t("meta.description");
  return {
    generateMetadata: () => pageMetadata({ locale, path, title, description }),
    Page: async function Page() {
      return (<><JsonLd locale={locale} path={path} title={title} description={description} /><PlaceView>{await DirectView({ locale })}</PlaceView></>);
    },
  };
}

type Params = Promise<{ id: string }>;
export function gameRoute(locale: Locale) {
  const t = useT(locale);
  const find = async (params: Params) => { const g = gameById((await params).id); if (!g) notFound(); return g; };
  const titleOf = (name: string) => `${name} — ${placeById("arcade").label[locale]} · ${t("meta.suffix")}`;
  return {
    generateStaticParams: () => games.map((g) => ({ id: g.id })),
    generateMetadata: async ({ params }: { params: Params }) => {
      const g = await find(params);
      return pageMetadata({ locale, path: gamePath(locale, g.id), title: titleOf(gameTitle(g, locale)), description: `${gameTitle(g, locale)}: ${g.blurb[locale]}. ${placeById("arcade").description[locale]}` });
    },
    Page: async function Page({ params }: { params: Params }) {
      const g = await find(params);
      const path = gamePath(locale, g.id);
      return (<><JsonLd locale={locale} path={path} title={titleOf(gameTitle(g, locale))} description={g.blurb[locale]} /><PlaceView app="arcade" locale={locale} sub={g.title} partner={{ app: "arcade", node: <ArcadePanel locale={locale} h1={false} embedded /> }}>{await GamePanel({ locale, game: g })}</PlaceView></>);
    },
  };
}
