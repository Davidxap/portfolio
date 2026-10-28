/** @type {import("next").NextConfig} */
const nextConfig = {
  output: "export",
  trailingSlash: true,
  reactStrictMode: true,
  images: { unoptimized: true },
  // one root layout per locale, so unmatched URLs need the global 404
  experimental: { globalNotFound: true },
  // GitHub Pages serves the site under /portfolio; set NEXT_PUBLIC_BASE_PATH=/portfolio in CI
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || undefined,
};
export default nextConfig;
