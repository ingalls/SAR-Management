<template>
    <TablerModal>
        <button
            type='button'
            class='btn-close'
            aria-label='Close'
            @click='$emit("close")'
        />
        <div class='modal-status bg-yellow' />
        <div class='modal-header'>
            <div class='modal-title'>
                Certificate Upload
            </div>
        </div>
        <div class='modal-body'>
            <template v-if='loading'>
                <TablerLoading />
            </template>
            <template v-else>
                <TablerEnum
                    v-model='cert.name'
                    label='Certificate Name'
                    :options='knownNames'
                />

                <template v-if='cert.name === "Other"'>
                    <TablerInput
                        v-model='cert.custom'
                        label='Custom Name'
                        class='my-3'
                    />
                </template>

                <TablerInput
                    v-model='cert.expiry'
                    label='Expiration'
                    type='date'
                    class='my-3'
                    :disabled='noExpiry'
                >
                    <TablerToggle
                        v-model='noExpiry'
                        label='No Expiry'
                    />
                </TablerInput>

                <template v-if='asset'>
                    <div class='d-flex justify-content-center mb-4'>
                        <IconCheck
                            :size='48'
                            stroke='2'
                        />
                    </div>

                    <div class='d-flex justify-content-center'>
                        <div v-text='asset.name' />
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
                <button
                    :disabled='!asset'
                    class='btn btn-primary'
                    @click='saveCert'
                >
                    Save Certificate
                </button>
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
    IconCheck
} from '@tabler/icons-vue';
import UploadDefault from './UploadDefault.vue';

export default {
    name: 'UploadCertificateModal',
    components: {
        IconCheck,
        TablerModal,
        TablerInput,
        TablerLoading,
        TablerToggle,
        TablerEnum,
        UploadDefault
    },
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

            const url = await window.stdurl('/api/certs');
            url.searchParams.append('limit', String(100));
            const known = await window.std(url);
            this.knownNames = known.items.map((k) => k.name).concat(['Other']);
            for (const cert of known.items) {
                this.knownMap.set(cert.name, cert);
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
    }
}
</script>
