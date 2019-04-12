const { Writable } = require('stream')
const { Console } = require('console')
const stripAnsi = require('strip-ansi')
const { colorconsole } = require('../lib')

describe('utils', () => {
  it('colorconsole.init', () => {
    let output = ''
    const stream = new Writable()
    stream._write = function(data, enc, next) {
      output += data.toString()
      next()
    }
    colorconsole.init(stream)
    colorconsole.log('log message')
    colorconsole.info('warn message')
    colorconsole.error('error message')
    colorconsole.warn('warn message')
    // reset
    global.console = new Console({ stdout: process.stdout, stderr: process.stderr })

    expect(stripAnsi(output)).toMatchInlineSnapshot(`
"[LOG] log message
[INFO] warn message
[ERRO] error message
[WARN] warn message
"
`)
  })
})
