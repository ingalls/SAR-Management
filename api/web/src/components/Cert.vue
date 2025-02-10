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

                                        <div class='ms-auto'>
                                            <TablerDelete
                                                displaytype='icon'
                                                @delete='deleteCert'
                                            />
                                        </div>
                                    </div>
                                    <div class='card-body' />
                                    <div class='card-footer' />
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
            loading: {
                cert: true,
            },
        }
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
        fetch: async function() {
            this.loading.cert = true;
            this.cert = await window.std(`/api/user/${this.$route.params.userid}/cert/${this.$route.params.certid}`);
            this.loading.cert = false;
        },
    }
}
</script>
