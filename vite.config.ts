import { fileURLToPath, URL } from 'node:url'
import path from 'path'
import { PreRenderedChunk } from 'rollup'
import { string } from 'rollup-plugin-string'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    string({
      include: 'src/**/*.graphql',
    }),
  ],
  build: {
    lib: {
      entry: {
        index: path.resolve(__dirname, 'src/index.ts'),
        extra: path.resolve(__dirname, 'src/extra.ts'),
      },
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
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
