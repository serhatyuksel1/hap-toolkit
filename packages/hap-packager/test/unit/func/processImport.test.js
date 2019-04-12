/*
 * Copyright (C) 2017, hapjs.org. All rights reserved.
 */
'use strict'
const path = require('path')
const { processImport } = require('@hap-toolkit/compiler/src/style/process')
const testCssDir = path.resolve(__dirname, '../../case/ux/Helloworld/Common')

const code = `
/* comment */
@import './common.css' screen and (orientation: portrait);
.box {
  width: 100px;
}
@import './common2.css' screen and (orientation: portrait);

`

describe('测试processImport函数', () => {
  it('process import', async () => {
    const result = processImport(code, testCssDir, [], [])
    expect(result).toMatchSnapshot()
  })
})
