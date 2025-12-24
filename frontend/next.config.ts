import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Removed 'output: "standalone"' - this is for Docker deployments
  // Vercel handles the build output automatically
};

export default nextConfig;
