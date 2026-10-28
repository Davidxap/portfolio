import { notFound } from "next/navigation";
import { JsonLd } from "@/components/JsonLd";
import { ProjectPage } from "@/components/ProjectPage";
import { ProjectsPanel } from "@/components/places/ProjectsPanel";
import { PlaceView } from "@/components/world/PlaceView";
import { projects } from "@/data/projects";
import { projectPath } from "@/i18n/ui";
import { pageMetadata } from "@/lib/seo";

const locale = "en" as const;
export const dynamicParams = false;
export const generateStaticParams = () => projects.map((p) => ({ slug: p.slug }));

const find = async (params: Promise<{ slug: string }>) => {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  if (!project) notFound();
  return project;
};
const titleOf = (p: (typeof projects)[number]) => `${p.name} — ${p.tagline[locale]} · David Arroyave Pérez`;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const p = await find(params);
  return pageMetadata({ locale, path: projectPath(locale, p.slug), title: titleOf(p), description: p.summary[locale] });
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const p = await find(params);
  return (<><JsonLd locale={locale} path={projectPath(locale, p.slug)} title={titleOf(p)} description={p.summary[locale]} /><PlaceView app="projects" locale={locale} sub={p.name} partner={{ app: "projects", node: <ProjectsPanel locale={locale} initial={p.slug} h1={false} embedded /> }}><ProjectPage locale={locale} project={p} /></PlaceView></>);
}
