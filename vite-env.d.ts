/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_NAME: string
  readonly VITE_APP_ENV: 'development' | 'production' | 'test'
  readonly VITE_APP_URL: string
  // Add other environment variables here as needed
  // Example:
  // readonly VITE_API_URL: string
  // readonly VITE_PUSHER_APP_KEY: string
  // readonly VITE_PUSHER_APP_CLUSTER: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
