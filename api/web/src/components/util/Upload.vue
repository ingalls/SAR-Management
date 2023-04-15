<template>
    <TablerModal>
        <button type="button" class="btn-close" @click='close' aria-label="Close"></button>
            <div class="modal-status bg-yellow"></div>
            <div class="modal-body text-center py-4">
                <UploadDefault
                    :url='url'
                    :cancel='false'
                    @done='$emit("done")'
                    @cancel='$emit("cancel")'
                />
            </div>
    </TablerModal>
</template>

<script>
import { TablerModal } from '@tak-ps/vue-tabler';
import UploadDefault from './UploadDefault.vue';

export default {
    name: 'UploadModal',
    props: {
        url: {
            type: String,
            default: '/api/asset'
        },
        headers: {
            type: Object,
            default: function() {
                return {};
            }
        },
        prefix: {
            type: String,
            default: ''
        }
    },
    methods: {
        close: function() {
            this.$emit('close');
        }
    },
    components: {
        TablerModal,
        UploadDefault
    }
}
</script>
