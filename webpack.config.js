/**
 *  Copyright 2015 John Ahlroos
 *
 *	This file is part of Travel Mapper.
 *
 *  Travel Mapper is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  Travel Mapper is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with Travel Mapper.  If not, see <http://www.gnu.org/licenses/>.
 */
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
