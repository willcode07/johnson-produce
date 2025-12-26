import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Remove static export to enable API routes for admin dashboard
  // Set output: 'export' only when building for static hosting
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  // Note: For App Router, body size limits are handled in route handlers
  // The MAX_FILE_SIZE constant in the upload route controls the limit
  // Comment out basePath for local development
  // Uncomment when deploying to a subdirectory
  // basePath: '/johnson-produce',
  // assetPrefix: '/johnson-produce',
};

export default nextConfig;
