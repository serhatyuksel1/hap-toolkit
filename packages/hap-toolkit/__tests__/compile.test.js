/*
 * Copyright (C) 2017, hapjs.org. All rights reserved.
 */
'use strict'

const path = require('path')
const del = require('del')
const glob = require('glob')
const { copyApp } = require('hap-dev-utils')
const { compile, stopWatch } = require('../lib')

describe('测试compile', () => {
  const platform = 'native'
  let projectRoot
  let buildDir

  beforeAll(async () => {
    const testAppDir = path.resolve(__dirname, '../fixtures/app')
    projectRoot = await copyApp(testAppDir)
    buildDir = path.resolve(projectRoot, 'build')
  })

  it('generate webpack config', () => {
    const genWebpackConf = require('../gen-webpack-conf')
    const conf = genWebpackConf({
      cwd: projectRoot
    })
    expect(conf.entry).toMatchSnapshot()
  })

  it(
    'compile release',
    async () => {
      const mode = 'prod'
      const expectResult = [
        'app.js',
        'CardDemo/index.js',
        'Demo/index.js',
        'workers/request/index.js'
      ]

      const { stats } = await compile(platform, mode, false, {
        cwd: projectRoot
      })
      expect(stats.hasErrors()).toBe(false)

      const result = glob.sync('**/*.{js,js.map}', {
        cwd: buildDir
      })
      expect(result).toEqual(expect.arrayContaining(expectResult))
      expect(result).toMatchSnapshot()
    },
    5 * 60 * 1000
  )

  it(
    'compile build',
    async () => {
      const mode = 'dev'
      const expectResult = [
        'app.js',
        'app.js.map',
        'CardDemo/index.js',
        'CardDemo/index.js.map',
        'Demo/index.js',
        'Demo/index.js.map',
        'workers/request/index.js',
        'workers/request/index.js.map'
      ]

      // 第三个参数为是否开启watch，true为开启
      const data = await compile(platform, mode, true, { cwd: projectRoot })
      expect(data.compileError).toBeNull()
      expect(data.stats.hasErrors()).toBe(false)

      const result = glob.sync('**/*.{js,js.map}', {
        cwd: buildDir
      })
      expect(result).toEqual(expect.arrayContaining(expectResult))
      expect(result).toMatchSnapshot()
    },
    5 * 60 * 1000
  )

  it('stop watch', async () => {
    const data = await stopWatch()
    expect(data.stopWatchError).toBeNull()
  })

  afterAll(async () => {
    await del([projectRoot])
  })
})
