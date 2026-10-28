// The public origin. Set SITE_URL when the final domain exists; on Vercel the production URL is picked up automatically.
const fromVercel = process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : undefined;
export const SITE_URL = (process.env.SITE_URL ?? fromVercel ?? "http://localhost:3000").replace(/\/$/, "");

/** Absolute URL for a site path. */
export const abs = (path: string, site: string = SITE_URL) => new URL(path, `${site}/`).href;
