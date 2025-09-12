<template>
    <div class='mb-3'>
        <div class='row'>
            <div class='d-flex align-items-center mb-3'>
                <div
                    class='subheader'
                    v-text='label'
                />

                <div
                    v-if='!disabled'
                    class='ms-auto'
                >
                    <TablerDropdown>
                        <template #default>
                            <IconPlus
                                v-tooltip='"Add Certificate"'
                                :size='16'
                                :stroke='1'
                            />
                        </template>
                        <template #dropdown>
                            <div class='card'>
                                <div class='card-body'>
                                    <TablerInput
                                        v-model='filter'
                                        icon='search'
                                        placeholder='Filter Certificates'
                                    />

                                    <TablerNone
                                        v-if='list.items.length === 0'
                                        label='Certificates'
                                        :create='false'
                                    />
                                    <template v-else >
                                        <div
                                            v-for='cert in list.items'
                                            :key='cert.id'
                                            class='py-2 px-2 rounded cursor-pointer hover-light'
                                            @click='push_certs(cert)'
                                        >
                                            <CertBadge :cert='cert' />
                                        </div>
                                    </template>
                                </div>
                            </div>
                        </template>
                    </TablerDropdown>
                </div>
            </div>

            <template v-if='!certs.length'>
                <TablerNone
                    label='Certificates Required'
                    :create='false'
                    :compact='true'
                />
            </template>
            <template v-else>
                <div
                    v-for='(cert, cert_idx) in certs'
                    :key='cert.id'
                    class='d-flex align-items-center my-1'
                >
                    <CertBadge :cert='cert' />
                    <div class='ms-auto'>
                        <TablerIconButton
                            title='Remove Certificate'
                            @click='delete_certs(cert_idx, cert)'
                        >
                            <IconTrash
                                size='16'
                                stroke='1'
                            />
                        </TablerIconButton>
                    </div>
                </div>
            </template>
        </div>
    </div>
</template>

<script>
import CertBadge from './CertBadge.vue';
import {
    IconPlus,
    IconTrash
} from '@tabler/icons-vue';
import {
    TablerDropdown,
    TablerIconButton,
    TablerNone,
    TablerInput
} from '@tak-ps/vue-tabler'

export default {
    name: 'CertSelect',
    components: {
        TablerDropdown,
        TablerIconButton,
        TablerNone,
        CertBadge,
        IconPlus,
        IconTrash,
        TablerInput
    },
    props: {
        modelValue: {
            type: Array,
            required: true
        },
        label: {
            type: String,
            default: 'Certificates'
        },
        limit: {
            type: Number,
            default: 10
        },
        disabled: {
            type: Boolean,
            default: false
        }
    },
    data: function() {
        return {
            filter: '',
            list: {
                items: []
            },
            certs: []
        }
    },
    watch: {
        modelValue: function() {
            this.certs = this.modelValue;
        },
        filter: async function() {
            await this.listCerts();
        },
        certs: function() {
            this.$emit('update:modelValue', this.certs);
        }
    },
    mounted: async function() {
        this.certs = this.modelValue;
        await this.listCerts();
    },
    methods: {
        push_certs: async function(cert) {
            this.certs.push(cert);
            this.$emit('push', cert);
            await this.listCerts();
        },
        delete_certs: async function(idx, cert) {
            this.certs.splice(idx, 1);
            this.$emit('delete', cert);
            await this.listCerts();
        },
        listCerts: async function() {
            const url = window.stdurl('/api/certs');
            url.searchParams.append('filter', this.filter);
            url.searchParams.append('limit', this.limit + this.certs.length);

            const list = await window.std(url);

            const ids = this.certs.map((cert) => cert.id);

            this.list.items = list.items.filter((cert) => {
                return !ids.includes(cert.id);
            }).splice(0, this.limit);
        }
    }
}
</script>