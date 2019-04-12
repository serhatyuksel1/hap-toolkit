/*
 * Copyright (C) 2017, hapjs.org. All rights reserved.
 */

const fs = require('fs')
const path = require('path')
const fse = require('fs-extra')
const argv = require('yargs').argv
const chalk = require('chalk')

const copyFiles = [
  '.eslintignore',
  '.eslintrc',
  '.gitignore',
  '.prettierignore',
  '.prettierrc',
  'babel.config.js',
  'CONTRIBUTING.md',
  'jest.config.js',
  'scripts/deploy.js',
  'lerna.json',
  'package.json',
  'readme.md'
]

const copyDirs = [
  {
    from: 'gulpfile.js',
    noGitignore: true
  },
  {
    from: 'packages/hap-compiler',
    exclude: ['node_modules', '.gitignore']
  },
  {
    from: 'packages/hap-debugger',
    exclude: ['node_modules', '.gitignore']
  },
  {
    from: 'packages/hap-dev-utils',
    exclude: ['node_modules', '.gitignore'],
    noGitignore: true
  },
  {
    from: 'packages/hap-dsl-vue',
    exclude: ['node_modules', '.gitignore'],
    include: ['templates/app'],
    noGitignore: true
  },
  {
    from: 'packages/hap-dsl-xvm',
    exclude: ['node_modules', '.gitignore'],
    include: ['templates/app']
  },
  {
    from: 'packages/hap-packager',
    exclude: ['node_modules', '.gitignore']
  },
  {
    from: 'packages/hap-server',
    exclude: ['node_modules', '.gitignore']
  },
  {
    from: 'packages/hap-shared-utils',
    exclude: ['node_modules', '.gitignore']
  },
  {
    from: 'packages/hap-toolkit',
    include: ['fixtures/deps-app'],
    exclude: ['node_modules', '.gitignore']
  },
  {
    from: 'packages/integration-tests',
    exclude: ['node_modules', '.gitignore'],
    noGitignore: true
  },
  {
    from: 'packages/sample',
    exclude: ['node_modules'],
    noGitignore: true
  }
]

/**
 * 归一化文件配置
 * @param {String|Object} file 文件配置
 */
function normalizeOptions(file) {
  let result = {}
  if (typeof file === 'string') {
    result = {
      to: file,
      from: file,
      exclude: [],
      include: []
    }
  } else {
    if (file.to || file.from) {
      result = Object.assign(file, {
        to: file.to || file.from,
        from: file.from || file.to,
        exclude: file.exclude || [],
        include: file.include || []
      })
    } else {
      console.warn(JSON.stringify(file), chalk.red('文件对象需要配置to或from'))
      return
    }
  }
  return result
}

/**
 * 复制任务，将指定文件拷贝到dest目录
 * @param {String} dest dest目录
 * @param {Array<String>} files 需要拷贝的文件列表
 * @param {Array<Object>} dirs 需要拷贝的目录列表
 */
function copyTask(dest, files = [], dirs = []) {
  files.concat(dirs).forEach(function(file) {
    if (!file) return
    try {
      fse.copySync(file.from, path.join(dest, file.to), {
        filter: function(path) {
          let result = true
          // exclude逻辑
          for (let i = 0, len = file.exclude.length; i < len; i++) {
            if (path.indexOf(file.exclude[i]) > -1) {
              result = false
              break
            }
            if (file.exclude[i] instanceof RegExp && file.exclude[i].test(path)) {
              result = false
              break
            }
          }
          // include优先级高，放到后面覆盖
          for (let i = 0, len = file.include.length; i < len; i++) {
            if (path.indexOf(file.include[i]) > -1) {
              result = true
              break
            }
            if (file.include[i] instanceof RegExp && file.include[i].test(path)) {
              result = true
              break
            }
          }
          return result
        }
      })
      console.log(chalk.green('复制成功:'), file.to)
    } catch (err) {
      console.log(chalk.red('copy fail'), err)
    }
  })
}

/**
 * 重写模块里的.gitignore
 * @param {String} dest dest目录
 * @param {String} pcks 模块地址
 */
function rewriteGitignore(dest, pcks) {
  pcks.forEach(function(pck) {
    if (pck.noGitignore) return
    const readPath = path.join(pck.from, '.gitignore')
    const writePath = path.join(dest, pck.to, '.gitignore')
    try {
      const ignoreContent = fs
        .readFileSync(readPath, 'utf8')
        .replace(/\/?lib\/?/g, function($0) {
          return '!' + $0
        })
        .replace(/!\/?src\/?/g, function($0) {
          return $0.slice(1)
        })
      fs.writeFileSync(writePath, ignoreContent + '\nsrc/**\nlib/**/*.js.map')
    } catch (e) {
      fs.writeFileSync(writePath, '!/lib\nsrc/**\nlib/**/*.js.map')
    }
  })
}

function main() {
  let deployPath = argv.path
  if (!deployPath) {
    deployPath = './deploy'
    console.log(chalk.green('未指定打包地址，导入到当前文件夹的deploy文件夹下'))
  }
  const dest = path.join(process.cwd(), deployPath)
  console.log(chalk.green('复制路径为 => '), dest)
  fse.ensureDirSync(dest)
  // 归一化文件目录
  const files = copyFiles.map(normalizeOptions)
  const dirs = copyDirs.map(normalizeOptions)

  copyTask(dest, files, dirs)
  rewriteGitignore(dest, dirs)
}

main()
