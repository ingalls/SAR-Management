<template>
<div class="card">
    <TablerLoading v-if='loading'/>
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
                IMAGE
            </div>
        </div>
    </template>
</div>
</template>

<script>
import {
    TablerLoading
} from '@tak-ps/vue-tabler';
import {
    TrashIcon,
    DownloadIcon
} from 'vue-tabler-icons';

export default {
    name: 'File',
    props: {
        prefix: {
            type: String,
            required: true
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
            loading: false
        }
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
        TrashIcon,
        DownloadIcon,
        TablerLoading
    }
}
</script>
