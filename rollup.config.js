import typescript from 'rollup-plugin-typescript2'
import rebase from 'rollup-plugin-rebase'
import pkg from './package.json'

export default {
  input: 'src/index.tsx',
  output: [
    {
      dir: 'lib',
      format: 'esm'
    }
  ],
  external: [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {})
  ],
  plugins: [
    rebase({
      verbose: true,
      keepName: true,
      outputFolder: 'lib',
      assetFolder: 'img'
    }),
    typescript({
      typescript: require('typescript')
    })
  ]
}
