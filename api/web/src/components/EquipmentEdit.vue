<template>
<div>
    <div class='page-wrapper'>
        <div class="page-header d-print-none">
            <div class="container-xl">
                <div class="row g-2 align-items-center">
                    <div class="col d-flex">
                        <ol class="breadcrumb" aria-label="breadcrumbs">
                            <li class="breadcrumb-item"><a @click='$router.push("/")' class="cursor-pointer">Home</a></li>
                            <li class="breadcrumb-item" aria-current="page"><a  @click='$router.push("/equipment")' class="cursor-pointer">Equipment</a></li>
                            <li v-if='$route.params.equipid' class="breadcrumb-item" aria-current="page"><a  @click='$router.push(`/equipment/${$route.params.equipid}`)' class="cursor-pointer" v-text='$route.params.equipid'></a></li>
                            <li class="breadcrumb-item active" aria-current="page"><a href="#" v-text='$route.params.equipid ? "Edit" : "New"'></a></li>
                        </ol>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class='page-body'>
        <div class='container-xl'>
            <div class='row row-deck row-cards'>
                <div class="col-lg-12">
                    <NoAccess v-if='!is_iam("Equipment:Manage")' title='Equipment Editing'/>
                    <div v-else class="card">
                        <TablerLoading v-if='loading.equipment'/>
                        <div v-else class="card-body">
                            <div class='row row-cards'>
                                <div class="col-md-12">
                                    <TablerInput v-model='equipment.name' label='Equipment Name'/>

                                    <TablerInput v-model='equipment.description' rows='5' label='Equipment Description'/>
                                </div>

                                <div class="col-md-12">
                                    <div class='d-flex'>
                                        <div class='ms-auto'>
                                            <a @click='save' class="cursor-pointer btn btn-primary">
                                                <span v-text='$route.params.equipid ? "Update Equipment" : "Create Equipment"'/>
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

    <PageFooter/>
</div>
</template>

<script>
import {
    TablerLoading,
    TablerInput
} from '@tak-ps/vue-tabler'
import PageFooter from './PageFooter.vue';
import NoAccess from './util/NoAccess.vue';
import iam from '../iam.js';

export default {
    name: 'EquipmentEdit',
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
                equipment: false,
            },
            equipment: {
                name: '',
                description: ''
            }
        }
    },
    mounted: async function() {
        if (this.is_iam("Equipment:Manage") && this.$route.params.equipid) {
            await this.fetch();
        }
    },
    methods: {
        is_iam: function(permission) { return iam(this.iam, this.auth, permission) },
        fetch: async function() {
            this.loading.equipment = true;
            this.equipment = await window.std(`/api/equipment/${this.$route.params.equipid}`);
            this.loading.equipment = false;
        },
        save: async function() {
            this.loading.equipment = true;

            if (this.$route.params.equipid) {
                await window.std(`/api/equipment/${this.$route.params.equipid}`, {
                    method: 'PATCH',
                    body: this.equipment
                })
            } else {
                await window.std('/api/equipment', {
                    method: 'POST',
                    body: this.equipment
                })
            }

            this.loading.equipment = false;
            this.$router.push(`/equipment/${this.$route.params.equipid}`);
        }
    },
    components: {
        NoAccess,
        PageFooter,
        TablerInput,
        TablerLoading
    }
}
</script>
