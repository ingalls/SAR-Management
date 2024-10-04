<template>
    <TablerModal>
        <button
            type='button'
            class='btn-close'
            aria-label='Close'
            @click='close'
        />
        <div class='modal-status bg-yellow' />
        <div class='modal-body text-center py-4'>
            <UploadDefault
                :url='url'
                :headers='headers'
                :cancel='false'
                @done='$emit("done", $event)'
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
    components: {
        TablerModal,
        UploadDefault
    },
    props: {
        url: {
            type: [String, URL],
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
    }
}
</script>
