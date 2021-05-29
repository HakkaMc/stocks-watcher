module.exports = {
  env: {
    browser: true, // Fix typescript error when using properties form window object (document, fetch, ...)
    node: true, // Fix node error when using default global node functions (process, ...)
    jest: true, // Fixed jest error when using global jest functions (expect, describe,...)
    es2020: true
  },
  extends: [
    'airbnb-typescript',
    'airbnb/hooks',
    'plugin:@typescript-eslint/recommended',
    'plugin:jest/recommended',
    'prettier',
    'prettier/react',
    'prettier/@typescript-eslint',
    'plugin:prettier/recommended'
  ],
  plugins: ['react', '@typescript-eslint', 'jest'],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly'
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true
    },
    jsx: true,
    ecmaVersion: 2020,
    sourceType: 'module',
    project: './tsconfig.json',
    createDefaultProgram: true
  },
  rules: {
    '@typescript-eslint/no-empty-function': ['error', { allow: ['arrowFunctions'] }],
    'linebreak-style': 'off',
    'prettier/prettier': [
      'warn',
      {
        endOfLine: 'auto'
      }
    ],
    'jsx-a11y/interactive-supports-focus': 'warn',
    'jsx-a11y/click-events-have-key-events': 'warn',
    'react/style-prop-object': [
      'error',
      {
        allow: ['FormattedNumber']
      }
    ],
    'import/prefer-default-export': 'off',
    'react/prefer-stateless-function': [2, { ignorePureComponents: false }],
    'react-hooks/exhaustive-deps': 'off',
    'jsx-a11y/no-static-element-interactions': 'off',
    'react/jsx-props-no-spreading': 'off',
    'no-param-reassign': ['error', { props: false }],
    'no-underscore-dangle': 'off',
    'react/require-default-props': 'off',
    'no-debugger': 'off',
    '@typescript-eslint/ban-ts-comment': 'off',
    'import/no-webpack-loader-syntax': 'off',
    'global-require': 'off',
    radix: 'off',
    'react/destructuring-assignment': 'off',
    'import/no-extraneous-dependencies': 'off'
  }
}
