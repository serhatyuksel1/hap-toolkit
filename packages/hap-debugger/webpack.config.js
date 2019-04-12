/**
 * Copyright (C) 2017, hapjs.org. All rights reserved.
 */

const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin')

const configClient = {
  context: __dirname,
  entry: {
    index: './src/client/js/index.js'
  },
  output: {
    filename: '[name]-[hash].js',
    path: path.resolve(__dirname, 'lib/client/js')
  },
  devtool: 'eval-source-map',
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
        }
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader']
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, './src/client/html/index.html'),
      filename: '../html/index.html', // 这是相对于output输出路径的根;
      inject: 'body',
      minify: {
        minifyCSS: true,
        removeComments: true,
        preserveLineBreaks: false,
        collapseWhitespace: true
      }
    }),
    new MiniCssExtractPlugin({
      filename: '../css/index/index-[hash].css'
    })
  ],
  optimization: {
    minimizer: [new OptimizeCSSPlugin({})]
  }
}

module.exports = configClient
