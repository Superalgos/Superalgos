const webpack = require('webpack')
const Dotenv = require('dotenv-webpack')
const path = require('path')
const merge = require('webpack-merge')
const commonConfig = require('./helpers/webpack.common.config')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const HtmlWebpackHarddiskPlugin = require('html-webpack-harddisk-plugin')
const ScriptExtHtmlWebpackPlugin = require('script-ext-html-webpack-plugin')

module.exports = merge(commonConfig, {
  mode: 'development',
  devtool: 'inline-sourcemap',

  output: {
    path: path.resolve(__dirname, '../../build'),
    filename: 'script.js',
    publicPath: '/'
  },

  devServer: {
    historyApiFallback: {
      disableDotRule: true
    }
  },

  plugins: [
    new Dotenv({
      path: '.env'
    }),
    new webpack.NamedModulesPlugin(),
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
  },
  target: 'web'
})
