/**
 * Next.js Configuration Template
 *
 * Configuration for Next.js application with optimized settings for Vercel deployment.
 *
 * File: next.config.ts
 */

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Image optimization settings
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com", // Google profile pictures
      },
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com", // Firebase Storage
      },
    ],
  },

  // Experimental features
  experimental: {
    // Enable React Server Components optimizations
    // serverActions: true,
  },

  // For Firebase Hosting (static export) - comment out for Vercel
  // output: "export",
  // trailingSlash: true,
  // images: {
  //   unoptimized: true,
  // },
};

export default nextConfig;
