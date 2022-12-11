<template>
    <TablerModal>
        <button type="button" class="btn-close" @click='close' aria-label="Close"></button>
            <div class="modal-status bg-yellow"></div>
            <div class="modal-body text-center py-4">
                <form class="dropzone dz-clickable" id="dropzone-default" action="./" autocomplete="off" novalidate="">
                    <div class="dz-default dz-message">
                        <button class="dz-button" type="button">Drop files here to upload</button>
                    </div>
                </form>
            </div>
    </TablerModal>
</template>

<script>
import { TablerModal } from '@tak-ps/vue-tabler';
import Dropzone from '@tabler/core/dist/libs/dropzone/dist/dropzone.mjs';
import '@tabler/core/dist/libs/dropzone/dist/dropzone.css';
import '@tabler/core/dist/css/tabler-vendors.min.css';

export default {
    name: 'UploadModal',
    data: function() {
        return {
            dropzone: null
        }
    },
    mounted: function() {
        this.$nextTick(() => {
            this.dropzone = new Dropzone("#dropzone-default", {
                autoProcessQueue: false
            });

            this.dropzone.on('addedfile', async (file) => {
                const body = new FormData();
                body.append('file', file);

                try {
                    this.$emit('upload', await window.std('/api/asset', {
                        method: 'POST',
                        body
                    }));
                } catch (err) {
                    this.$emit('err', err);
                }
            });
        });
    },
    methods: {
        close: function() {
            this.$emit('close');
        }
    },
    components: {
        TablerModal,
    }
}
</script>
