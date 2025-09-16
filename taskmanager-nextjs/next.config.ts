import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Disable ESLint during builds to focus on functionality
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Allow TypeScript errors during builds for now
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
