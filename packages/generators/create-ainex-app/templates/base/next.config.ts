import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com", // Google profile pics
      },
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com", // Firebase Storage
      },
    ],
  },
};

export default nextConfig;
