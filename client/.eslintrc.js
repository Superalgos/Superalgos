module.exports = {
  parser: 'babel-eslint',
  extends: [
    'airbnb-base',
    'plugin:react/recommended',
  ],
  rules: {
    'no-underscore-dangle': 'off',
    'no-param-reassign': 'off',
    'react/prop-types': 0,
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
