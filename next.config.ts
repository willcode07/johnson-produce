import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  distDir: 'out',
  basePath: '/johnson-produce',
  assetPrefix: '/johnson-produce',
};

export default nextConfig;
