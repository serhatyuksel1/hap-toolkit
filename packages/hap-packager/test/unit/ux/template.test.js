/*
 * Copyright (C) 2017, hapjs.org. All rights reserved.
 */
'use strict'

const path = require('path')
const chai = require('chai')
const sinon = require('sinon')
const sinonChai = require('sinon-chai')
const { $jscript, $fun2str, resolveEntries, compileFiles } = require('../../utils')
chai.use(sinonChai)

/**
 * Template
 */
describe('Template编译测试', () => {
  const basedir = path.resolve(__dirname, '../../case/ux/')
  const entries = resolveEntries(basedir, 'TestTemplate')

  beforeAll(() => {
    return compileFiles(entries)
  }, 30000)

  function $expect(jsfile) {
    const components = {}
    const requireStub = sinon.stub()
    const $app_bootstrap$ = sinon.stub()
    const $app_define$ = function(componentName, deps, factory) {
      if (components[componentName]) {
        throw new Error(`${componentName} 被重复定义`)
      }

      var $app_define$ = requireStub
      var $app_exports$ = {}
      var $app_module$ = { exports: $app_exports$ }

      factory($app_define$, $app_exports$, $app_module$)
      components[componentName] = $app_module$.exports
    }
    const code = $jscript(jsfile)
    const fn = new Function('$app_define$', '$app_bootstrap$', '$app_require$', code)
    fn($app_define$, $app_bootstrap$, function $app_require$() {})

    expect($fun2str(components)).toMatchSnapshot()
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
