module.exports = {
  'env': {
    'browser': true,
    'commonjs': true,
    'es2020': true,
    'node': true
  },
  'parser': '@typescript-eslint/parser',
  'plugins': [
    '@typescript-eslint',
  ],
  'extends': [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  'parserOptions': {
    'sourceType': 'module',
    'ecmaVersion': 11
  },
  'ignorePatterns': ['*.test.js'],
  'rules': {
    'indent': [
      'error',
      2,
      { SwitchCase: 1 }
    ],
    'quotes': [
      'error',
      'single'
    ],
    'semi': [
      'error',
      'never'
    ],
    'no-undefined': 'off',
    'no-unused-expressions': 'off',
    'no-unused-vars': 'warn',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off'
  }
}


