import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Removed 'output: "standalone"' - this is for Docker deployments
  // Vercel handles the build output automatically
  
  webpack: (config, { isServer }) => {
    // Suppress warnings for optional dependencies in snoowrap/ws
    // These are optional performance enhancements, not required
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        bufferutil: false,
        'utf-8-validate': false,
      };
    }
    
    return config;
  },
};

export default nextConfig;
