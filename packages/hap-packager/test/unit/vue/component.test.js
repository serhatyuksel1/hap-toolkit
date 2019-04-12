/*
 * Copyright (C) 2017, hapjs.org. All rights reserved.
 */
'use strict'
const path = require('path')
const chai = require('chai')
const sinonChai = require('sinon-chai')
const { $jscript, $fun2str, resolveEntries, compileFiles } = require('../../utils')
chai.use(sinonChai)

/**
 * Component
 */
describe('Component编译测试', () => {
  const basedir = path.resolve(__dirname, '../../case/vue/')
  const entries = resolveEntries(basedir, 'TestComponent')

  beforeAll(() => {
    return compileFiles(entries, 'vue')
  }, 30000)

  function $expect(jsfile) {
    const code = $jscript(jsfile, 'build/vue')
    /* eslint-disable-next-line no-eval */
    const result = eval(code)
    expect($fun2str(result, true)).toMatchSnapshot()
  }

  const testTable = Object.keys(entries).map(file => {
    let name = file.split('/')[1]
    name = name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
    return [name, file]
  })

  it.each(testTable)('%s', (_, file) => {
    $expect(file)
  })
})
