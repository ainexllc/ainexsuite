import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typedRoutes: true,
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
      },
    ],
  },
  // Optimize for faster development
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-toast'],
  },
};

export default nextConfig;
