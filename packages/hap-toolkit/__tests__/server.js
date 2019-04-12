/*
 * Copyright (C) 2017, hapjs.org. All rights reserved.
 */

describe('server', () => {
  const { launchServer, stopServer, stopAll } = require('../lib')
  const request = require('supertest')
  let server
  beforeAll(() => {
    return launchServer({
      port: 8082,
      // TODO createADBDebugger 导致 server.close 不能完全关闭
      disableADB: true,
      openDebugger: false,
      watch: false
    }).then(data => {
      server = data.server
    })
  }, 5000)
  it('launch server', () => {
    return request(server)
      .get('/')
      .then(response => {
        expect(response.status).toBe(200)
        expect(response.text).toMatch('<title>调试器</title>')
      })
  })

  it('qr-code', () => {
    return request(server)
      .get('/qrcode')
      .then(response => {
        expect(response.status).toBe(200)
        expect(response.type).toBe('image/png')
        // TODO 将 ip 和端口写入响应页面，在前端渲染，以便于在此测试二维码内容
        // file signature
        expect(response.body.readUInt32BE(0)).toBe(0x89504e47)
      })
  })

  it('inspector', () => {
    return request(server)
      .get('/html/inspector/inspector.html')
      .then(response => {
        expect(response.status).toBe(200)
        expect(response.type).toBe('text/html')
        expect(response.text).toMatch(/Copyright \d{4} The Chromium Authors./)
      })
  })

  it('start debug', () => {
    return request(server)
      .post('/poststdbg')
      .send({
        application: 'com.vivo.hybrid(vivo/vivo X21A@8.1.0)',
        devicePort: '37679',
        linkMode: 1,
        sn: undefined,
        ws: '10.13.24.46:37679/inspector'
      })
      .then(() => {
        // TODO
        // 1, check response
        // 2, close chrome
      })
  })

  it('socket.io serve client', () => {
    const getJs = request(server)
      .get('/socket.io/socket.io.js')
      .then(response => {
        expect(response.status).toBe(200)
        expect(response.type).toBe('application/javascript')
      })
    const getMap = request(server)
      .get('/socket.io/socket.io.js.map')
      .then(response => {
        expect(response.status).toBe(200)
        expect(response.type).toBe('application/json')
      })

    return Promise.all([getJs, getMap])
  })

  it('stop all', () => {
    return stopAll().then(data => {
      expect(data.stopServerError).toBeUndefined()
      expect(data.stopWatchError).toBe('no watching')
      expect(data.error).toBeTruthy()
    })
  })

  it('stop server', () => {
    return stopServer().then(data => {
      expect(data.stopServerError.toString()).toMatch('Server is not running')
    })
  })
  // TODO
  // /poststdbg, /postwsid, /bundle
})
