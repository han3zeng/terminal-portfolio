import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Fully static site, deployed to GitHub Pages at /terminal-portfolio
  output: "export",
  basePath: "/terminal-portfolio",
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
