<template>
    <div>
        <div class='page-wrapper'>
            <div class='page-header d-print-none'>
                <div class='container-xl'>
                    <div class='row g-2 align-items-center'>
                        <div class='col d-flex'>
                            <TablerBreadCrumb />
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class='page-body'>
            <div class='container-xl'>
                <div class='row row-deck row-cards'>
                    <NoAccess
                        v-if='!is_iam("User:View")'
                        title='Certificate'
                    />
                    <template v-else>
                        <div class='col-md-12'>
                            <div class='card'>
                                <TablerLoading v-if='loading.cert' />
                                <template v-else>
                                    <div class='card-header d-flex align-items-center'>
                                        <h3
                                            class='card-title'
                                            v-text='cert.name'
                                        />

                                        <div class='ms-auto btn-list'>
                                            <IconDownload
                                                v-tooltip='"Download File"'
                                                class='cursor-pointer'
                                                :stroke='1'
                                                :size='32'
                                                @click='download'
                                            />
                                            <TablerDelete
                                                displaytype='icon'
                                                @delete='deleteCert'
                                            />
                                        </div>
                                    </div>
                                    <div class='card-body'>
                                        <div v-if='loading.cert'>
                                            <TablerLoading desc='Loading Preview' />
                                        </div>
                                        <img
                                            v-else-if='is_img'
                                            :src='preview'
                                        />
                                        <embed
                                            v-else-if='is_pdf'
                                            :src='preview'
                                            width='100%'
                                            height='1000px'
                                        >
                                        <div v-else>
                                            <div class='d-flex justify-content-center mt-4 mb-2'>
                                                <IconEyeOff
                                                    :size='48'
                                                    :stroke='1'
                                                />
                                            </div>

                                            <div class='text-center mb-4 mt-2'>
                                                <div>Unsupported Preview Format</div>
                                            </div>
                                        </div>
                                    </div>
                                </template>
                            </div>
                        </div>
                    </template>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import iam from '../iam.js';
import NoAccess from './util/NoAccess.vue';
import DocFile from './Docs/File.vue';
import {
    IconEyeOff,
    IconDownload
} from '@tabler/icons-vue';
import {
    TablerBreadCrumb,
    TablerDelete,
    TablerLoading,
} from '@tak-ps/vue-tabler'
import Avatar from './util/Avatar.vue';

export default {
    name: 'Certificate',
    components: {
        Avatar,
        NoAccess,
        DocFile,
        IconEyeOff,
        IconDownload,
        TablerDelete,
        TablerLoading,
        TablerBreadCrumb,
    },
    props: {
        iam: {
            type: Object,
            required: true
        },
        auth: {
            type: Object,
            required: true
        }
    },
    data: function() {
        return {
            cert: {
                id: '',
            },
            asset: null,
            loading: {
                cert: true,
            },
        }
    },
    computed: {
        is_img: function() {
            return this.asset.name.toLowerCase().endsWith('.jpg')
                || this.asset.name.toLowerCase().endsWith('.jpeg')
                || this.asset.name.toLowerCase().endsWith('.png')
        },
        is_pdf: function() {
            return this.asset.name.endsWith('.pdf')
        },
        preview: function() {
            const url = window.stdurl(`/api/asset/${this.cert.asset}/raw`);
            url.searchParams.append('token', localStorage.token);
            return url;
        },
    },
    mounted: async function() {
        if (this.is_iam("User:View")) {
            await this.fetch();
        }
    },
    methods: {
        is_iam: function(permission) { return iam(this.iam, this.auth, permission) },
        deleteCert: async function() {
            this.loading.cert = true;

            await window.std(`/api/user/${this.$route.params.userid}/cert/${this.$route.params.certid}`, {
                method: 'DELETE'
            });

            this.$router.push(`/user/${this.$route.params.userid}/cert/`);
        },
        url: function(download = true) {
            const url = window.stdurl(`/api/asset/${this.cert.asset}/raw`);
            url.searchParams.append('download', download);
            url.searchParams.append('token', localStorage.token);
            return String(url);
        },
        download: function() {
            window.open(this.url(true), '_blank');
        },
        fetch: async function() {
            this.loading.cert = true;
            this.cert = await window.std(`/api/user/${this.$route.params.userid}/cert/${this.$route.params.certid}`);
            this.asset = await window.std(`/api/asset/${this.cert.asset}`);
            this.loading.cert = false;
        },
    }
}
</script>
