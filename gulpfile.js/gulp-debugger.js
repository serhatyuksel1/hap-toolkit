/*
 * Copyright (C) 2017, hapjs.org. All rights reserved.
 */
const path = require('path')
const gulp = require('gulp')
const babel = require('gulp-babel')
const eslint = require('gulp-eslint')
const webpack = require('webpack')
const terser = require('gulp-terser')
const pump = require('pump')
const del = require('del')
const sourcemaps = require('gulp-sourcemaps')

const { shallRun, shallWatch } = require('./utils')
const devtools = require('../packages/hap-debugger/devtools/gulp-devtools')

/* eslint-disable camelcase */
const cwd = path.resolve(__dirname, '../packages/hap-debugger')
const GLOB_OPTS = { cwd }

function debugger__clean() {
  return del(['lib/', 'devtools/*/release'], GLOB_OPTS)
}

function debugger__lint() {
  return gulp
    .src(['src/**/*.js', 'webpack.config.js', 'devtools/*/build.js'], {
      cwd,
      base: cwd
    })
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError())
}

function buildClient(callback) {
  const webpackConf = require('../packages/hap-debugger/webpack.config.js')
  webpack(webpackConf, (err, stats) => {
    if (err || stats.hasErrors()) {
      console.log(
        stats.toString({
          chunks: false,
          colors: true
        })
      )
    }
    callback()
  })
}

function debugger__transpile() {
  return gulp
    .src(
      [
        'src/**/*.js',
        '!src/client/js/*' // webpack will handle
      ],
      GLOB_OPTS
    )
    .pipe(sourcemaps.init())
    .pipe(babel())
    .pipe(sourcemaps.write('.', { sourceRoot: '../src' }))
    .pipe(gulp.dest('lib', GLOB_OPTS))
}

function debugger__minify(callback) {
  pump(
    [
      gulp.src(
        [
          'lib/**/*.js',
          '!lib/client/js/*', // webpack handled
          '!lib/client/html/**'
        ],
        GLOB_OPTS
      ),
      sourcemaps.init({ loadMaps: true }),
      terser(),
      sourcemaps.write('.', { sourceRoot: '../src' }),
      gulp.dest('lib', GLOB_OPTS)
    ],
    callback
  )
}

// gulp use named function as task name
const clean = gulp.parallel(debugger__clean, devtools.clean)
const build = gulp.series(devtools.build, devtools.output)
const lint = debugger__lint
const transpile = debugger__transpile
const minify = shallRun(debugger__minify)
const debukker = gulp.series(gulp.parallel(clean, lint), build, buildClient, transpile, minify)
const watch = shallWatch(
  'debugger',
  gulp.parallel(
    gulp.series(transpile, minify, function debugger__watch() {
      return gulp.watch(
        [
          'src/**/*.{js,html}',
          '!src/client/js/*' // webpack will handle
        ],
        GLOB_OPTS,
        gulp.series(transpile, minify)
      )
    }),
    devtools.watch
  )
)

module.exports = {
  clean,
  lint,
  build,
  default: debukker,
  watch
}
