import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Configure images to allow high quality
  images: {
    qualities: [25, 50, 75, 80, 90, 100],
  },

  webpack: (config, { isServer }) => {
    // Suppress warnings for optional dependencies in snoowrap/ws
    // These are optional performance enhancements, not required
    // Apply to both server and client builds
    config.resolve.fallback = {
      ...config.resolve.fallback,
      bufferutil: false,
      'utf-8-validate': false,
    };

    // Ignore warnings for optional dependencies
    config.ignoreWarnings = [
      ...(config.ignoreWarnings || []),
      { module: /node_modules\/snoowrap/ },
      { module: /node_modules\/ws/ },
      { message: /Can't resolve 'bufferutil'/ },
      { message: /Can't resolve 'utf-8-validate'/ },
    ];

    return config;
  },
};

export default nextConfig;
