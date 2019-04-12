/*
 * Copyright (C) 2018, hapjs.org. All rights reserved.
 */

import { parseStyle } from '@hap-toolkit/compiler'

/*
 * 将css转成json格式
 */
class Css2jsonPlugin {
  constructor(options) {
    this.options = options
  }
  apply(compiler) {
    compiler.hooks.emit.tap('Css2jsonPlugin', compilation => {
      for (const filePath in compilation.assets) {
        if (filePath.match(/css\.json$/)) {
          const item = compilation.assets[filePath]._source.children
          const children = item.filter(i => i._value)
          const length = children.length
          children.map((j, idx) => {
            this.css2Json({ code: j._value, filePath: filePath }, code => {
              let json = ''
              if (idx === 0) {
                json = '{"list":[' + code
                json += idx === length - 1 ? ']}' : ','
              } else {
                json = code
                json += idx < length - 1 ? ',' : ']}'
              }
              j._value = json
            })
          })
        }
      }
    })
  }
  css2Json(obj, callback) {
    const hash = String(obj.code).match(/\[(.*)\]/)
    let codeStr = {}
    const { parsed } = parseStyle(obj)
    let cssCode = parsed
    if (hash && hash[1]) {
      const key = hash[1]
      codeStr[key] = cssCode
    } else {
      codeStr = cssCode
    }
    callback && callback(codeStr)
  }
}

module.exports = Css2jsonPlugin
