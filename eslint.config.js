// @ts-check

import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.recommended,
  {
    ignores: ['dist/', 'src/generated/'],
  },
  {
    rules: {
      '@typescript-eslint/no-unused-vars': 'off',
    },
  },
)
