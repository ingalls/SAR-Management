<template>
    <div class='card'>
        <TablerLoading v-if='loading.main' />
        <template v-else>
            <div class='card-header'>
                <div class='col d-flex'>
                    <h1
                        class='card-title'
                        v-text='file'
                    />
                    <div class='ms-auto btn-list'>
                        <TablerDelete
                            v-if='manage'
                            v-tooltip='"Delete File"'
                            displaytype='icon'
                            @delete='deleteFile'
                        />
                        <IconDownload
                            v-tooltip='"Download File"'
                            class='cursor-pointer'
                            :stroke='1'
                            :size='32'
                            @click='download'
                        />
                    </div>
                </div>
            </div>
            <div v-if='is_img'>
                <img :src='url(false)'>
            </div>
            <div v-else-if='loading.preview'>
                <TablerLoading desc='Loading Preview' />
            </div>
            <div v-else-if='is_pdf || preview'>
                <embed
                    :src='preview'
                    width='100%'
                    height='1000px'
                >
            </div>
            <div v-else-if='preview === null'>
                <div class='d-flex justify-content-center mt-4 mb-2'>
                    <IconEyeOff
                        :size='48'
                        :stroke='1'
                    />
                </div>

                <div class='text-center mb-4 mt-2'>
                    <div>Unsupported Preview Format</div>
                </div>

                <div
                    v-if='manage'
                    class='d-flex justify-content-center my-4'
                >
                    <TablerLoading
                        v-if='loading.generate'
                        desc='Generating Preview'
                    />
                    <div
                        v-else
                        class='btn btn-secondary'
                        @click='generate'
                    >
                        Generate PDF
                    </div>
                </div>
            </div>
        </template>
    </div>
</template>

<script>
import {
    TablerDelete,
    TablerLoading
} from '@tak-ps/vue-tabler';
import {
    IconEyeOff,
    IconArrowBadgeLeft,
    IconArrowBadgeRight,
    IconDownload
} from '@tabler/icons-vue';

export default {
    name: 'File',
    components: {
        TablerDelete,
        IconEyeOff,
        IconArrowBadgeLeft,
        IconArrowBadgeRight,
        IconDownload,
        TablerLoading
    },
    props: {
        prefix: {
            type: String,
            required: true
        },
        manage: {
            type: Boolean,
            default: false
        },
        file: {
            type: String,
            required: true
        }
    },
    data: function() {
        return {
            loading: {
                main: false,
                generate: false,
                preview: true
            },
            preview: null,
        }
    },
    computed: {
        is_img: function() {
            for (const format of ['.jpg', '.jpeg', 'png', '.webp']) {
                if (this.file.endsWith(format)) return true;
            }
            return false;
        },
        is_pdf: function() {
            return this.file.endsWith('.pdf')
        }
    },
    mounted: async function() {
        await this.loadPreview();
    },
    methods: {
        loadPreview: async function() {
            this.loading.preview = true;
            const url = window.stdurl('/api/doc');
            url.searchParams.append('prefix', this.prefix + this.file + '/');
            const res = await window.std(url)

            for (const doc of res.items) {
                if (doc.key === 'preview.pdf') {
                    const url = window.stdurl('/api/doc/download');
                    url.searchParams.append('prefix', this.prefix + this.file);
                    url.searchParams.append('file', 'preview.pdf');
                    url.searchParams.append('download', 'false');
                    url.searchParams.append('token', localStorage.token);
                    this.preview = String(url);
                    break;
                }
            }

            this.loading.preview = false;
        },
        url: function(download = true) {
            const url = window.stdurl('/api/doc/download');
            url.searchParams.append('prefix', this.prefix);
            url.searchParams.append('file', this.file);
            url.searchParams.append('download', download);
            url.searchParams.append('token', localStorage.token);
            return String(url);
        },
        download: function() {
            window.open(this.url(true), '_blank');
        },
        generate: async function() {
            this.loading.generate = true;
            const url = window.stdurl('/api/doc/convert');
            url.searchParams.append('prefix', this.prefix);
            url.searchParams.append('file', this.file);
            await window.std(url);
            this.loading.generate = false;

            await this.loadPreview();
        },
        deleteFile: async function() {
            this.loading.main = true;
            const url = window.stdurl('/api/doc');
            url.searchParams.append('file', this.prefix + this.file);
            await window.std(url, {
                method: 'DELETE'
            });

            this.loading.main = false;
            this.$emit('delete');
        }
    }
}
</script>
