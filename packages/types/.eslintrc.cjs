module.exports = {
  root: false,
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  parserOptions: {
    project: undefined,
    tsconfigRootDir: __dirname,
  },
  env: {
    node: true,
    es2021: true,
  },
  rules: {
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
  },
};
