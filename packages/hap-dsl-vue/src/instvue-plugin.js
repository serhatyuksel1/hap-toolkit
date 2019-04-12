/*
 * Copyright (C) 2018, hapjs.org. All rights reserved.
 */

import path from 'path'
import { ConcatSource } from 'webpack-sources'

const extList = ['.mix', '.ux', '.vue']
/**
 * 实例化vue
 */
class InstVuePlugin {
  constructor(options) {
    this.options = options
  }
  apply(compiler) {
    const $this = this
    compiler.hooks.compilation.tap('InstVuePlugin', function(compilation) {
      compilation.hooks.optimizeChunkAssets.tapAsync('InstVuePlugin', function(chunks, callback) {
        chunks.forEach(function(chunk) {
          const type = path.extname(Array.from(chunk.entryModule.buildInfo.fileDependencies)[0])
          if (type !== extList[2]) return
          chunk.files.forEach(function(fileName) {
            const sourceList = $this.instVue(fileName, compilation)
            sourceList && (compilation.assets[fileName] = sourceList)
          })
        })
        callback()
      })
    })
  }
  instVue(fileName, compilation) {
    if (!/\.js$/.test(fileName)) {
      return
    }

    if (fileName.match(/\bapp\.js$/)) {
      // src/app.js
      return new ConcatSource(
        // Arg0
        `(function(){
      ${
        process.env['NODE_TEST'] === 'Y'
          ? 'global = typeof window === "undefined" ? global.__proto__  : window ;'
          : ''
      }
      var handler = function() {
        return `,
        // Arg1
        compilation.assets[fileName],
        // Arg2
        `
      };
      if (typeof window === "undefined") {
        let options = handler();
        options.default['manifest'] = ${JSON.stringify(global.framework.manifest)}
        return options
      }
    })();`
      )
    } else {
      // 非src/app.js
      return new ConcatSource(
        // Arg0
        `(function(){
      ${
        process.env['NODE_TEST'] === 'Y'
          ? 'global = typeof window === "undefined" ? global.__proto__  : window ;'
          : ''
      }
      var handler = function() {
        return `,
        // Arg1
        compilation.assets[fileName],
        // Arg2
        `
      };
      if (typeof window === "undefined") {
        let options = handler();
        options = options.default ? options.default: options
        options['type'] = 'page'
        return new Vue({render: function(h) {return h(options)}}).$mount('#app')
      }
    })();`
      )
    }
  }
}

module.exports = InstVuePlugin
