module.exports = function (config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: './',

    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['mocha'],

    plugins: [
      'karma-mocha',
      'karma-mocha-reporter',
      'karma-chrome-launcher',
      'karma-edge-launcher',
      'karma-firefox-launcher',
      'karma-ie-launcher',
      'karma-env-preprocessor'
    ],

    // list of files / patterns to load in the browser
    files: [
      'browser/bundle/azure-storage.blob.js',
      'browser/bundle/azure-storage.table.js',
      'browser/bundle/azure-storage.queue.js',
      'browser/bundle/azure-storage.file.js',
      'browser/test/browser.tests.bundled.js'
    ],

    // list of files / patterns to exclude
    exclude: [],

    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      '**/*.js': ['env'],
    },

    // inject following environment values into browser testing with window.__env__
    // environment values MUST be exported or set with same console running "karma start"
    // https://www.npmjs.com/package/karma-env-preprocessor
    envPreprocessor: [
      'AZURE_STORAGE_CONNECTION_STRING',
      'AZURE_STORAGE_CONNECTION_STRING_SSE_ENABLED_ACCOUNT',
      'AZURE_STORAGE_CONNECTION_STRING_BLOB_ACCOUNT',
      'AZURE_STORAGE_CONNECTION_STRING_PREMIUM_ACCOUNT'
    ],

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['mocha'],

    // web server port
    port: 9876,

    // enable / disable colors in the output (reporters and logs)
    colors: true,

    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,

    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: false,

    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    // 'Chrome', 'Firefox', 'Edge', 'IE'
    browsers: ['Chrome'],

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: 1,

    browserNoActivityTimeout: 600000,

    client: {
      mocha: {
        // change Karma's debug.html to the mocha web reporter
        reporter: 'html',
        timeout: '600000'
      }
    }
  })
}