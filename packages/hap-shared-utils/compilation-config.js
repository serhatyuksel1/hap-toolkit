/*
 * Copyright (C) 2017, hapjs.org. All rights reserved.
 */

const options = {
  // 是否开启分析
  stats: false,
  // 是否编译复合选择器,生成_meta信息
  optimizeDescMeta: false,
  // 是否压缩CSS属性名
  optimizeCssAttr: false,
  // 是否压缩模板属性名
  optimizeTemplateAttr: false,
  // TODO:是否支持页面级别的样式(暂不支持)
  optimizeStylePageLevel: false,
  // TODO:是否支持应用级别的样式(暂不支持)
  optimizeStyleAppLevel: false,
  // 延迟加载自定义组件
  enableLazyComponent: false
}

/**
 * 初始化命令行中传递的配置
 * @param argopts - 命令行参数对象
 */
function initOptions(argopts) {
  // TODO release memeory, use optimize-prop only
  Object.assign(options, argopts)
}

module.exports = { options, initOptions }
