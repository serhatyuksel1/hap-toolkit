# devtools 说明

## 目录结构说明

<pre><code>

.
├── release                  # release是打包出的目录;
│   └── inspector
└── src
    └── devtools             # chrome-devtools的源代码, 目前是50.0.2661.113版本;


</code></pre>


## 打包脚本 gulp-devtools.js

1, 使用 gulp 执行构建任务，构建出 release/inspector，供 debug-server 使用
2, 将 release/inspector 复制到 ../lib/client/html/inspector 下
3, 最终随npm包一起发布
