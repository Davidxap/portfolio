import type { ReactNode } from "react";
import type { Locale } from "@/data/projects";
import { fontClasses } from "@/lib/fonts";
import { DEFAULT_THEME, THEME_INIT_SCRIPT } from "@/lib/theme";
import "@/app/globals.css";

/** One <html> per locale (separate route groups), so lang is correct in the static HTML without JS. */
export function RootHtml({ locale, children }: { locale: Locale; children: ReactNode }) {
  return (
    <html lang={locale} data-theme={DEFAULT_THEME} className={fontClasses} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
