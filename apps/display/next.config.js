/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@ainexsuite/ui', '@ainexsuite/auth', '@ainexsuite/firebase', '@ainexsuite/ai', '@ainexsuite/types'],
  env: {
    NEXT_PUBLIC_APP_NAME: 'display',
    NEXT_PUBLIC_MAIN_DOMAIN: 'www.ainexspace.com',
  },
  images: {
    domains: ['firebasestorage.googleapis.com', 'lh3.googleusercontent.com', 'images.unsplash.com'],
  },
};

module.exports = nextConfig;
