<template>
<div>
    <div class='page-wrapper'>
        <div class="page-header d-print-none">
            <div class="container-xl">
                <div class="row g-2 align-items-center">
                    <div class="col d-flex">
                        <TablerBreadCrumb/>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class='page-body'>
        <div class='container-xl'>
            <div class='row row-deck row-cards'>
                <NoAccess v-if='!is_iam("Application:View")' title='Application'/>
                <TablerLoading v-else-if='loading.application'/>
                <div v-else class="col-lg-12">
                    <div class="card">
                        <div class='card-header'>
                            <div class='row col-12'>
                                <div class='col-12 d-flex'>
                                    <div>
                                        <div class='card-title' v-text='`${application.name}`'></div>
                                        <div class='subheader' v-text='`${application.phone} - ${application.email}`'></div>
                                    </div>

                                    <div class='ms-auto btn-list'>
                                        <TablerEpoch :date='application.created'/>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="card-body">
                            <div class='row row-cards'>
                                <TablerSchema :disabled='true' :schema='application.schema' v-model='application'/>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
</template>

<script>
import iam from '../iam.js';
import NoAccess from './util/NoAccess.vue';
import {
    TablerEpoch,
    TablerBreadCrumb,
    TablerSchema,
    TablerLoading
} from '@tak-ps/vue-tabler';
import {
    SettingsIcon
} from 'vue-tabler-icons';

export default {
    name: 'Application',
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
            loading: {
                application: true,
            },
            application: {
                name: '',
            }
        }
    },
    mounted: async function() {
        console.error('HERE', this.is_iam('Application:View'));
        if (this.is_iam("Application:View")) {
            await this.fetch();
        }
    },
    methods: {
        is_iam: function(permission) { return iam(this.iam, this.auth, permission) },
        fetch: async function() {
            this.loading.application = true;
            this.application = await window.std(`/api/application/${this.$route.params.applicationid}`);
            this.loading.application = false;
        },
    },
    components: {
        TablerEpoch,
        SettingsIcon,
        TablerBreadCrumb,
        TablerLoading,
        TablerSchema,
        NoAccess
    }
}
</script>
