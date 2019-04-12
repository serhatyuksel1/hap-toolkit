/*
 * Copyright (C) 2017, hapjs.org. All rights reserved.
 */

const path = require('path')
const fs = require('fs')
const builtinList = require('module').builtinModules
const fsExtra = require('fs-extra')
const webpack = require('webpack')
const { colorconsole, KnownError } = require('@hap-toolkit/shared-utils')
const globalConfig = require('@hap-toolkit/shared-utils/config')
const { ENTRY_TYPE } = require('@hap-toolkit/packager/lib/common/utils')
const { name, resolveFile } = require('@hap-toolkit/packager/lib/common/info')

// 主包保留名
const MAIN_PKG_NAME = 'base'
// 能使用rpks能力的调试器最低版本
const RPKS_SUPPORT_VERSION_FROM = 1040

/**
 * 获取json文件
 * @param pathJson
 */
function getJson(pathJson) {
  let config
  if (fs.existsSync(pathJson)) {
    config = JSON.parse(fs.readFileSync(pathJson))
  }
  return config || {}
}

/**
 * 提取其中的应用，页面，worker的脚本文件
 * @return {Array}
 * 以 basedir 为基本目录，获取 manifest 的配置的入口页面
 *
 * @param {ManifestObject} manifest - manifest
 * @param {String} basedir - 扫描目录
 * @param {String} cwd - 工作目录
 * @returns {Array<Object>}
 */
function resolveEntries(manifest, basedir, cwd) {
  if (!manifest.router) {
    throw Error('manifest.json 中未配置路由！')
  }
  const entries = {}
  const pagesConf = manifest.router.pages || {}
  const widgetsConf = manifest.router.widgets || {}
  const confsList = [
    {
      confs: widgetsConf,
      type: ENTRY_TYPE.CARD
    }
  ]
  confsList.unshift({
    confs: pagesConf,
    type: ENTRY_TYPE.PAGE
  })
  const appFile = resolveFile(path.join(basedir, 'app'))
  if (!appFile) {
    colorconsole.error('app 文件不存在')
    process.exit(1)
  }
  entries['app'] = './' + path.relative(cwd, appFile) + `?uxType=${ENTRY_TYPE.APP}`
  confsList.forEach(({ confs, type }) => {
    Object.keys(confs).forEach(routePath => {
      const conf = confs[routePath]
      const entryKey = path.join(routePath, conf.component)
      const filepath = resolveFile(path.join(basedir, entryKey))
      let sourceFile = path.relative(cwd, filepath)
      sourceFile = './' + sourceFile + `?uxType=${type}`
      sourceFile = sourceFile.replace(/\\/g, '/')
      entries[entryKey] = sourceFile
    })
  })
  const workers = manifest.workers
  if (workers && workers.entries && workers.entries instanceof Array) {
    workers.entries
      .filter(worker => worker.file)
      .forEach(worker => {
        entries[worker.file.replace(/\.js$/, '')] = './src/' + worker.file
      })
  }
  return entries
}

/**
 * 动态生成 webpack 配置项
 *
 * @param {Object} options - 命令行参数对象
 * @param {String} [options.cwd] - 工作目录
 * @param {boolean} [options.debug=false] - 是否开启调试
 * @param {boolean} [options.stats=false] - 是否开启分析
 * @param {boolean} [options.disableSubpackages=false] - 是否禁止分包
 * @param {boolean} [options.disableSourceMap=false] - 是否禁用 sourcemap
 * @param {boolean} [options.optimizeCssAttr=false] - 优化 css 属性
 * @param {boolean} [options.optimizeDescMeta=false] - 优化 css 描述数据
 * @param {boolean} [options.optimizeTemplateAttr=false] - 优化模板属性
 * @param {boolean} [options.optimizeStyleAppLevel=false] - 优化 app 样式等级
 * @param {boolean} [options.optimizeStylePageLevel=false] - 优化 app 样式等级
 * @param {production|development} mode - webpack mode
 * @returns {WebpackConfiguration}
 */
