import type { CodegenConfig } from '@graphql-codegen/cli'

const config: CodegenConfig = {
  overwrite: true,
  schema: './node_modules/@octokit/graphql-schema/schema.graphql',
  documents: 'src/**/*.graphql',
  generates: {
    'src/generated/types.ts': {
      plugins: ['typescript', 'typescript-operations'],
    },
  },
}

export default config
