const path = require('path')
module.exports = {
  mode: 'production',
  entry: path.resolve(__dirname, 'dist/lib-modules/index.js'),
  output: {
    path: path.resolve(__dirname, "dist/lib-browser"),
    filename: 'data-monitor-javascript-sdk.js',
    library: 'dataMonitor',
    libraryTarget: 'var'
  },
  module: {
    rules: [{
      test: /\.js?$/,
      exclude: /node_modules/,
      use: [{
        loader: 'babel-loader',
        options: {
          presets: ['@babel/preset-env']
        }
      }]
    }]
  }
}
