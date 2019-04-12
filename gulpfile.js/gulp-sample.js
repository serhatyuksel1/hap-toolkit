/*
 * Copyright (C) 2017, hapjs.org. All rights reserved.
 */

const path = require('path')
const gulp = require('gulp')
const del = require('del')

/* eslint-disable camelcase */
const cwd = path.resolve(__dirname, '../packages/sample/')
const GLOB_OPTS = { cwd }

function sample__clean() {
  return del(['build', 'dist'], GLOB_OPTS)
}

// gulp use named function as task name
const clean = sample__clean

module.exports = {
  clean
}
