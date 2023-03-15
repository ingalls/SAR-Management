<template>
<div class="card">
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
</div>
</template>

<script>
import {
    TrashIcon,
    DownloadIcon
} from 'vue-tabler-icons';

export default {
    name: 'File',
    props: {
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
    methods: {
        download: function() {

        },
        deleteFile: function() {

        }
    },
    components: {
        TrashIcon,
        DownloadIcon
    }
}
</script>
