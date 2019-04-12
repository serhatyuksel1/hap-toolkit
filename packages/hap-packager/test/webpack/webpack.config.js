/*
 * Copyright (C) 2017, hapjs.org. All rights reserved.
 */

const path = require('path')
const merge = require('webpack-merge')
const baseConfig = require('./webpack.base')

const ResourcePlugin = require('../../lib/plugin/resource-plugin')
const ZipPlugin = require('../../lib/plugin/zip-plugin')
const HandlerPlugin = require('../../lib/plugin/handler-plugin')
const { resolveEntries } = require('./common')
const info = require('../../lib/common/info')

const src = path.join(__dirname, '../case/ux')
const build = path.join(__dirname, '../build/ux')
const dist = path.join(__dirname, '../dist/ux')

const entries = resolveEntries(src, '**/*.{ux,mix}')

module.exports = merge(baseConfig, {
  context: src,
  entry: entries,
  output: {
    path: build
  },
  plugins: [
    new ResourcePlugin({
      src: src,
      dest: build,
      projectRoot: '',
      sign: null
    }),
    new ZipPlugin({
      name: 'test',
      output: dist,
      pathBuild: build,
      sign: null
    }),
    new HandlerPlugin({
      pathSrc: src
    })
  ],
  resolve: {
    extensions: ['.webpack.js', '.web.js', '.js', '.json'].concat(info.name.extList),
    alias: {
      xyz1: path.resolve(__dirname, '../case/ux/TestTemplate/ImportTemplateAlias'),
      xyz2$: path.resolve(__dirname, '../case/ux/TestTemplate/ImportTemplateAlias/comp'),
      xyz3: '.',
      xyz4$: './comp',
      xyz5: 'template-alias',
      xyz6$: 'template-alias/comp'
    }
  }
})
