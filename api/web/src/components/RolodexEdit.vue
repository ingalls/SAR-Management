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
                        v-if='!is_iam("Rolodex:Manage")'
                        title='New Rolodex'
                    />
                    <TablerLoading v-if='loading.rolodex' />
                    <template v-else>
                        <div class='col-lg-12'>
                            <div class='card'>
                                <div class='card-header'>
                                    <h3 v-if='$route.name === "rolodex-new"' class='card-title'>New Rolodex Item</h3>
                                    <h3 v-else class='card-title' v-text='rolodex.name'/>

                                    <div class='ms-auto btn-list'>
                                        <TablerIconButton
                                            v-if='$route.params.rolodexid && is_iam("Rolodex:Manage")'
                                            :icon='IconPencil'
                                            :title="'Edit ' + rolodex.name"
                                            @click='$router.push(`/rolodex/${rolodex.id}/edit`)'
                                        >
                                            <IconPencil
                                                :size='32'
                                                stroke='1'
                                            />
                                        </TablerIconButton>
                                    </div>
                                </div>
                                <div v-if='$route.name === "rolodex-edit" || $route.name === "rolodex-new"' class='card-body'>
                                    <div class='row row-cards'>
                                        <div class='col-md-12'>
                                            <TablerInput
                                                v-model='rolodex.name'
                                                :error='errors.name'
                                                :required='true'
                                                label='Name'
                                                description='A Human Readable name for the Rolodex Item'
                                            />
                                        </div>
                                        <div class='col-md-12'>
                                            <TablerInput
                                                v-model='rolodex.remarks'
                                                :rows='Math.max(2, rolodex.remarks.split("\n").length)'
                                                :required='false'
                                                label='Remarks'
                                                description='A Human Readable remarks for the rolodex'
                                            />
                                        </div>
                                        <div class='col-md-12'>
                                            <TablerInput
                                                v-model='rolodex.phone'
                                                :required='false'
                                                label='Phone Number'
                                                description='An associated phone number if applicable'
                                            />
                                        </div>
                                        <div class='col-md-12'>
                                            <TablerInput
                                                v-model='rolodex.email'
                                                :required='false'
                                                label='Email'
                                                description='An associated email if applicable'
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div v-else class='card-body'>
                                    <div class='datagrid'>
                                        <div class='datagrid-item'>
                                            <div class='datagrid-title'>
                                                Remarks
                                            </div>
                                            <div
                                                class='datagrid-content'
                                                v-text='rolodex.remarks'
                                            />
                                        </div>
                                        <div
                                            v-if='rolodex.email'
                                            class='datagrid-item'
                                        >
                                            <div class='datagrid-title'>
                                                Email
                                            </div>
                                            <div class='datagrid-content'>
                                                <a
                                                    :href='`mailto:${rolodex.email}`'
                                                    v-text='rolodex.email'
                                                />
                                            </div>
                                        </div>
                                        <div
                                            v-if='rolodex.phone'
                                            class='datagrid-item'
                                        >
                                            <div class='datagrid-title'>
                                                Phone
                                            </div>
                                            <div class='datagrid-content'>
                                                <a
                                                    :href='`tel:${rolodex.phone}`'
                                                    v-text='rolodex.phone'
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div v-if='$route.name === "rolodex-edit" || $route.name === "rolodex-new"' class='col-12 py-1 pb-4 px-4'>
                                    <div class='d-flex'>
                                        <a
                                            v-if='$route.params.scheduleid && is_iam("Rolodex:Admin")'
                                            class='cursor-pointer btn btn-danger'
                                            @click='deleteRolodex'
                                        >
                                            Delete Item
                                        </a>
                                        <div class='ms-auto'>
                                            <a
                                                v-if='$route.params.rolodexid'
                                                class='cursor-pointer btn btn-primary'
                                                @click='update'
                                            >
                                                Update Item
                                            </a>
                                            <a
                                                v-else
                                                class='cursor-pointer btn btn-primary'
                                                @click='create'
                                            >
                                                Create Item
                                            </a>
                                        </div>
                                    </div>
                                </div>
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
import UserPresentSelect from './util/UserPresentSelect.vue';
import {
    IconPencil
} from '@tabler/icons-vue';
import {
    TablerBreadCrumb,
    TablerIconButton,
    TablerInput,
    TablerLoading
} from '@tak-ps/vue-tabler';

export default {
    name: 'RolodexEdit',
    components: {
        TablerInput,
        UserPresentSelect,
        TablerLoading,
        TablerBreadCrumb,
        IconPencil,
        TablerIconButton,
        NoAccess
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
            loading: {
                rolodex: true
            },
            errors: {
                name: '',
            },
            rolodex: {
                name: '',
                remarks: '',
                body: '',
                phone: '',
                email: ''
            },
        }
    },
    mounted: async function() {
        if (this.$route.params.rolodexid && this.is_iam('Rolodex:Manage')) {
            await this.fetch();
        } else {
            this.loading.rolodex = false;
        }
    },
    methods: {
        is_iam: function(permission) { return iam(this.iam, this.auth, permission) },
        deleteRolodex: async function() {
            this.loading = true;
            await window.std(`/api/rolodex/${this.$route.params.rolodexid}`, {
                method: 'DELETE',
            });

            this.loading = false;
            this.$router.push('/rolodex');
        },
        validate: function() {
            for (const field of ['name']) {
                if (!this.rolodex[field]) this.errors[field] = 'Cannot be empty';
                else this.errors[field] = '';
            }

            for (const e in this.errors) {
                if (this.errors[e]) return;
            }

            return true;
        },
        update: async function() {
            if (!this.validate()) return;

            this.loading = true;
            const update = await window.std(`/api/rolodex/${this.$route.params.rolodexid}`, {
                method: 'PATCH',
                body: this.rolodex
            });

            this.loading = false;
            this.$router.push(`/rolodex/${this.rolodex.id}`);
        },
        create: async function() {
            if (!this.validate()) return;

            this.loading = true;
            const create = await window.std('/api/rolodex', {
                method: 'POST',
                body: {
                    ...this.rolodex,
                }
            });

            this.loading = false;
            this.$router.push(`/rolodex/${create.id}`);
        },
        fetch: async function() {
            this.loading.rolodex = true;
            this.rolodex = await window.std(`/api/rolodex/${this.$route.params.rolodexid}`);
            this.loading.rolodex = false;
        },
    }
}
</script>
