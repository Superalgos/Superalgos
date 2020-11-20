let config = null

if (process.env.NODE_ENV === 'production') {
  config = require('./tools/webpack/webpack.prod.config.js')
} else {
  config = require('./tools/webpack/webpack.dev.config.js')
}

module.exports = config
