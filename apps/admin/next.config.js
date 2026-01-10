const {
  getSecurityHeaders,
} = require("@ainexsuite/config/next-security-headers");

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Core settings
  reactStrictMode: true,
  compress: true,
  poweredByHeader: false,

  // Transpile shared packages
  transpilePackages: [
    "@ainexsuite/ui",
    "@ainexsuite/firebase",
    "@ainexsuite/auth",
    "@ainexsuite/theme",
    "@ainexsuite/types",
  ],

  // App-specific environment variables
  env: {
    NEXT_PUBLIC_APP_NAME: "admin",
  },

  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
      },
      {
        protocol: "https",
        hostname: "storage.googleapis.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },

  // Performance optimizations
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },

  // Security headers
  async headers() {
    return getSecurityHeaders();
  },
};

module.exports = nextConfig;
