/*
 * Copyright (C) 2017, hapjs.org. All rights reserved.
 */
'use strict'

const fs = require('fs')
const path = require('path')
const del = require('del')
const { copyApp } = require('hap-dev-utils')
const { compile } = require('../lib')

describe('测试自定义配置', () => {
  const platform = 'native'
  let projectRoot

  beforeAll(async () => {
    const testAppDir = path.resolve(__dirname, '../fixtures/customConfig-app')
    projectRoot = await copyApp(testAppDir)
  })

  it(
    'compile build',
    async () => {
      const mode = 'dev'
      // 第三个参数为是否开启watch，true为开启
      const data = await compile(platform, mode, false, { cwd: projectRoot })
      expect(data.compileError).toBeNull()
      expect(data.stats.hasErrors()).toBe(false)

      // TODO 测试端口
      const buildPath = path.join(projectRoot, 'build3')
      const distPath = path.join(projectRoot, 'dist4')
      expect(fs.existsSync(buildPath)).toBeTruthy()
      expect(fs.existsSync(distPath)).toBeTruthy()
    },
    5 * 60 * 1000
  )

  afterAll(async () => {
    await del([projectRoot])
  })
})
