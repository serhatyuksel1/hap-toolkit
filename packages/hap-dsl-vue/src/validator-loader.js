/*
 * Copyright (C) 2017, hapjs.org. All rights reserved.
 */

'use strict'
import md5 from 'md5'
import { parseStyle, parseTemplate } from '@hap-toolkit/compiler'
import { logWarn } from '@hap-toolkit/shared-utils'

const fileCache = new Map()
/**
 * @param source
 * @return {string|*}
 */
module.exports = function(source) {
  this.cacheable && this.cacheable()
  const resourcePath = this.resourcePath

  if (fileCache.has(md5(source))) return source
  fileCache.set(md5(source), source)

  const compiler = require('vue-template-compiler')
  const result = compiler.parseComponent(source, { pad: true })

  // 检测template语法合法性
  if (result.template) {
    const { log } = parseTemplate(result.template.content, {
      filePath: resourcePath
    })
    if (log && log.length) {
      logWarn(this, log)
    }
  }

  // 检测 style的语法合法性
  if (result.styles.length > 0) {
    result.styles.forEach(item => {
      const { log } = parseStyle({
        filePath: resourcePath,
        code: item.content
      })
      if (log && log.length) {
        logWarn(this, log, false)
      }
    })
  }
  return source
}
