/*
 * Copyright (C) 2017, hapjs.org. All rights reserved.
 */

const path = require('path')
const merge = require('webpack-merge')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const VueLoaderPlugin = require('vue-loader/lib/plugin')

const Css2jsonPlugin = require('@hap-toolkit/dsl-vue/lib/css2json-plugin')

const baseConfig = require('./webpack.base')
const ResourcePlugin = require('../../lib/plugin/resource-plugin')
const HandlerPlugin = require('../../lib/plugin/handler-plugin')

const { resolveEntries } = require('./common')

const src = path.join(__dirname, '../case/vue')
const build = path.resolve(__dirname, '../build/vue')
const entries = resolveEntries(src, '**/*.vue')

module.exports = merge(baseConfig, {
  context: src,
  entry: entries,
  output: {
    path: build
  },
  plugins: [
    new VueLoaderPlugin(),
    new MiniCssExtractPlugin({
      filename: '[name].css.json'
    }),
    new Css2jsonPlugin(),
    new ResourcePlugin({
      src: src,
      dest: build,
      sign: null,
      projectRoot: ''
    }),
    new HandlerPlugin({
      pathSrc: src
    })
  ]
})
