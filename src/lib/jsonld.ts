// Port of the Astro Seo component's JSON-LD graphs. Prerendered, no client JS.
import { projects, type Locale } from "@/data/projects";
import { person } from "@/data/site";
import { abs, SITE_URL } from "@/lib/site";
import { gameById, gameTitle } from "@/data/games";
import { placeById } from "@/data/places";
import { parsePath } from "@/lib/routes";

type Input = { locale: Locale; path: string; title: string; description: string; site?: string };
type Node = Record<string, unknown>;

export function buildJsonLd({ locale, path, title, description, site = SITE_URL }: Input): Node | null {
  const a = (p: string) => abs(p, site);
  const root = a("/").replace(/\/$/, "");
  const info = parsePath(path);
  const project = info.kind === "project" ? projects.find((p) => p.slug === info.slug) : undefined;
  const ogImage = a(`/og/${project ? project.slug : "home"}-${locale}.png`);

  const personId = `${root}/#person`;
  const personNode: Node = {
    "@type": "Person",
    "@id": personId,
    name: person.name,
    alternateName: [person.shortName, person.legalName],
    jobTitle: person.jobTitle,
    url: a("/"),
    email: `mailto:${person.email}`,
    address: { "@type": "PostalAddress", addressLocality: person.city, addressRegion: person.region, addressCountry: person.country },
    knowsLanguage: [...person.languages],
    knowsAbout: [...person.knowsAbout],
    sameAs: [person.github, person.linkedin],
    alumniOf: { "@type": "CollegeOrUniversity", name: "Universidad de Caldas" },
  };

  let graph: Node[] = [];
  if (info.kind === "home" || info.kind === "direct") {
    graph = [
      {
        "@type": "ProfilePage",
        "@id": `${a(path)}#profile`,
        url: a(path),
        name: title,
        description,
        inLanguage: locale,
        isPartOf: { "@id": `${root}/#website` },
        mainEntity: personNode,
      },
      { "@type": "WebSite", "@id": `${root}/#website`, name: person.name, url: a("/"), inLanguage: ["en", "es"], publisher: { "@id": personId } },
    ];
  } else if (info.kind === "place" || info.kind === "game") {
    // A place or a game: a WebPage about the person, under a breadcrumb that starts at the map.
    const place = info.kind === "place" ? placeById(info.id) : placeById("arcade");
    const game = info.kind === "game" ? gameById(info.id) : undefined;
    const crumbs = [
      { name: locale === "en" ? "Home" : "Inicio", item: a(locale === "en" ? "/" : "/es/") },
      ...(game ? [{ name: place.label[locale], item: a(place.path[locale]) }, { name: gameTitle(game, locale), item: a(path) }] : [{ name: place.label[locale], item: a(path) }]),
    ];
    graph = [
      personNode,
      {
        "@type": "WebPage",
        "@id": `${a(path)}#page`,
        url: a(path),
        name: title,
        description,
        inLanguage: locale,
        isPartOf: { "@id": `${root}/#website` },
        about: { "@id": personId },
        breadcrumb: { "@id": `${a(path)}#breadcrumb` },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${a(path)}#breadcrumb`,
        itemListElement: crumbs.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.name, item: c.item })),
      },
    ];
  } else if (project) {
    const repo = project.links.find((l) => l.kind === "repo")?.url;
    const read = project.links.find((l) => l.kind === "read")?.url;
    const demo = project.links.find((l) => l.kind === "demo")?.url;
    const common = {
      "@id": `${a(path)}#work`,
      name: project.name,
      description: project.summary[locale],
      url: a(path),
      inLanguage: locale,
      author: { "@id": personId },
      image: ogImage,
    };
    let work: Node;
    if (read) work = { "@type": "LearningResource", ...common, isAccessibleForFree: true, learningResourceType: "website", inLanguage: ["es", "en"], workExample: { "@type": "WebSite", url: read }, ...(repo ? { sameAs: repo } : {}) };
    else if (repo) work = { "@type": "SoftwareSourceCode", ...common, codeRepository: repo, programmingLanguage: project.stack };
    else work = { "@type": "CreativeWork", ...common, ...(demo ? { sameAs: demo } : {}) };
    graph = [
      personNode,
      work,
      {
        "@type": "BreadcrumbList",
        "@id": `${a(path)}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: locale === "en" ? "Home" : "Inicio", item: a(locale === "en" ? "/" : "/es/") },
          { "@type": "ListItem", position: 2, name: project.name, item: a(path) },
        ],
      },
    ];
  }
  return graph.length ? { "@context": "https://schema.org", "@graph": graph } : null;
}

/** Safe to inline in a <script type="application/ld+json"> tag. */
export const jsonLdString = (ld: Node) => JSON.stringify(ld).replace(/</g, "\\u003c");
