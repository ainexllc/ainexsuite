/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    "@ainexsuite/ui",
    "@ainexsuite/firebase",
    "@ainexsuite/auth",
    "@ainexsuite/ai",
    "@ainexsuite/types",
    "@ainexsuite/theme",
    "@ainexsuite/date-detection",
  ],
  env: {
    NEXT_PUBLIC_APP_NAME: "tables",
    NEXT_PUBLIC_MAIN_DOMAIN: "www.ainexspace.com",
  },
  images: {
    domains: ["firebasestorage.googleapis.com", "lh3.googleusercontent.com"],
  },
};

module.exports = nextConfig;
