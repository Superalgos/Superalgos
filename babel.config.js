module.exports = {
	presets: [['@babel/preset-env']],
  plugins: [
    '@babel/plugin-transform-runtime'
  ],
  env: {
    testing: {
      presets: [['@babel/preset-env', {targets: {node: 'current'}}]]
    }
  }
}