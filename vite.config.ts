import path from 'path'
import { PreRenderedChunk } from 'rollup'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      formats: ['cjs'],
    },
    rollupOptions: {
      output: {
        dir: 'dist',
        entryFileNames: ({ name }: PreRenderedChunk) => {
          return `${name}.js`
        },
        format: 'cjs',
        strict: false,
        exports: 'none',
        minifyInternalExports: false,
      },
      treeshake: false,
    },
    minify: false,
    emptyOutDir: true,
  },
  publicDir: false,

})
