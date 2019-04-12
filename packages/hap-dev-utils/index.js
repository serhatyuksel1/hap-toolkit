/*
 * Copyright (C) 2017, hapjs.org. All rights reserved.
 */

const process = require('process')
const fs = require('fs')
const { spawn } = require('child_process')
const JSZip = require('jszip')
const path = require('path')
const glob = require('glob')
const fse = require('fs-extra')

/**
 * 与子进程"对话"
 *
 * @param {ChildProcess} proc - 子进程
 * @param {Array<Object>} dialogs - 对话列表
 */
function talkTo(proc, dialogs) {
  proc.stdout.on('data', stdHandler('stdout', dialogs))
  proc.stderr.on('data', stdHandler('stderr', dialogs))

  function stdHandler(type, dialogs) {
    const consumer = process[type]
    let _dialogs = dialogs.filter(
      dlg => dlg.type === type || (type === 'stdout' && dlg.type !== 'stderr')
    )
    let output = ''
    return function(data) {
      consumer.write(data)
      output += data
      if (!_dialogs.length) {
        return
      }
      const idx = _dialogs.findIndex(dlg => {
        if (typeof dlg.pattern === 'object' && dlg.pattern.constructor === RegExp) {
          return output.match(dlg.pattern)
        } else if (typeof dlg.pattern === 'function') {
          return dlg.pattern(output, proc)
        }
      })
      // 匹配到特定模式，写入响应 feeds，实现交互的模拟
      if (idx > -1) {
        const dialog = _dialogs[idx]
        switch (typeof dialog.feeds) {
          case 'string':
            proc.stdin.write(dialog.feeds || '')
            break
          case 'function':
            dialog.feeds(proc, output)
            break
        }
        _dialogs.splice(idx, 1)
        if (dialog.dialogs && !proc.killed) {
          talkTo(proc, dialog.dialogs)
        }
      }
    }
  }
}

/**
 * 为执行任务设定模式和输入
 * 以便测试命令行交互
 *
 * TODO run with nyc to collect coverage
 *
 * @param {String} file - 执行文件
 * @param {Array<String>} args - 执行参数
 * @param {Array<Object>} dialogs - 对话描述
 * @returns {Promise}
 */
function run(cmd, args = [], dialogs = [], opts = {}) {
  return new Promise((resolve, reject) => {
    let stdout = ''
    let stderr = ''
    const proc = spawn(cmd, args, {
      shell: true,
      detached: true,
      ...opts
    })
    talkTo(proc, dialogs)
    proc.stdout.on('data', data => {
      stdout += data.toString()
    })
    proc.stderr.on('data', data => {
      stderr += data.toString()
    })

    function endChild() {
      resolve({ stdout, stderr })
    }
    proc.on('SIGINT', endChild)
    proc.on('SIGKILL', endChild)
    proc.on('SIGTERM', endChild)
    proc.on('beforeExit', endChild)
    proc.on('exit', endChild)
    proc.on('close', endChild)

    function end() {
      proc.kill('SIGINT')
      proc.kill('SIGTERM')
    }
    process.on('SIGINT', end)
    process.on('SIGKILL', end)
    process.on('SIGTERM', end)
    process.on('beforeExit', end)
    process.on('exit', end)
  })
}

/**
 * 列出所有文件/文件夹
 *
 * @param {string} pattern - glob pattern
 * @param {Object} globopts  - glob options
 * @returns {<Promise>}
 */
function lsfiles(pattern = '**/{*,.*}', globopts = {}) {
  return new Promise((resolve, reject) => {
    glob(pattern, globopts, (err, files) => {
      if (err) {
        reject(err)
      } else {
        resolve(files)
      }
    })
  })
}

/**
 * 复制一份项目
 * 供测试
 *
 * @param {String} projectDir - 项目目录
 * @returns {Promise<projectDir,buildDir>}
 */
async function copyApp(projectDir) {
  const target = path.resolve(projectDir, '../temp-test-app-' + Date.now())
  await fse.copy(projectDir, target)
  return target
}

/**
 * 读取 zip(rpk) 文件内容
 *
 * @param zipfile
 * @returns {undefined}
 */
function readZip(zipfile) {
  return new Promise((resolve, reject) => {
    fs.readFile(zipfile, (err, buffer) => {
      if (err) {
        console.error(err)
        reject(err)
      } else {
        JSZip.loadAsync(buffer).then(resolve, reject)
      }
    })
  })
}

module.exports = {
  run,
  lsfiles,
  copyApp,
  readZip
}
