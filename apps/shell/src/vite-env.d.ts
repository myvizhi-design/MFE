/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_ACCESS_TOKEN_TTL_MIN: string;
  readonly VITE_MFE_REGISTRY_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
