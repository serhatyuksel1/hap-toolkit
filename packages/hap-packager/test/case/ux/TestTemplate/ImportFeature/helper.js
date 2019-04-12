// a normal module before builtin module
import foo from './foo'
import fetch from '@system.fetch'

export default {
  foo,
  fetch
}
