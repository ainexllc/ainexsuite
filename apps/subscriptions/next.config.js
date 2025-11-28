/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    '@ainexsuite/ui',
    '@ainexsuite/firebase',
    '@ainexsuite/auth',
    '@ainexsuite/ai',
    '@ainexsuite/types',
  ],
  env: {
    NEXT_PUBLIC_APP_NAME: 'subscriptions',
    NEXT_PUBLIC_MAIN_DOMAIN: 'www.ainexsuite.com',
  },
  images: {
    domains: ['firebasestorage.googleapis.com', 'lh3.googleusercontent.com'],
  },
};

module.exports = nextConfig;
