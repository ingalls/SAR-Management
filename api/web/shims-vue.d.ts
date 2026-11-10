declare module '*.vue';
declare module '@tak-ps/vue-tabler';

interface ImportMetaEnv {
    readonly HASH: string
    readonly VITE_MAPBOX_TOKEN?: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
