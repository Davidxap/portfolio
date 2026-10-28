import type { Locale } from "@/data/projects";
import { buildJsonLd, jsonLdString } from "@/lib/jsonld";

export function JsonLd({ locale, path, title, description }: { locale: Locale; path: string; title: string; description: string }) {
  const ld = buildJsonLd({ locale, path, title, description });
  return ld ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(ld) }} /> : null;
}
