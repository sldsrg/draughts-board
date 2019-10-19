import typescript from 'rollup-plugin-typescript2'
import url from 'rollup-plugin-url'
import pkg from './package.json'

export default {
  input: 'src/index.tsx',
  output: [
    {
      dir: 'lib',
      format: 'esm'
    }
  ],
  external: [...Object.keys(pkg.dependencies || {}), ...Object.keys(pkg.peerDependencies || {})],
  plugins: [
    url({
      fileName: '[dirname][name].[hash][extname]',
      destDir: 'lib',
      exclude: 'node_modules/**'
    }),
    typescript({
      clean: true
    })
  ]
}
