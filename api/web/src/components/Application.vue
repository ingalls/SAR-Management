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
                <NoAccess v-if='$route.params.applicationid && !is_iam("Application:View")' title='Application'/>
                <NoAccess v-else-if='!$route.params.applicationid && !is_iam("Application:Manage")' title='Application'/>
                <TablerLoading v-else-if='loading.application' desc='Loading Application'/>
                <TablerLoading v-else-if='loading.save' desc='Saving Application'/>
                <div v-else class="col-lg-12">
                    <div class="card">
                        <div class='card-header'>
                            <div class='row col-12'>
                                <div class='col-12 d-flex'>
                                    <div v-if='$route.params.applicationid'>
                                        <div class='card-title' v-text='`${application.name}`'></div>
                                        <div class='subheader' v-text='`${application.phone} - ${application.email}`'></div>
                                    </div>
                                    <div v-else>
                                        <div class='card-title'>New Application</div>
                                    </div>

                                    <div class='ms-auto btn-list'>
                                        <TablerEpoch :date='application.created'/>
                                        <SettingsIcon v-if='!edit' class='cursor-pointer' @click='$router.push(`/application/${$route.params.applicationid}/edit`)'/>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="card-body">
                            <div class='row'>
                                <TablerSchema :disabled='!edit' :schema='application.schema' v-model='application'/>

                                <template v-if='edit'>
                                    <div class='d-flex'>
                                        <TablerDelete v-if='is_iam("Application:Admin")' @delete='deleteApp'/>
                                        <div class='ms-auto'>
                                            <button @click='submit' class='btn btn-primary'>save</button>
                                        </div>
                                    </div>
                                </template>
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
    TablerDelete,
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
            edit: ["application-edit", "application-new"].includes(this.$route.name),
            loading: {
                save: false,
                application: true,
            },
            application: {
                name: '',
                schema: {},
                created: new Date()
            }
        }
    },
    mounted: async function() {
        if (this.$route.params.applicationid && this.is_iam("Application:View")) {
            await this.fetch();
        } else {
            this.application.schema = await this.getSchema();
            this.loading.application = false;
        }
    },
    methods: {
        is_iam: function(permission) { return iam(this.iam, this.auth, permission) },
        submit: async function() {
            this.loading.save = true;

            const body = JSON.parse(JSON.stringify(this.application));
            for (const prop of ['id', 'schema', 'created', 'updated']) delete body[prop];
            if (this.$route.params.applicationid) {
                this.application = await window.std(`/api/application/${this.$route.params.applicationid}`, {
                    method: 'PATCH', body
                });
            } else {
                this.application = await window.std(`/api/application`, {
                    method: 'POST', body
                });
            }

            this.$router.push(`/application/${this.application.id}`);
        },
        deleteApp: async function() {
            this.loading.application = true;
            await window.std(`/api/application/${this.$route.params.applicationid}`, {
                method: 'DELETE'
            });
            this.loading.application = false;
            this.$router.push('/application');
        },
        fetch: async function() {
            this.loading.application = true;
            this.application = await window.std(`/api/application/${this.$route.params.applicationid}`);
            this.loading.application = false;
        },
        getSchema: async function() {
            return JSON.parse((await window.std('/api/server/application')).value);
        },
    },
    components: {
        TablerEpoch,
        SettingsIcon,
        TablerBreadCrumb,
        TablerLoading,
        TablerDelete,
        TablerSchema,
        NoAccess
    }
}
</script>