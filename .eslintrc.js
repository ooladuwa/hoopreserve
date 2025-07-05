module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-native/all',
    'plugin:prettier/recommended',
  ],
  plugins: ['react', 'react-native', '@typescript-eslint'],
  env: {
    'react-native/react-native': true,
    node: true,
    es2021: true,
  },
  rules: {
    'react/react-in-jsx-scope': 'off', // not needed with React 17+
    'react-native/no-inline-styles': 'off', // we use these in small projects
    'react-native/sort-styles': 'off',
    'prettier/prettier': 'warn',
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
};
