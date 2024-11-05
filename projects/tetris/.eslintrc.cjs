module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parser: '@typescript-eslint/parser',
  plugins: [],
  rules: {
    "prefer-const": "error",
    curly: 'error',
    'no-multiple-empty-lines': [
      'warn',
      {
        max: 1,
        maxEOF: 0,
      },
    ],
    
  },
};
