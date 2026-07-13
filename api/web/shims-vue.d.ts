declare module '*.vue';
declare module '@tak-ps/vue-tabler';

interface ImportMetaEnv {
    readonly HASH: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
