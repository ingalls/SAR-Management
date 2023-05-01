<template>
    <TablerModal>
        <button type="button" class="btn-close" @click='close' aria-label="Close"></button>
            <div class="modal-status bg-yellow"></div>
            <div class="modal-header">
                <div class='modal-title'>Certificate Upload</div>
            </div>
            <div class="modal-body">
                <TablerInput label='Certificate Name'/>

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
import {
    TablerModal,
    TablerInput
} from '@tak-ps/vue-tabler';
import UploadDefault from './UploadDefault.vue';

export default {
    name: 'UploadModal',
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
    },
    components: {
        TablerModal,
        TablerInput,
        UploadDefault
    }
}
</script>
