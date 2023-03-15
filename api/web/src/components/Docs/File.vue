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
                IMAGE
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
            return this.file.endsWith('.jpg') || this.file.endsWith('.jpeg');
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
        download: function() {

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
