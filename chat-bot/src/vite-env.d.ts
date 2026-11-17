/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CHAT_API_URL?: `http://${string}` | `https://${string}` | `/${string}`
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
