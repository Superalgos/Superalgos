const pathConfig = require('./webpack.path.config')

module.exports = {
  context: pathConfig.context,

  entry: ['./src/index.js'],

  module: {
    rules: [
      {
        test: /\.js$/,
        include: /node_modules\\@superalgos/,
        loader: 'babel-loader'
      },
      {
        test: /\.js$/,
        include: /node_modules\/@superalgos/,
        loader: 'babel-loader'
      },
      {
        test: /\.js$/,
        include: /node_modules\\@advancedalgos/,
        loader: 'babel-loader'
      },
      {
        test: /\.js$/,
        include: /node_modules\/@advancedalgos/,
        loader: 'babel-loader'
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      },
      {
        test: /\.(png|svg|jpg|gif)$/,
        use: [{ loader: 'file-loader' }
        ]
      }
    ]
  }
}
