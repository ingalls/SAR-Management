<template>
    <TablerModal>
        <button type="button" class="btn-close" @click='close' aria-label="Close"></button>
            <div class="modal-status bg-yellow"></div>
            <div class="modal-header">
                <div class='modal-title'>Certificate Upload</div>
            </div>
            <div class="modal-body">
                <template v-if='loading'>
                    <TablerLoading/>
                </template>
                <template v-else>
                    <TablerEnum label='Certificate Name' v-model='cert.name' :options='known'/>

                    <template v-if='cert.name === "Other"'>
                        <TablerInput label='Custom Name' class='my-3'/>
                    </template>

                    <UploadDefault
                        :url='url'
                        :headers='headers'
                        :cancel='false'
                        @done='$emit("done", $event)'
                        @cancel='$emit("cancel")'
                    />
                </template>
            </div>
    </TablerModal>
</template>

<script>
import {
    TablerModal,
    TablerInput,
    TablerEnum,
    TablerLoading
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
    data: function() {
        return {
            loading: true,
            custom: '',
            cert: {
                name: ''
            },
            known: []
        }
    },
    mounted: async function() {
        await this.getKnown();
    },
    methods: {
        getKnown: async function() {
            this.loading = true;
            const known = await window.std('/api/certs');
            this.known = known.certs.map((k) => k.name).concat(['Other']);
            this.loading = false;
        },
        close: function() {
            this.$emit('close');
        }
    },
    components: {
        TablerModal,
        TablerInput,
        TablerLoading,
        TablerEnum,
        UploadDefault
    }
}
</script>
