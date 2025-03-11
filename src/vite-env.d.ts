/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GITHUB_TOKEN: string
  readonly VITE_STARS_EXPLORER_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
