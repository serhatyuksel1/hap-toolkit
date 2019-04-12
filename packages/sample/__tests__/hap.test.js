/*
 * Copyright (C) 2017, hapjs.org. All rights reserved.
 */
const process = require('process')
const fs = require('fs')
const path = require('path')
const fetch = require('node-fetch')
const fkill = require('fkill')
const { run, lsfiles, readZip } = require('hap-dev-utils')

// IMPORTANT run `lerna bootstrap` before running tests
describe('hap-toolkit', () => {
  const cwd = path.resolve(__dirname, '..')
  it(
    'hap-build',
    async () => {
      await run('npm', ['run', 'build'], [], { cwd })
      const rpks = await lsfiles('dist/*.rpk', { cwd })
      // TODO more details
      expect(rpks.length).toBe(1)
    },
    10 * 60 * 1000
  )
  it(
    'hap-build: 默认流式打包，包内存在META-INF文件',
    async () => {
      const rpks = await lsfiles('dist/*.rpk', { cwd })
      let rpkPath = path.resolve(cwd, rpks[0])
      // 读取压缩包中的内容
      readZip(rpkPath).then(packages => {
        const hasMeta = packages.files['META-INF/']
        const hasMetaCert = packages.files['META-INF/CERT']
        expect(hasMeta).toBeTruthy()
        expect(hasMetaCert).toBeTruthy()
      })
    },
    1000
  )
  it(
    'hap-build [--disable-stream-pack]: 包内不存在META-INF文件',
    async () => {
      await run('npm', ['run', 'build', '-- --disable-stream-pack'], [], { cwd })
      const rpks = await lsfiles('dist/*.rpk', { cwd })
      let rpkPath = path.resolve(cwd, rpks[0])
      // 读取压缩包中的内容
      readZip(rpkPath).then(packages => {
        const hasMeta = packages.files['META-INF/']
        expect(hasMeta).toBeFalsy()
      })
    },
    30 * 60 * 1000
  )
  it(
    'hap-server',
    async () => {
      const dialogs = [
        {
          pattern: output => {
            return output.match(/生成HTTP服务器的二维码: (http:\/\/.*)/)
          },
          feeds: (proc, output) => {
            const match = output.match(/生成HTTP服务器的二维码: (http:\/\/.*)/)
            const url = match[1]
            const p1 = fetch(url)
              .then(res => {
                expect(res.status).toBe(200)
                return res.text()
              })
              .then(text => {
                expect(text).toMatch('<title>调试器</title>')
              })
            const p2 = fetch(url + '/qrcode')
              .then(res => res.arrayBuffer())
              .then(buffer => {
                expect(Buffer.from(buffer).readUInt32BE(0)).toBe(0x89504e47)
              })
            Promise.all([p1, p2]).then(async () => {
              await fkill(proc.pid)
            })
          }
        },
        {
          pattern: /listen EADDRINUSE: address already in use/,
          type: 'stderr',
          feeds: (proc, output) => {
            proc.kill('SIGINT')
            proc.kill('SIGTERM')
            throw new Error('address in use')
          }
        }
      ]

      await run('npm', ['run', 'server'], dialogs, { cwd })
    },
    10 * 60 * 1000
  )

  it('missed release pem files', async () => {
    let happened = false
    const dialogs = [
      {
        pattern: /缺少私钥文件, 打包失败/,
        type: 'stderr',
        feeds: (proc, output) => {
          happened = true
        }
      }
    ]
    await run('npm', ['run', 'release'], dialogs, { cwd })
    expect(happened).toBe(true)
  }, 10 * 60 * 100)
})
