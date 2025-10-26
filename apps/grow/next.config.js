/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@ainexsuite/ui', '@ainexsuite/auth', '@ainexsuite/firebase', '@ainexsuite/ai', '@ainexsuite/types'],
  env: {
    NEXT_PUBLIC_APP_NAME: 'grow',
    NEXT_PUBLIC_MAIN_DOMAIN: 'www.ainexsuite.com',
  },
};

module.exports = nextConfig;
