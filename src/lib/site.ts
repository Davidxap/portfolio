// The public origin. Set SITE_URL when the final domain exists; on Vercel the production URL is picked up automatically.
// On GitHub Pages it includes the project path (https://user.github.io/portfolio) and NEXT_PUBLIC_BASE_PATH mirrors it.
const fromVercel = process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : undefined;
export const SITE_URL = (process.env.SITE_URL ?? fromVercel ?? "http://localhost:3000").replace(/\/$/, "");

/** The base path of the deployment ("" on Vercel and local dev, "/portfolio" on GitHub Pages). */
export const BP = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/** Absolute URL for a site path: joined below SITE_URL, so a subpath like /portfolio is kept. */
export const abs = (path: string, site: string = SITE_URL) =>
  new URL(path.replace(/^\//, ""), `${site}/`).href;
