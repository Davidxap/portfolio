/** @type {import("next").NextConfig} */
const nextConfig = {
  output: "export",
  trailingSlash: true,
  reactStrictMode: true,
  images: { unoptimized: true },
  // one root layout per locale, so unmatched URLs need the global 404
  experimental: { globalNotFound: true },
};
export default nextConfig;