module.exports = function genWebpackConf(options, mode) {
  // 项目目录
  if (options.cwd) {
    globalConfig.projectPath = options.cwd
  }
  const cwd = globalConfig.projectPath
  // 支持文件扩展名
  const FILE_EXT_LIST = name.extList

  // 源代码目录
  const SRC_DIR = path.join(cwd, globalConfig.sourceRoot)
  // 签名文件目录
  const SIGN_FOLDER = globalConfig.signRoot
  // 编译文件的目录
  const BUILD_DIR = path.join(cwd, globalConfig.outputPath)
  // 最终发布目录
  const DIST_DIR = path.join(cwd, globalConfig.releasePath)
  // 打包配置文件
  const manifestFile = path.join(SRC_DIR, 'manifest.json')

  const pathPackageJson = path.join(cwd, 'package.json')
  const packageJson = getJson(pathPackageJson)

  // 校验项目工程
  validateProject()

  // 清理 BUILD_DIR DIST_DIR
  cleanup()

  let manifest
  try {
    manifest = getJson(manifestFile)
  } catch (e) {
    throw new KnownError('manifest.json 解析失败！')
  }
  validateManifest(manifest, options)

  // 设置合适的v8版本
  setAdaptForV8Version(options.disableScriptV8V65)

  // 页面文件
  const entries = resolveEntries(manifest, SRC_DIR, cwd)

  // 环境变量
  const env = {
    // 平台：native
    NODE_PLATFORM: process.env.NODE_PLATFORM,
    // 阶段: dev|test|release
    NODE_PHASE: process.env.NODE_PHASE,
    // 是否注入测试框架
    NODE_TEST: process.env.NODE_TEST
  }
  colorconsole.info(`配置环境：${JSON.stringify(env)}`)

  const webpackConf = {
    context: cwd,
    mode,
    entry: entries,
    output: {
      path: BUILD_DIR,
      filename: '[name].js'
    },
    module: {
      rules: []
    },
    externals: [checkBuiltinModules],
    plugins: [
      // 定义环境变量
      new webpack.DefinePlugin({
        // 平台：na
        ENV_PLATFORM: JSON.stringify(env.NODE_PLATFORM),
        // 阶段: dev|test|release
        ENV_PHASE: JSON.stringify(env.NODE_PHASE),
        ENV_PHASE_DV: env.NODE_PHASE === 'dev',
        ENV_PHASE_QA: env.NODE_PHASE === 'test',
        ENV_PHASE_OL: env.NODE_PHASE === 'prod'
      }),
      // 编译耗时
      function BuildTimePlugin() {
        let start
        this.hooks.run.tapAsync('start', function(compiler, callback) {
          start = Date.now()
          callback()
        })
        this.hooks.watchRun.tapAsync('watch-run', function(compiler, callback) {
          start = Date.now()
          callback()
        })
        this.hooks.done.tap('end', function() {
          const secs = (Date.now() - start) / 1000
          colorconsole.info(`Build Time Cost: ${secs}s`)
        })
      }
    ],
    node: {
      global: false
    },
    resolve: {
      modules: ['node_modules'],
      extensions: ['.webpack.js', '.web.js', '.js', '.json'].concat(FILE_EXT_LIST)
    },
    stats: {
      builtAt: false,
      entrypoints: false,
      children: false,
      chunks: false,
      chunkModules: false,
      chunkOrigins: false,
      modules: false,
      version: false,
      assets: false
    }
  }

  // 开发：sourcemap
  if (env.NODE_PHASE === 'dev' && !options.disableSourceMap) {
    webpackConf.devtool = 'source-map'
  }

  // 加载配置
  loadWebpackConfList()

  /**
   * 尝试加载每个模块的webpack配置
   */
  function loadWebpackConfList() {
    const moduleList = [
      {
        name: 'packager',
        path: require.resolve('@hap-toolkit/packager/lib/webpack.config.js')
      },
      {
        // 增加：开发者项目目录下的config文件夹
        // 注意：Hook机制不保证向后兼容
        name: '',
        path: path.join(cwd, 'config/webpack.config.js')
      }
    ]

    const { package: appPackageName, versionCode, subpackages, workers } = manifest
    for (let i = 0, len = moduleList.length; i < len; i++) {
      const fileConf = moduleList[i].path
      if (fs.existsSync(fileConf)) {
        try {
          const moduleWebpackConf = require(fileConf)
          if (moduleWebpackConf.postHook) {
            moduleWebpackConf.postHook(
              webpackConf,
              {
                appPackageName,
                versionCode,
                nodeConf: env,
                pathDist: DIST_DIR,
                pathSrc: SRC_DIR,
                subpackages,
                pathBuild: BUILD_DIR,
                pathSignFolder: SIGN_FOLDER,
                workers
              },
              options
            )
          }
        } catch (err) {
          console.error(`加载webpack配置文件[${fileConf}]出错：${err.message}`, err)
        }
      }
    }
  }

  /**
   * 验证项目配置正确
   */
  function validateProject() {
    if (!fs.existsSync(manifestFile)) {
      colorconsole.throw(
        `请确认项目%projectDir%/${globalConfig.sourceRoot}/下存在manifest.json文件：${manifestFile}`
      )
      throw new KnownError(`找不到 ${globalConfig.sourceRoot}/manifest.json`)
    }
  }

  /**
   * 清理 BUILD_DIR DIST_DIR
   */
  function cleanup() {
    fsExtra.emptyDirSync(BUILD_DIR)

    // 清空 dist 目录下的文件(仅文件)
    if (fs.existsSync(DIST_DIR)) {
      const zipfiles = fs.readdirSync(DIST_DIR)
      zipfiles.forEach(function(file) {
        const curPath = DIST_DIR + '/' + file
        if (fs.statSync(curPath).isFile()) {
          fs.unlinkSync(curPath)
        }
      })
    }
  }

  /**
   * 设置v8版本
   * @param {boolean} disableScriptV8V65
   */
  function setAdaptForV8Version(disableScriptV8V65) {
    const minPlatformVersion = parseInt(manifest.minPlatformVersion)
    if (fs.existsSync(pathPackageJson)) {
      if (!disableScriptV8V65 && minPlatformVersion >= 1040) {
        const hasDefinedChrome65 =
          packageJson.browserslist && packageJson.browserslist.includes('chrome 65')
        colorconsole.log(
          `当前minPlatformVersion >= 1040，平台采用v8版本为6.5+（对应chrome版本为65版+），工具将不再对V8 6.5版本支持的ES6代码进行转换`
        )
        if (hasDefinedChrome65) return
        // v8 6.5相当于chrome 65版本
        packageJson.browserslist = ['chrome 65']
        fs.writeFileSync(pathPackageJson, JSON.stringify(packageJson, null, 2))
      } else if (packageJson.browserslist) {
        delete packageJson.browserslist
        fs.writeFileSync(pathPackageJson, JSON.stringify(packageJson, null, 2))
      }
    }
  }

  /**
   * 验证项目的应用全局配置
   * @param {Manifest} manifest - manifest 对象
   */
  function validateManifest(manifest, options) {
    const { subpackages } = manifest
    // 验证分包规则
    if (!options.disableSubpackages && subpackages && subpackages.length > 1) {
      validateManifestSubpackages(subpackages)
    }
  }

  /**
   * 检查subpackages字段配置。
   * 除subpackages字段指定的文件是打进非主包外，剩余文件都打进主包
   * 主包与是独立包的非主包，都需要manifest文件
   * @param {object[]} subpackages 分包列表: [{ name, resource, standalone }]
   * @param {string} subpackages[].name 分包名字，必填，不能重复，且不能是"base"（这是主包保留名），只能是 数字字母_ 组成
   * @param {string} subpackages[].resource 分包资源路径，必须为src下文件目录，不能重复，分包间不能有包含关系，只能是 数字字母_ 开头，数字字母_-/ 组成
   * @param {boolean} subpackages[].standalone 是否独立包标识，是独立包则需要manifest文件，缺省为false；
   */
  function validateManifestSubpackages(subpackages) {
    // 分包名的校验规则
    const nameReg = /^\w+$/
    // 资源名的校验规则
    const resourceReg = /^\w[\w-/]*$/
    // 用以检测分包名是否重复
    const nameList = []
    // 用以检测分包资源路径是否重复
    const resList = []
    let name = ''
    let resource = ''

    // 资源路径的具体文件路径
    let resPath = ''
    let index = 0

    /**
     * 检查当前资源路径与已校验过的资源路径是否有包含关系。
     *
     * @param {string} resource - 当前要校验的资源
     * @param {number} index - 当前要校验资源的序号
     * @return {boolean} true/false - 存在/不存在
     */
    function checkPathInclusion(resource, currentIndex) {
      for (let i = 0, l = resList.length; i < l; i++) {
        const _res = resList[i]
        if (resource.startsWith(_res) || _res.startsWith(resource)) {
          colorconsole.throw(
            `第${currentIndex}分包的资源'${resource}'与第${i +
              1}分包的资源'${_res}'有包含关系，请修改`
          )
          return true
        }
      }
      return false
    }

    subpackages.forEach((subpkg, i) => {
      name = subpkg.name
      resource = subpkg.resource
      resPath = resource && path.join(SRC_DIR, resource)
      index = i + 1
      if (!name) {
        colorconsole.throw(`第${index}分包的名字不能为空，请添加`)
      } else if (!nameReg.test(name)) {
        colorconsole.throw(`第${index}分包的名字'${name}'不合法，只能是数字字母下划线组成，请修改`)
      } else if (name === MAIN_PKG_NAME) {
        colorconsole.throw(`第${index}分包的名字'${name}'是主包保留名，请修改`)
      } else if (nameList.indexOf(name) > -1) {
        colorconsole.throw(`第${index}分包的名字'${name}'已存在，请修改`)
      } else {
        nameList.push(name)
      }

      if (!resource) {
        colorconsole.throw(`第${index}分包的资源名不能为空，请添加`)
      } else if (!resourceReg.test(resource)) {
        colorconsole.throw(
          `第${index}分包的资源名'${resource}'不合法，只能是 数字字母_ 开头，数字字母_-/ 组成，请修改`
        )
      } else if (resList.indexOf(resource) > -1) {
        colorconsole.throw(`第${index}分包的资源'${resource}'已被使用，请修改`)
      } else if (!fs.existsSync(resPath)) {
        colorconsole.throw(`第${index}分包的资源'${resource}', 文件目录'${resPath}'不存在，请修改`)
      } else if (!checkPathInclusion(resource, index)) {
        resList.push(resource)
      }
    })
    colorconsole.warn(
      `项目已配置分包，若想使用分包功能，请确保平台版本 >= ${RPKS_SUPPORT_VERSION_FROM}`
    )
  }

  /**
   * 使用 node 原生模块给予警告
   */
  function checkBuiltinModules(context, request, callback) {
    // 提取 package.json 中的依赖
    let projectDependencies = []
    if (packageJson.devDependencies) {
      projectDependencies = Object.keys(packageJson.devDependencies)
    }
    if (packageJson.dependencies) {
      projectDependencies = projectDependencies.concat(Object.keys(packageJson.dependencies))
    }

    // 枚举 node 原生模块
    const enumList = [
      'assert',
      'console',
      'buffer',
      'child_process',
      'cluster',
      'console',
      'constants',
      'crypto',
      'dgram',
      'dns',
      'domain',
      'events',
      'fs',
      'http',
      'https',
      'module',
      'net',
      'os',
      'path',
      'process',
      'punycode',
      'querystring',
      'readline',
      'repl',
      'stream',
      'string_decoder',
      'sys',
      'timers',
      'tls',
      'tty',
      'url',
      'util',
      'vm',
      'zlib'
    ]
    const externalsList = Array.isArray(builtinList) ? builtinList : enumList
    // 确定是node原生模块，并且没有在package.json 中引用这个模块
    if (externalsList.indexOf(request) > -1 && projectDependencies.indexOf(request) === -1) {
      colorconsole.warn(
        `您当前使用了 ${request} 似乎是 node 原生模块, 快应用不是 node 环境不支持 node 原生模块`
      )
    }
    callback()
  }
  return webpackConf
}
