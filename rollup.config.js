import typescript from 'rollup-plugin-typescript2';
import resolve from 'rollup-plugin-node-resolve';
import dts from 'rollup-plugin-dts';

export default [
  {
    input: './src/index.ts',
    output: {
      file: './lib/index.js',
      format: 'cjs'
    },
    plugins: [
      resolve(),
      typescript({
        tsconfigOverride: {
          compilerOptions: {
            declaration: false
          }
        }
      })
    ],
    external: [
      'lodash/isFinite',
      'lodash/omitBy',
      'lodash/mapValues',
      'lodash/get',
      'lodash/isNull',
      'lodash/forEach',
      'lodash/some',
      'lodash/last',
      'lodash/isObject',
      'lodash/isEqual',
      'lodash/every',
      'moment',
      'flat',
      'mobx'
    ]
  },
  {
    // Generate bundled declaration file
    input: './src/index.ts',
    output: [{ file: './lib/index.d.ts', format: 'es' }],
    plugins: [dts()]
  }
];
