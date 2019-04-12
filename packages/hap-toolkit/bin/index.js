#!/usr/bin/env node
/*
 * Copyright (C) 2017, hapjs.org. All rights reserved.
 */

const program = require('commander')
const chalk = require('chalk')
const semver = require('semver')
const { colorconsole } = require('@hap-toolkit/shared-utils')

// 最低支持的node版本
const NODE_MINIMUM_VERSION = '8.0.0'

function checkVersion() {
  const currentVersion = process.versions.node

  // 若当前版本小于支持版本
  if (semver.lt(currentVersion, NODE_MINIMUM_VERSION)) {
    colorconsole.warn(
      `检测到当前 NodeJS 版本过低，请升级到 NodeJS 版本 ${NODE_MINIMUM_VERSION} 以上`
    )
  }
}

checkVersion()

program.version(require('../package').version, '-v, --version').usage('<command> [options]')

program
  .command('init <app-name>')
  .option('--dsl <name>', 'init project by specific dsl template, eg: vue')
  .description('create a new project.')
  .action((name, options) => {
    const generate = require('../lib/commands/init')
    generate(name, options)
  })

program
  .command('build')
  .description('build the project')
  .option('--disable-subpackages', 'disable subpackages')
  .option('--disable-source-map', 'disable source map')
  .option('--disable-stream-pack', 'disable stream pack')
  .option('--disable-script-v8-v65', 'disable compile script match with v8 version 6.5')
  .option('--optimize-desc-meta', 'optimize desc meta')
  .option('--optimize-css-attr', 'optimize css attr')
  .option('--optimize-template-attr', 'optimize template attr')
  .option('--optimize-style-page-level', 'optimize style in page')
  .option('--optimize-style-app-level', 'optimize style in app ')
  .option('--enable-lazy-component', 'lazy load component')
  .option('--include-dsl-from-lib', 'bundle dsl to rpk')
  .action(options => {
    const { compile } = require('../lib/commands/compile')
    compile('native', 'dev', false, options)
  })

program
  .command('debug', { noHelp: true })
  .description('debug the project')
  .option('--open-browser', 'open QR code page in default browser')
  .action(options => {
    const launchServer = require('@hap-toolkit/server')
    const { openBrowser } = options
    launchServer({
      modules: ['debugger'],
      port: 8081,
      openBrowser
    })
  })

program
  .command('server')
  .description('open server for project')
  .option('--port <port>', 'specified port')
  .option('--watch', 'recompile project while file changes')
  .option('--clear-records', 'clear device records')
  .option('--disable-adb', 'disable adb debug')
  .option('--chrome-path <chrome-path>', 'support for a user specified chrome path')
  .option('--open-browser', 'open QR code page in default browser')
  .option('--include-dsl-from-lib', 'bundle dsl to rpk')
  .action(options => {
    const { launchServer } = require('@hap-toolkit/server')
    const { compile } = require('../lib/commands/compile')
    const { port, watch, clearRecords, chromePath, disableAdb, openBrowser } = options
    launchServer({
      port,
      watch,
      clearRecords,
      chromePath,
      disableADB: disableAdb,
      openBrowser
    })
    if (options.watch) {
      compile('native', 'dev', true, options)
    }
  })

program
  .command('watch')
  .description('recompile project while file changes')
  .option('--disable-subpackages', 'disable subpackages')
  .option('--disable-stream-pack', 'disable stream pack')
  .action(options => {
    const { compile } = require('../lib/commands/compile')
    compile('native', 'dev', true, options)
  })

program
  .command('release')
  .description('release the project')
  .option('--debug', 'use debug sign')
  .option('--stats', 'analyse time and size of webpack output files')
  .option('--disable-subpackages', 'disable subpackages')
  .option('--disable-stream-pack', 'disable stream pack')
  .option('--disable-script-v8-v65', 'disable compile script match with v8 version 6.5')
  .option('--optimize-desc-meta', 'optimize desc meta')
  .option('--optimize-css-attr', 'optimize css attr')
  .option('--optimize-template-attr', 'optimize template attr')
  .option('--optimize-style-page-level', 'optimize style in page')
  .option('--optimize-style-app-level', 'optimize style in app ')
  .option('--enable-lazy-component', 'lazy load component')
  .option('--optimize-unused-resource', 'remove unused resource')
  .action(options => {
    const { compile } = require('../lib/commands/compile')
    compile('native', 'prod', false, options)
  })

program
  .command('preview <target>')
  .description('preview app in your browser')
  .option('--port <port>', 'specified port', 8989)
  .action((target, options) => {
    const preview = require('../lib/commands/preview')
    preview(target, options)
  })

program
  .command('postinstall', { noHelp: true })
  .description('Transpiling async/await for nodejs<7.6.x, deprecated.')
  .action(() => {
    colorconsole.warn('Deprecated command!')
  })

// TODO
// Since we properly have all dependencies included,
// and if we make {babel, eslint}-configuration built-in,
// we won't need this `update` command anymore.
program
  .command('update')
  .description('update tools for project')
  .option('--force', 'force update tools for project')
  .option('--update-deps', 'update dependencies directly', { noHelp: true })
  .action(options => {
    const update = require('../lib/commands/update')
    colorconsole.warn('hap-toolkit>=0.1.0 不再需要运行此命令\n')
    update(options)
  })

program
  .command('report', { noHelp: true })
  .description('collect system information and create report.log')
  .action(() => {
    const report = require('../lib/commands/report')
    report()
  })

program
  .command('view <rpk-path>')
  .description('run server to view rpk')
  .option('--port <port>', 'specified port', 8000)
  .option('--open-browser', 'open QR code page in default browser')
  .action((rpkPath, options) => {
    const { launchServer } = require('@hap-toolkit/server')
    const { port, openBrowser } = options
    launchServer({
      port,
      openBrowser,
      rpkPath
    })
  })

program.on('--help', () => {
  console.log()
  console.log(`Run ${chalk.cyan(`hap <command> --help`)} for detailed usage of given command.`)
  console.log()
})

// 更改 NodeJS 10.1.0 上的 "fs.promise is Experiment" 日志输出位置
require('fs-extra')
setTimeout(() => {
  program.parse(process.argv)

  if (!process.argv.slice(2).length) {
    program.outputHelp()
  }
}, 0)
