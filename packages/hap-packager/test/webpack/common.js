/*
 * Copyright (C) 2017, hapjs.org. All rights reserved.
 */

const glob = require('glob')

exports.resolveEntries = function resolveEntries(cwd, pattern) {
  const files = glob.sync(pattern, { cwd })
  const entries = files.reduce((obj, file) => {
    // TODO resolve from manifest
    if (file.match(/\/common\//i)) {
      return obj
    }
    const outputName = file.replace(/\.(ux|mix|vue)$/, '.js')
    const type = file.indexOf('TestCard') >= 0 ? 'card' : 'page'
    obj[outputName] = `./${file}?uxType=${type}`
    return obj
  }, {})
  return entries
}
