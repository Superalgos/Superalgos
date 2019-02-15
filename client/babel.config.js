module.exports = (api) => {
  api.cache(true)

  const presets = [
    '@babel/preset-env',
    '@babel/preset-react'
  ]

  const plugins = [
    'react-hot-loader/babel',
    '@babel/plugin-proposal-class-properties',
    '@babel/plugin-syntax-dynamic-import',
    'dynamic-import-node',
    '@babel/plugin-transform-runtime'
  ]

  return {
    presets,
    plugins
  }
}
