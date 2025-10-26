const sharedConfig = require.resolve('../config/eslint.config.js');

module.exports = {
  extends: [sharedConfig],
  parserOptions: {
    tsconfigRootDir: __dirname,
  },
  env: {
    node: true,
    browser: true,
  },
  rules: {
    'react/react-in-jsx-scope': 'off',
    '@next/next/no-html-link-for-pages': 'off',
  },
};
