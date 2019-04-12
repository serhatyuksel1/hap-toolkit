# Change Log

## [0.4.1] - 2019-04-10

- 修复了 dsl-vue 编译 css 文件名不正确的问题

## [0.4.0] - 2019-04-05

- 添加`--disable-stream-pack`参数用于禁用流式包（`build`,`release`,`watch`命令有效）
- 支持自定义配置
- 支持`font-weight`
- 优化命令交互

## [0.3.1] - 2019-03-19

- 监听模式现在会监听`manifest.json`文件
- 修复若干问题

## [0.3.0] - 2019-03-05

### 更新

- 1040 平台支持
- 不再支持`node 6`，要求`node 8`以上版本
- 不再创建备份文件

### 新增

- 新增`web`预览功能，打开服务`/preview`页面可使用浏览器预览快应用
- 新增`hap preview`子命令，可直接预览`rpk`文件或解压的`rpk`文件目录（包括`build`目录）
- 新增`hap view`子命令，可用于直接查看`rpk` 文件。详情可执行`hap view --help`查看

### 修复

- 修复了`hap-toolkit`导致系统`adb` 不可使用的问题
- 修复其他若干缺陷

### 优化

- 优化了`hap init` 子命令，当文件夹存在时会询问输入新的应用名

## [0.2.2] - 2019-02-18

### 更新

- 优化了错误信息提示

## [0.2.1] - 2019-01-29

### 修复

- 修复`toolkit`误报使用`node`原生模块问题

## [0.2.0] - 2019-01-25

### 更新

- 支持分包
- `chrome devtools` 升级到 66
- 移除的`mix`命令（`hap`和`mix`完全一致)
- 优化错误栈信息
- 稳定性优化

### 修复

- 修复初始化模块的 elisnt 配置无效的问题
- 修复若干 bug

## [0.1.1] - 2018-12-28

### 修复

- 初始化项目时，更新项目的 toolkit 的版本号
- 支持 node 6+（未来将不再支持 node 6，建议使用 node 8 以上版本）
- IDE 无法自动升级项目

## [0.1.0] - 2018-12-18

### 更新

- 项目 package.json 的依赖只有 hap-toolkit，移除了其他依赖
- 支持可以自定义属性 data-xxx
- slot 可以作为 text 的子组件
- 支持 postcss 解析 css

### 修复

- 修复了图片资源检查的 bug

### 新增

- 支持 touchstart，touchmove，touchcancel，touchend 事件
- 支持 font-family 样式
- image 组件增加 complete、error 事件
- video 组件支持 muted 属性
- audio 组件支持 stop 方法
- 支持 CSS @font-face
- justify-content 支持 space-around
- background-image 支持网络图片地址
- input/textarea 组件增加 selectionchange 事件
- tab-content 组件增加 scrollable 属性
- input 组件支持动态切换 type 类型
- WebSocket 支持 ArrayBuffer

## [0.0.38] - 2018-11-13

### 更新

- 升级到 babel7
- 升级到 webpack4
- 优化了 webpack 的参数读取方式

### 修复

- transform 支持多个值，动画命名以下划线开发
- 支持 map 组件定位点样式修改
- 修复调试的时候，屏幕息屏的确认

### 新增

- 编译工具支持卡片开发
- 命令行增加清除设备记录,如:hap server --clear-records
- 使用 node 原生模块增加报错提示
- 增加了对 IDE 默认打开浏览器的支持
- 增加了捕获 webpack 的错误提示

### 注意

由于升级 toolkit 到 babel7，webpack4，可能会引起比较大的改动

## [0.0.37] - 2018-10-10

### 更新

- 升级 mocha 到 5.2.0 版本
- 优化了 webpack.config.js

### 修复

- 修复 windows 下资源引用路径时转换的 BUG
- 修复了 adb 执行时候的错误提示
- 修复打包时 manifest.json 中 config.debug 标识的 BUG

### 新增

- 支持 node_modules 模块中引入快应用接口

## [0.0.36] - 2018-9-3

### 更新

- 重构了编译模块，调整了打包的生命周期，从 done 到 after-emit

### 修复

- 引入 json 文件
- 引入 node_modules 中@组织的库

### 新增

- usb 调试功能（1020+）
- build 时增加参数 env.disable-source-map 以禁用 sourcemap

## [0.0.35] - 2018-8-15

### 更新

- chrome 调试页面：隐藏导航条，console 面板增加 warn 提示

### 修复

- 修复调试时，断点调试的问题（1020+）
- 修复微信，微博，qq 账号在控制台下的提示警告问题
- 修复调试时，element 面板的展开问题
- 修复 sourceMap 行数不正确
- 修复打开 chrome 出现的一些问题
- 修复 css 属性 border-color 的解析

### 新增

- 支持 npm run release 打包的 rpk 包增加版本号和时间戳功能
- 调试器支持编辑 html 和属性（1020+）
- 构建 rpk 时向 hap-toolkit 中历史记录的最近 5 条手机设备发送/update HTTP 信息

## [0.0.34] - 2018-6-21

### 更新

- 升级到 webpack3

### 修复

- 修复 translate(tx)转换不正确问题
- 修复 chrome 调试器通过键盘左右键展开 element 节点

### 新增

- 新增 chrome 调试器动态编辑样式功能
- 新增预处理.9 图
- 支持 background-position/ translate % unit
- 多列 picker 属性 type 增加 multi-text 值,增加 onclumnchange 和 cancel 方法
- flexbox 添加 align-self 属性支持
- 新增 textarea 组件属性 maxlength
- 新增 input 组件属性 maxlength，方法 enterkeytype 和 enterkeyclick
- 新增 video 组件属性 controls
- 新增 swiper 组件属性 loop

## [0.0.32] - 2018-5-15

### 修复

- 优化 jszip 打包的参数配置

### 更新

- 重构了编译模块，移除 hap-tools，使用 hap-toolkit 替代
- 优化 package.json 的文件的内容，精简 script 命令
- 更改 hap update --force 方式，覆盖 script, dependencies, devDependencies

## [0.0.31] - 2018-4-13

### 修复

- 打包使用 jszip 替换 node-archiver；进而支持 NodeJS 8.0.\*等版本；

### 新增

- 新增 popup 的事件 visibilitychange；
- 在 manifest.json 里面支持了 debug 调试项；

### 更新

- 更新 init 时的示例代码，调整代码风格；
- 重构 toolkit 项目以及内置模块；
- 如果在 manifest.json 里没有申明 minPlatformVersion，默认为 101；
