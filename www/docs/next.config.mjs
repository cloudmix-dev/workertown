import withMarkdoc from "@markdoc/next.js";

import withSearch from "./src/markdoc/search.mjs";

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    scrollRestoration: true,
  },
  pageExtensions: ["ts", "tsx", "md"],
  reactStrictMode: true,
};

export default withSearch(
  withMarkdoc({ schemaPath: "./src/markdoc" })(nextConfig),
);
