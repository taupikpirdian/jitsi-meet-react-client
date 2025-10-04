/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_JITSI_EXTERNAL_API_URL?: string;
  readonly VITE_JITSI_DOMAIN?: string;
  readonly VITE_JITSI_JWT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}