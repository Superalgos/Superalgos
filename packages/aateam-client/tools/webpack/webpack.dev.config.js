const webpack = require('webpack')
const Dotenv = require('dotenv-webpack')
const path = require('path')
const merge = require('webpack-merge')
const history = require('connect-history-api-fallback')
const convert = require('koa-connect')
const commonConfig = require('./helpers/webpack.common.config')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const HtmlWebpackHarddiskPlugin = require('html-webpack-harddisk-plugin')
const ScriptExtHtmlWebpackPlugin = require('script-ext-html-webpack-plugin')

module.exports = merge(commonConfig, {
  mode: 'development',
  devtool: 'inline-sourcemap',

  output: {
    path: path.resolve(__dirname, '../../build'),
    filename: 'script.js'
  },

  plugins: [
    new Dotenv({
      path: '.env'
    }),
    new webpack.NamedModulesPlugin(),
    new webpack.HotModuleReplacementPlugin({ multiStep: false }),
    new HtmlWebpackPlugin({
      template: 'html/index.html',
      alwaysWriteToDisk: true
    }),
    new ScriptExtHtmlWebpackPlugin({
      defaultAttribute: 'async'
    }),
    new HtmlWebpackHarddiskPlugin()
  ],
  module: {
    rules: [
      {
        test: /\.s?[ac]ss$/,
        loader: 'style-loader!css-loader!postcss-loader!sass-loader'
      }
    ]
  }
})

module.exports.serve = {
  hot: {
    port: 4536
  },
  host: '0.0.0.0',
  port: 5000,
  add: (app, middleware, options) => {
    app.use(convert(history()))
  }
}
