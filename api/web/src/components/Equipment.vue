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
                            <li class="breadcrumb-item active" aria-current="page"><a href="#" v-text='$route.params.equipid'></a></li>
                        </ol>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class='page-body'>
        <div class='container-xl'>
            <div class='row row-deck row-cards'>
                <NoAccess v-if='!is_iam("Equipment:View")' title='Equipment'/>
                <TablerLoading v-else-if='loading.equipment'/>
                <template v-else>
                    <div class="col-lg-12">
                        <div class="card">
                            <div class='card-header'>
                                <h3 class='card-title' v-text='equipment.name'/>
                                <div class='ms-auto'>
                                    <div class='btn-list'>
                                        <span v-if='equipment.container' class="badge bg-blue">Container</span>
                                        <span v-if='equipment.archived' class="badge bg-red">Archived</span>

                                        <SettingsIcon v-if='is_iam("Equipment:Manage") && !equipment.archived' @click='$router.push(`/equipment/${$route.params.equipid}/edit`)' class='cursor-pointer'/>
                                    </div>
                                </div>
                            </div>
                            <div class="card-body">
                                <div class='row row-cards'>
                                    <div class="col-md-8" v-text='equipment.description'></div>
                                    <div class="col-md-4">
                                        <div class="datagrid">
                                            <div class="datagrid-item">
                                                <div class="datagrid-title">Parent Container</div>
                                                <div class="datagrid-content">
                                                    <a v-if='parent.id' @click='$router.push(`/equipment/${parent.id}`)' class='cursor-pointer' v-text='parent.name'></a>
                                                    <span v-else>None</span>
                                                </div>
                                            </div>
                                            <div class="datagrid-item">
                                                <div class="datagrid-title">Equipment Type</div>
                                                <div class="datagrid-content">
                                                    <a v-if='type.id' @click='$router.push(`/equipment/type/${type.id}`)' class='cursor-pointer' v-text='type.type'></a>
                                                    <span v-else>None</span>
                                                </div>
                                            </div>
                                            <div class="datagrid-item">
                                                <div class="datagrid-title">Assigned</div>
                                                <div class="datagrid-content">
                                                    <template v-if='assigned.length'>
                                                        <Avatar :key='a.uid' v-for='a in assigned' :user='a' class='my-1'/>
                                                    </template>
                                                    <span v-else>None</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div v-if='type.schema' class="col-md-12">
                                <EquipmentMeta v-model='equipment.meta' :disabled='true' :schema='type.schema'/>
                            </div>
                        </div>
                    </div>
                    <div v-if='equipment.container' class="col-lg-12">
                        <CardEquipment :create='is_iam("Equipment:Manage")' label='Contained Equipment' :parent='equipment.id'/>
                    </div>
                </template>
            </div>
        </div>
    </div>

    <PageFooter/>
</div>
</template>

<script>
import NoAccess from './util/NoAccess.vue';
import iam from '../iam.js';
import PageFooter from './PageFooter.vue';
import {
    TablerLoading
} from '@tak-ps/vue-tabler';
import {
    SettingsIcon
} from 'vue-tabler-icons';
import CardEquipment from './cards/Equipment.vue';
import EquipmentMeta from './util/EquipmentMeta.vue';
import Avatar from './util/Avatar.vue';

export default {
    name: 'Equipment',
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
                equipment: true
            },
            type: {},
            parent: {},
            assigned: [],
            equipment: {},
        }
    },
    mounted: async function() {
        if (this.is_iam("Equipment:View")) await this.fetch();
    },
    methods: {
        is_iam: function(permission) { return iam(this.iam, this.auth, permission) },
        fetch: async function() {
            this.loading.equipment = true;
            this.equipment = await window.std(`/api/equipment/${this.$route.params.equipid}`);

            if (this.equipment.type_id) {
                this.type = await window.std(`/api/equipment-type/${this.equipment.type_id}`);
            }
            if (this.equipment.parent) {
                this.parent = await window.std(`/api/equipment/${this.equipment.parent}`);
            }

            this.assigned = (await window.std(`/api/equipment/${this.equipment.id}/assigned`)).assigned;

            this.loading.equipment = false;
        },
    },
    components: {
        NoAccess,
        Avatar,
        PageFooter,
        SettingsIcon,
        CardEquipment,
        TablerLoading,
        EquipmentMeta
    }
}
</script>
