"use strict";var _compiler=require("@hap-toolkit/compiler");module.exports=function(e,r){this.cacheable&&this.cacheable();const{parsed:c}=(0,_compiler.parseScript)(e),o=`module.exports = function __scriptModule__ (module, exports, $app_require$){${c}}`;this.callback(null,o,r)};
//# sourceMappingURL=script-loader.js.map
