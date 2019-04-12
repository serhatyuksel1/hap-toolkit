const path = require('path')
const spawnSync = require('child_process').spawnSync

const gulp = require('gulp')
const del = require('del')
const merge = require('merge-stream')
const DEBUG_MODE = process.argv.indexOf('--dev') !== -1

const mkdirp = require('mkdirp')

/* eslint-disable camelcase */

const GLOB_OPTS = {
  cwd: __dirname
}
const SPAWN_OPTS = {
  cwd: __dirname,
  stdio: 'inherit'
}

// devtools 源码目录中文件
function source (pattern) {
  return gulp.src(
    path.join('src/devtools/', pattern),
    GLOB_OPTS
  )
}

function devtools__clean () {
  return del(['release'], GLOB_OPTS)
}

function __build () {
  mkdirp.sync(path.resolve(SPAWN_OPTS.cwd, 'release/inspector/Images'))
  mkdirp.sync(path.resolve(SPAWN_OPTS.cwd, 'release/inspector/emulated_devices'))

  spawnSync('python', [
    'src/devtools/scripts/build/generate_supported_css.py',
    'src/devtools/CSSProperties.json5',
    './release/inspector/SupportedCSSProperties.js'
  ], SPAWN_OPTS)

  spawnSync('python', [
    'src/devtools/scripts/build/code_generator_frontend.py',
    'src/devtools/protocol-66.json',
    '--output_js_dir', './release/inspector'
  ], SPAWN_OPTS)

  let buildApplicationsFile = 'src/devtools/scripts/build/build_release_applications.py'
  if (DEBUG_MODE) {
    buildApplicationsFile = 'src/devtools/scripts/build/build_debug_applications.py'
  }
  spawnSync('python', [
    buildApplicationsFile,
    'shell',
    'devtools_app',
    'inspector',
    '--input_path', 'src/devtools/front_end',
    '--output_path', 'release/inspector',
    '--debug', '0'
  ], SPAWN_OPTS)

  spawnSync('python', [
    'src/devtools/scripts/build/generate_devtools_extension_api.py',
    'release/inspector/devtools_extension_api.js',
    'src/devtools/front_end/extensions/ExtensionAPI.js'
  ], SPAWN_OPTS)

  return merge(
    source('front_end/Images/*').pipe(
      gulp.dest('./release/inspector/Images', GLOB_OPTS)
    ),
    source('front_end/emulated_devices/*.png').pipe(
      gulp.dest('./release/inspector/emulated_devices', GLOB_OPTS)
    )
  )
}

function devtools__build() {
  return __build()
}

// TODO output in build phase directly
function devtools__output () {
  return gulp
    .src('release/inspector/**/*.*', GLOB_OPTS)
    .pipe(gulp.dest('lib/client/html/inspector/', {
      cwd: path.resolve(__dirname, '../..') // debugger/devtools
    }))
}

const clean = devtools__clean
const build = devtools__build
const output = devtools__output
const watch = gulp.series(
  build,
  output,
  function devtools__watch () {
    return gulp.watch([
      'src/**/*.{js,py}'
    ], GLOB_OPTS, gulp.series(
      build,
      output
    ))
  }
)
module.exports = {
  default: gulp.series(
    clean,
    build,
    output
  ),
  clean,
  build,
  output,
  watch
}
