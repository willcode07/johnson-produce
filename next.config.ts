import type { NextConfig } from "next";

/**
 * GitHub Pages serves this project at /johnson-produce/.
 * `output: 'export'` writes the static site to ./out, which
 * .github/workflows/nextjs.yml uploads as the Pages artifact.
 * basePath is always on so local dev matches the deployed asset paths
 * (open http://localhost:3000/johnson-produce/).
 */
const basePath = "/johnson-produce";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // Last working Pages config published this directory. Next still
  // builds intermediates in .next and copies the site to ./out.
  distDir: "out",
  basePath,
  assetPrefix: basePath,
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
};

export default nextConfig;
