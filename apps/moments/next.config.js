/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@ainexsuite/ui', '@ainexsuite/auth', '@ainexsuite/firebase', '@ainexsuite/ai', '@ainexsuite/types'],
  env: {
    NEXT_PUBLIC_APP_NAME: 'moments',
    NEXT_PUBLIC_MAIN_DOMAIN: 'www.ainexsuite.com',
  },
  images: {
    domains: ['firebasestorage.googleapis.com', 'lh3.googleusercontent.com'],
  },
};

module.exports = nextConfig;
