<template>
    <TablerModal>
        <button type="button" class="btn-close" @click='$emit("close")' aria-label="Close"></button>
            <div class="modal-status bg-yellow"></div>
            <div class="modal-header">
                <div class='modal-title'>Certificate Upload</div>
            </div>
            <div class="modal-body">
                <template v-if='loading'>
                    <TablerLoading/>
                </template>
                <template v-else>
                    <TablerEnum label='Certificate Name' v-model='cert.name' :options='knownNames'/>

                    <template v-if='cert.name === "Other"'>
                        <TablerInput label='Custom Name' v-model='cert.custom' class='my-3'/>
                    </template>

                    <TablerInput
                        label='Expiration'
                        type='date'
                        v-model='cert.expiry'
                        class='my-3'
                        :disabled='noExpiry'
                    >
                        <TablerToggle v-model='noExpiry' label='No Expiry'/>
                    </TablerInput>

                    <template v-if='asset'>
                        <div class='d-flex justify-content-center mb-4'>
                            <CheckIcon width='48' height='48' />
                        </div>

                        <div class='d-flex justify-content-center'>
                            <div v-text='asset.name'></div>
                        </div>
                    </template>
                    <template v-else>
                        <UploadDefault
                            :url='url'
                            :headers='headers'
                            :cancel='false'
                            @done='asset = $event'
                            @cancel='$emit("cancel")'
                        />
                    </template>
                </template>
            </div>
            <div class='modal-footer d-flex'>
                <div class='ms-auto'>
                    <button @click='saveCert' :disabled='!asset' class='btn btn-primary'>Save Certificate</button>
                </div>
            </div>
    </TablerModal>
</template>

<script>
import {
    TablerModal,
    TablerInput,
    TablerToggle,
    TablerEnum,
    TablerLoading
} from '@tak-ps/vue-tabler';
import {
    CheckIcon
} from 'vue-tabler-icons';
import UploadDefault from './UploadDefault.vue';

export default {
    name: 'UploadCertificateModal',
    props: {
        uid: {
            type: Number
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
            noExpiry: false,
            url: window.stdurl('api/asset'),
            headers: {
                Authorization: `Bearer ${localStorage.token}`
            },
            asset: null,
            cert: {
                name: '',
                custom: '',
                expiry: '',
            },
            knownMap: new Map(),
            knownNames: []
        }
    },
    mounted: async function() {
        await this.getKnown();
    },
    methods: {
        getKnown: async function() {
            this.loading = true;
            const known = await window.std('/api/certs');
            this.knownNames = known.certs.map((k) => k.name).concat(['Other']);
            for (const cert of known.certs) {
                this.knownMap.set(known.name, known);
            }

            this.loading = false;
        },
        saveCert: async function() {
            const body = this.cert;
            if (this.noExpiry) delete body.expiry;
            body.asset = this.asset.id;

            if (body.name === "Other") {
                body.name = body.custom;
            } else {
                body.known
            }
            delete body.custom;

            await window.std(`/api/user/${this.uid}/cert`, {
                method: 'POST',
                body
            });

            this.$emit('close');
        },
    },
    components: {
        CheckIcon,
        TablerModal,
        TablerInput,
        TablerLoading,
        TablerToggle,
        TablerEnum,
        UploadDefault
    }
}
</script>
