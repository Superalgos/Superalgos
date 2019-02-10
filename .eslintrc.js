module.exports = {
  parser: 'babel-eslint',
  extends: [
    'airbnb-base',
    'plugin:react/recommended',
  ],
  rules: {
    'max-len': ['error', 140, 2],
    'no-underscore-dangle': 'off',
    'no-param-reassign': 'off',
    'react/prop-types': 0,
    'react/jsx-indent': ['error', 2],
    'import/prefer-default-export': 'off',
  },
  settings: {
    'react': {
      'pragma': 'React',
      'version': '16.5',
    },
  },
  env: {
    'browser': true,
  },
};
