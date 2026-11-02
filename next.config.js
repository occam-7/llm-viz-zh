/** @type {import('next').NextConfig} */

let withBundleAnalyzer = require("@next/bundle-analyzer")({
    enabled: process.env.ANALYZE === "true",
});

const nextConfig = {
  reactStrictMode: false,
  productionBrowserSourceMaps: true,
  // Always static HTML export for Cloudflare Pages / any static host.
  // Dev-only file-write tooling lives outside the App Router (see scripts/dev-schematic-api.mjs).
  output: 'export',
  basePath: process.env.BASE_PATH || undefined,
  env: { NEXT_PUBLIC_BASE_PATH: process.env.BASE_PATH || '' },
};

module.exports = withBundleAnalyzer(nextConfig);
