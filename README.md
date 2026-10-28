# David Arroyave Pérez: Portfolio

An interactive portfolio presented as a Linux-style desktop of Manizales, Colombia, plus a one-page "Direct" version for quick reading.

## What is inside

- **Six places** on a painted map of Manizales: About, Projects, Experience, Stack, Arcade and Contact. Each one opens with the keyboard, a gamepad or a click.
- **Direct view** (`/direct/`, `/es/directo/`): a single page with the essentials for a quick read.
- **Arcade**: seven small minigames inspired by the projects on the site, each with a "How to play" card and an annotated code walkthrough.
- **Eight colour themes** named after Manizales: Chipre (the default sunset), Páramo (the light one), Tinto, Cafetal, Niebla, Nevado, Cable and Catedral. The choice is remembered, and every theme passes WCAG AA contrast.
- **Available in English and Spanish**, with reciprocal `hreflang` and JSON-LD.
- **Prerendered pages** and a sitemap, so search engines and applicant tracking systems can read every page.
- **ATS-friendly CV PDFs**, built from the HTML sources in `cv-src/`.

Sounds are generated with Web Audio and stay muted until you opt in. Motion respects reduced-motion settings.

## Tech stack

| Area | Version (from `package.json`) |
| --- | --- |
| Next.js | `^16.4.3` (static export) |
| React and React DOM | `^19.3.1` |
| TypeScript | `^5.9.3` |
| Tailwind CSS | `^4.3.3` (via `@tailwindcss/postcss`) |
| Motion | `^14.6.0` |
| Vitest | `^5.0.5` |

## Getting started

```sh
npm install
npm run dev       # development server at http://localhost:3000
npm run build     # static export to out/
npm start         # serves out/ with npx serve
npm run check     # typecheck, tests and the build-time checks
```

`npm run check` runs the honesty check against the exported `out/` folder, so run `npm run build` first.

## Configuration

`SITE_URL` sets the canonical origin used to build absolute URLs. It defaults to `http://localhost:3000`.

Resolution order (see `src/lib/site.ts`):

1. `SITE_URL`, if set (a trailing slash is removed).
2. `https://` plus `VERCEL_PROJECT_PRODUCTION_URL`, which Vercel provides automatically.
3. `http://localhost:3000`.

## Project structure

```text
src/
  app/          Routes: one root layout per locale, sitemap, robots, global 404
  components/   Places, the desktop world, arcade console, command palette, theme menu
  data/         Content registries: places, projects, games, media, about, experience
  lib/          Helpers: site URL, fonts, SEO, JSON-LD, routing, theme, sound, input
  styles/       Stylesheets for tokens, themes, desktop, apps and the arcade
  i18n/         Locale support
scripts/        Build-time tools: favicon, screenshot capture, checks, CV PDF, Open Graph images
tests/          Vitest suites for data, routes, SEO, games and UI
public/         Static assets: art, cv, fonts, media, og images, icons, web manifest
cv-src/         HTML sources for the English and Spanish CVs
```

## Adding content

- **A project**: add one entry to `src/data/projects.ts`. Screenshots go in `src/data/media.ts`. Featured projects appear on the select screen and in the Direct view.
- **A minigame**: add one module under `src/components/console/demos/` and one entry in `src/data/games.ts`. The page lazy-loads the module.
- **A place**: add one entry to `src/data/places.ts`, plus one page per locale (under `src/app/(en)` and `src/app/(es)/es`).

## Quality

- `npm test`: the Vitest suites in `tests/`.
- `npm run typecheck`: TypeScript in strict mode, without emitting files.
- `npm run check:honesty`: checks the copy of the exported site (`out/`).
- `npm run check:contrast`: checks WCAG contrast for the colour palettes.
- `npm run check:eventloop`: checks the event-loop traces shown in the demos.

## Art and credits

The illustrations are AI-generated and art-directed by David. The site discloses this. Fonts are self-hosted from `public/fonts`: Fraunces, Bricolage Grotesque and JetBrains Mono (all under the SIL Open Font License).

## Deploy

The project is a static export (`output: "export"`, `trailingSlash: true`, unoptimized images). `npm run build` writes plain files to `out/`, which any static host can serve.

Primary deployment is GitHub Pages: `https://davidxap.github.io/portfolio/` (details below). It also works on Vercel without extra configuration — the production URL is picked up automatically. Once a custom domain exists, set `SITE_URL` to that origin.

### GitHub Pages

`.github/workflows/deploy-pages.yml` publishes `out/` on every push to `main`, serving the site under `https://davidxap.github.io/portfolio/` (GitHub Pages requires the "GitHub Actions" source option once). The workflow sets `SITE_URL=https://davidxap.github.io/portfolio` and `NEXT_PUBLIC_BASE_PATH=/portfolio`; `NEXT_PUBLIC_BASE_PATH` enables the Next.js basePath, and `scripts/gh-pages.mjs` rewrites the root-absolute asset references inside the export (`scripts/gh-pages.mjs` runs after `next build` only in CI — local dev and Vercel need none of this). `site.ts` joins `SITE_URL` paths under that origin, so sitemap, robots and canonical URLs keep working.

## License

All rights reserved. The code is published to show the work; please ask before reusing it.
