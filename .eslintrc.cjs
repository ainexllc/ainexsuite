const sharedConfig = require.resolve('./packages/config/eslint.config.js');

module.exports = {
  extends: [sharedConfig],
  parserOptions: {
    tsconfigRootDir: __dirname,
  },
  ignorePatterns: ['**/next-env.d.ts', '.next', 'dist'],
  settings: {
    next: {
      rootDir: ['apps/*/'],
    },
  },
  rules: {
    '@next/next/no-html-link-for-pages': 'off',
  },
};
