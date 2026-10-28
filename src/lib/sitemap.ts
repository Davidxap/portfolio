import type { MetadataRoute } from "next";
import { abs, SITE_URL } from "@/lib/site";
import { allPages, alternatesFor } from "@/lib/routes";

/** One entry per page with reciprocal en/es alternates and x-default → English. */
export function buildSitemap(site: string = SITE_URL): MetadataRoute.Sitemap {
  return allPages().map((path) => {
    const alt = alternatesFor(path);
    return {
      url: abs(path, site),
      alternates: { languages: { en: abs(alt.en, site), es: abs(alt.es, site), "x-default": abs(alt.en, site) } },
    };
  });
}
