var ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
  context: __dirname + "/app",
  entry: {
      javascript: "./app.js",
      html: "./index.html",
  },

  output: {
    filename: "app.js",
    path: __dirname + "/dist"
  },

  module: {
    loaders: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          loaders: ["react-hot", "babel-loader"]
        },
        {
          test: /\.html$/,
          loaders: ["file?name=[name].[ext]"]
        },
        {
          test: /\.json$/,
          loaders: ["file?name=[name].[ext]"]
        },
        {
          test: /\.css$/,
          loaders: ['style','css']
        },
        {
          test: /\.(png|jpg)$/,
          loaders: ['file-loader?name=images/[name].[ext]']
        },
        {
          test: /\.less$/,
          loaders: ['style','css','less']
        }
      ]
  },

  devServer: {
    historyApiFallback: true
  }
}
