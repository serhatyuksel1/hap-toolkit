/*
 * Copyright (C) 2017, hapjs.org. All rights reserved.
 */

const webpack = require('webpack')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const info = require('../../lib/common/info')

// 支持文件扩展名
const FILE_EXT_LIST = info.name.extList

function resolveLoader(loader) {
  return require.resolve(`../../lib/loader/${loader}`)
}
module.exports = {
  // context, entry
  mode: 'development',
  output: {
    filename: '[name]' // extname included
  },
  devtool: 'inline-source-map',
  module: {
    rules: [
      {
        test: new RegExp(
          `(${FILE_EXT_LIST.slice(0, 2)
            .map(k => '\\' + k)
            .join('|')})(\\?[^?]+)?$`
        ),
        use: resolveLoader('ux-loader.js')
      },
      {
        test: new RegExp(
          `(${FILE_EXT_LIST.slice(2)
            .map(k => '\\' + k)
            .join('|')})(\\?[^?]+)?$`
        ),
        use: [
          {
            loader: 'vue-loader',
            options: {
              hotReload: false // 关闭热重载
            }
          },
          {
            loader: resolveLoader('module-loader.js')
          },
          {
            loader: require.resolve('@hap-toolkit/dsl-vue/lib/validator-loader.js')
          }
        ]
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader']
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [
          {
            loader: resolveLoader('module-loader.js')
          },
          {
            loader: 'babel-loader'
          }
        ]
      }
    ]
  },
  plugins: [
    new webpack.LoaderOptionsPlugin({
      options: {
        // 过滤输出的日志，不写默认为false
        suppresslogs: true
      }
    })
  ]
}
