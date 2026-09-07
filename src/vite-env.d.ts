/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_DEFAULT_COMPANY_ID?: string;
  readonly VITE_APP_COMPANY_NAME?: string;
  readonly VITE_APP_COMPANY_SHORT_NAME?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
