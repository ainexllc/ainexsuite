const sharedConfig = require.resolve('../config/eslint.config.js');

module.exports = {
  extends: [sharedConfig],
  parserOptions: {
    tsconfigRootDir: __dirname,
  },
  env: {
    browser: true,
    es2021: true,
  },
  rules: {
    '@next/next/no-html-link-for-pages': 'off',
  },
};
