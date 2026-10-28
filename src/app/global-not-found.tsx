import type { Metadata } from "next";
import { RootHtml } from "@/components/RootHtml";
import { PixelDavid } from "@/components/world/PixelDavid";

export const metadata: Metadata = {
  title: "Page not found · David Arroyave Pérez",
  description: "This page does not exist. Go back to the portfolio of David Arroyave Pérez.",
};

/** English and Spanish 404 for unmatched URLs (the app has one root layout per locale, so there is no shared layout to compose from). */
export default function GlobalNotFound() {
  return (
    <RootHtml locale="en">
      <main className="nf pdavid-host">
        <PixelDavid className="nf-avatar" height={216} />
        <p className="eyebrow">404 // Lost in the fog</p>
        <h1>This page does not exist.</h1>
        <p lang="es">Esta página no existe.</p>
        <div className="nf-links">
          <a className="btn primary" href="/">Back to the portfolio</a>
          <a className="btn" href="/es/" lang="es">Volver al portafolio</a>
        </div>
      </main>
    </RootHtml>
  );
}
