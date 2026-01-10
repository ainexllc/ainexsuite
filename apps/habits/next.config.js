const {
  getSecurityHeaders,
} = require("@ainexsuite/config/next-security-headers");

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    "@ainexsuite/ui",
    "@ainexsuite/auth",
    "@ainexsuite/firebase",
    "@ainexsuite/ai",
    "@ainexsuite/types",
  ],
  env: {
    NEXT_PUBLIC_APP_NAME: "habits",
    NEXT_PUBLIC_MAIN_DOMAIN: "www.ainexspace.com",
  },
  images: {
    domains: ["firebasestorage.googleapis.com", "lh3.googleusercontent.com"],
  },

  // Security headers
  async headers() {
    return getSecurityHeaders();
  },
};

module.exports = nextConfig;
