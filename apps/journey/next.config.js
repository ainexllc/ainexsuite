/** @type {import('next').NextConfig} */
const nextConfig = {
  // Core settings
  reactStrictMode: true,
  compress: true,
  poweredByHeader: false,

  // Transpile shared packages
  transpilePackages: [
    '@ainexsuite/ui',
    '@ainexsuite/firebase',
    '@ainexsuite/auth',
    '@ainexsuite/ai',
    '@ainexsuite/types',
  ],

  // App-specific environment variables
  env: {
    NEXT_PUBLIC_APP_NAME: 'journey',
    NEXT_PUBLIC_MAIN_DOMAIN: 'www.ainexsuite.com',
  },

  // Image optimization (updated to new syntax)
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },

  // Performance optimizations
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-toast'],
  },
};

module.exports = nextConfig;
