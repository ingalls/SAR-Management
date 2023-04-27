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
                <div class="col-lg-12">
                    <NoAccess v-if='!is_iam("Equipment:Admin")' title='Equipment Type Editing'/>
                    <div v-else class="card">
                        <TablerLoading v-if='loading.type'/>
                        <div v-else class="card-body">
                            <div class='row row-cards'>
                                <div class="col-md-12">
                                    <TablerInput v-model='type.type' label='Equipment Type' :error='errors.type'/>

                                    <TablerInput v-model='type.schema' :rows='10' label='Equipment Schema' :error='errors.schema'/>
                                </div>

                                <div class="col-md-12">
                                    <div class='d-flex'>
                                        <div class='ms-auto'>
                                            <a @click='save' class="cursor-pointer btn btn-primary">
                                                <span v-text='$route.params.typeid ? "Update Type" : "Create Type"'/>
                                            </a>
                                        </div>
                                    </div>
                                </div>
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
import {
    TablerBreadCrumb,
    TablerLoading,
    TablerInput
} from '@tak-ps/vue-tabler'
import NoAccess from './util/NoAccess.vue';
import iam from '../iam.js';

export default {
    name: 'EquipmentTypeEdit',
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
                type: false,
            },
            errors: {
                type: '',
                schema: ''
            },
            type: {
                type: '',
                schema: ''
            }
        }
    },
    mounted: async function() {
        if (this.is_iam("Equipment:Manage") && this.$route.params.typeid) {
            await this.fetch();
        }
    },
    methods: {
        is_iam: function(permission) { return iam(this.iam, this.auth, permission) },
        fetch: async function() {
            this.loading.type = true;
            const type = await window.std(`/api/equipment-type/${this.$route.params.typeid}`);
            type.schema = JSON.stringify(type.schema, null, 4);
            this.type = type;
            this.loading.type = false;
        },
        save: async function() {
            for (const field of ['type', 'schema']) {
                if (!this.type[field]) this.errors[field] = 'Cannot be empty';
                else this.errors[field] = false;
            }

            try {
                JSON.parse(this.type.schema);
                this.errors.schema = '';
            } catch (err) {
                this.errors.schema = `Invalid JSON: ${err.message}`;
            }

            for (const e in this.errors) {
                if (this.errors[e]) return;
            }

            this.loading.type = true;

            if (this.$route.params.typeid) {
                await window.std(`/api/equipment-type/${this.$route.params.typeid}`, {
                    method: 'PATCH',
                    body: {
                        type: this.type.type,
                        schema: JSON.parse(this.type.schema)
                    }
                })

                this.loading.type = false;
                this.$router.push(`/equipment/type/${this.$route.params.typeid}`);
            } else {
                const type = await window.std('/api/equipment-type', {
                    method: 'POST',
                    body: {
                        type: this.type.type,
                        schema: JSON.parse(this.type.schema)
                    }
                })

                this.loading.type = false;
                this.$router.push(`/equipment/type/${type.id}`);
            }
        }
    },
    components: {
        NoAccess,
        TablerBreadCrumb,
        TablerInput,
        TablerLoading
    }
}
</script>
