const BP = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/** Prefix a site path with the deployment base path. Plain <a> and location.href do not get it from Next (next/link and router do). */
export const withBase = (path: string) => (path.startsWith("/") ? BP + path : path);

/** The inverse, for matching a browser pathname against the app's own route table. */
export const withoutBase = (path: string) => (BP && path.startsWith(`${BP}/`) ? path.slice(BP.length) : path);
