module.exports = function(api) {
  api.cache(true)
  return {
    presets: [
      [
        '@babel/preset-env',
        {
          targets: {
            node: 8
          }
        }
      ]
    ],
    plugins: [
      '@babel/plugin-transform-modules-commonjs',
      '@babel/plugin-proposal-optional-chaining'
    ],
    babelrcRoots: ['.', 'node_modules']
  }
}
