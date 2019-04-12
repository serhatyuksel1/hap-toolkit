/*
 * Copyright (C) 2017, hapjs.org. All rights reserved.
 */
'use strict'

const fs = require('fs')
const path = require('path')
const chai = require('chai')
const sinonChai = require('sinon-chai')
const { mkdirsSync } = require('@hap-toolkit/shared-utils')
const signer = require('../../../lib/common/sign')

chai.use(sinonChai)

/**
 * Style
 */
describe('Zip签名', () => {
  const basedir = path.join(__dirname, '../..', 'case/ux/TestSign')
  const builddir = path.join(__dirname, '../..', 'build/ux/TestSign')
  const privatekey = fs.readFileSync(path.join(basedir, 'private.pem'))
  const certpem = fs.readFileSync(path.join(basedir, 'certificate.pem'))

  function $expect(name) {
    const filepath = path.join(basedir, name + '.zip')
    const fileCont = fs.readFileSync(filepath)
    // TODO
    // 1, 列出 zip 中的文件列表
    // 2, 检查签名
    const fileContSign = signer.signZip(fileCont, null, privatekey, certpem)
    const filePathSign = path.join(builddir, name + '.signed.zip')
    fs.writeFileSync(filePathSign, fileContSign)
  }

  beforeAll(() => {
    mkdirsSync(path.resolve(__dirname, '../../build/ux/TestSign'))
  })

  beforeEach(() => {})

  it('sign zip', () => {
    $expect('example')
  })
})
