import { existsSync } from "node:fs";
import { join } from "node:path";
import type { Metadata, Viewport } from "next";
import { projects, type Locale } from "@/data/projects";
import { person } from "@/data/site";
import { abs, SITE_URL } from "@/lib/site";
import { alternatesFor, parsePath } from "@/lib/routes";

/** Bump when the icon art changes: browsers cache favicons very aggressively. */
const ICON_V = 2;

export const viewport: Viewport = { themeColor: "#0f1216", width: "device-width", initialScale: 1 };

/** Per-page head metadata: title, description, canonical, reciprocal hreflang, Open Graph and Twitter. */
export function pageMetadata({ locale, path, title, description }: { locale: Locale; path: string; title: string; description: string }): Metadata {
  const info = parsePath(path);
  const project = info.kind === "project" ? projects.find((p) => p.slug === info.slug) : undefined;
  const alt = alternatesFor(path);
  // A project uses its own share image when public/og has one, otherwise the home image (never a 404).
  const own = project && existsSync(join(process.cwd(), "public/og", `${project.slug}-${locale}.png`));
  const image = abs(`/og/${own ? project.slug : "home"}-${locale}.png`);
  const imageAlt = project ? `${project.name} — ${person.name}` : `${person.name} — ${person.jobTitle}`;
  return {
    metadataBase: new URL(SITE_URL),
    title: { absolute: title },
    description,
    robots: { index: true, follow: true },
    authors: [{ name: person.name }],
    icons: {
      // Next prefixes metadata icon/manifest hrefs with basePath automatically.
      icon: [
        { url: `/favicon.ico?v=${ICON_V}`, sizes: "48x48" },
        { url: `/favicon.svg?v=${ICON_V}`, type: "image/svg+xml" },
        { url: `/favicon-32.png?v=${ICON_V}`, sizes: "32x32" },
        { url: `/favicon-16.png?v=${ICON_V}`, sizes: "16x16" },
      ],
      apple: [{ url: `/apple-touch-icon.png?v=${ICON_V}`, sizes: "180x180" }],
    },
    manifest: "/site.webmanifest",
    appleWebApp: { title: "David A." },
    alternates: { canonical: abs(path), languages: { en: abs(alt.en), es: abs(alt.es), "x-default": abs(alt.en) } },
    openGraph: {
      type: project ? "article" : info.kind === "home" || info.kind === "direct" ? "profile" : "website",
      title, description, url: abs(path), siteName: person.name,
      locale: locale === "en" ? "en_US" : "es_CO",
      alternateLocale: locale === "en" ? "es_CO" : "en_US",
      images: [{ url: image, width: 1200, height: 630, alt: imageAlt, type: "image/png" }],
    },
    twitter: { card: "summary_large_image", title, description, images: [{ url: image, alt: imageAlt }] },
  };
}
