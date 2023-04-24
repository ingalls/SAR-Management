<template>
<div class="card">
    <TablerLoading v-if='loading.main'/>
    <template v-else>
        <div class='card-header'>
            <div class='col d-flex'>
                <h1 class="card-title" v-text='file'></h1>
                <div class='ms-auto btn-list'>
                    <TrashIcon @click='deleteFile' class='cursor-pointer'/>
                    <DownloadIcon @click='download' class='cursor-pointer'/>
                </div>
            </div>
        </div>
        <div class="card-body">
            <div v-if='is_img'>
                <img :src='url(false)'/>
            </div>
            <div v-else-if='is_pdf'>
                <PDF :src="url()" :page='1' :resize='true' :text='false'>
                    <template slot="loading">
                        <TablerLoading/>
                    </template>
                </PDF>
            </div>
            <div v-else-if='loading.preview'>
                <TablerLoading/>
            </div>
            <div v-else-if='preview'>
                <PDF :src='preview' :page='1' :resize='true' :text='false'>
                    <template slot="loading">
                        <TablerLoading/>
                    </template>
                </PDF>
            </div>
            <div v-else-if='preview === null'>
                <div class='d-flex justify-content-center mt-4 mb-2'>
                    <EyeOffIcon width='48' height='48'/>
                </div>

                <div class='text-center mb-4 mt-2'>
                    <div>Unsupported Preview Format</div>
                </div>

                <div v-if='manage' class='d-flex justify-content-center my-4'>
                    <div @click='generate' class='btn btn-secondary'>Generate PDF</div>
                </div>
            </div>
        </div>
    </template>
</div>
</template>

<script>
import PDF from 'pdfvuer/dist/pdfvuer.common.js';
import {
    TablerLoading
} from '@tak-ps/vue-tabler';
import {
    TrashIcon,
    EyeOffIcon,
    DownloadIcon
} from 'vue-tabler-icons';

export default {
    name: 'File',
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
    data: function() {
        return {
            loading: {
                main: false,
                preview: true
            },
            preview: null,
        }
    },
    mounted: async function() {
        const url = window.stdurl('/api/doc');
        url.searchParams.append('prefix', this.prefix + this.file + '/');
        const res = await window.std(url)

        for (const doc of res.documents) {
            if (doc.key === 'preview.pdf') {
                const url = window.stdurl('/api/doc/download');
                url.searchParams.append('prefix', this.prefix + this.file + '/');
                url.searchParams.append('file', 'preview.pdf');
                url.searchParams.append('download', 'false');
                url.searchParams.append('token', localStorage.token);
                this.preview = String(url);
                break;
            }
        }

        this.loading.preview = false;
    },
    methods: {
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
            this.loading = true;
            const url = window.stdurl('/api/doc/convert');
            url.searchParams.append('prefix', this.prefix);
            url.searchParams.append('file', this.file);
            await window.std(url);
            this.loading = false;
        },
        deleteFile: async function() {
            this.loading = true;
            const url = window.stdurl('/api/doc');
            url.searchParams.append('file', this.prefix + this.file);
            await window.std(url, {
                method: 'DELETE'
            });

            this.loading = false;
            this.$emit('delete');
        }
    },
    components: {
        PDF,
        TrashIcon,
        EyeOffIcon,
        DownloadIcon,
        TablerLoading
    }
}
</script>
