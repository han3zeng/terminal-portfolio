import type { NextConfig } from "next";

import { BASE_PATH } from "./src/site";

const nextConfig: NextConfig = {
  // Fully static site, deployed to GitHub Pages under BASE_PATH
  output: "export",
  basePath: BASE_PATH,
  trailingSlash: true,
  images: { unoptimized: true },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
