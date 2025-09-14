module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  extends: [
    'eslint:recommended',
  ],
  rules: {
    // Basic rules for TypeScript
    'no-unused-vars': 'off', // TypeScript handles this
    'no-undef': 'off', // TypeScript handles this
    'no-console': 'off',
    'prefer-const': 'warn',
    'no-var': 'error',
  },
  env: {
    node: true,
    jest: true,
    es2020: true,
  },
  ignorePatterns: [
    'dist/**/*',
    'docs/**/*',
    'docs-md/**/*',
    'coverage/**/*',
    'website/**/*',
    '*.js',
  ],
};