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
                <NoAccess v-if='!is_iam("Equipment:View")' title='Equipment'/>
                <TablerLoading v-else-if='loading.equipment'/>
                <template v-else>
                    <div class="col-lg-12">
                        <div class="card">
                            <div class='card-header'>
                                <h3 class='card-title' v-text='equipment.name'/>
                                <div class='ms-auto btn-list align-items-center'>
                                    <span v-if='equipment.container' class="badge bg-blue text-white" style="height: 20px;">Container</span>
                                    <span v-if='equipment.archived' class="badge bg-red text-white" style="height: 20px;">Archived</span>

                                    <IconSettings v-if='is_iam("Equipment:Manage") && !equipment.archived' @click='$router.push(`/equipment/${$route.params.equipid}/edit`)' class='cursor-pointer' :stroke='1' :size='32'/>
                                </div>
                            </div>
                            <div class='row row-0'>
                                <div class='col-12 col-md-9'>
                                    <div class='card-body'>
                                        <div class="col-md-12 pb-4" v-text='equipment.description'></div>
                                        <div class="col-md-8">
                                            <div class="datagrid">
                                                <div v-if='parent.id' class="datagrid-item">
                                                    <div class="datagrid-title">Parent Container</div>
                                                    <div class="datagrid-content">
                                                        <a @click='$router.push(`/equipment/${parent.id}`)' class='cursor-pointer' v-text='parent.name'></a>
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
                                                    <div class="datagrid-title">Quantity</div>
                                                    <div class="datagrid-content">
                                                        <span v-text='equipment.quantity'/>
                                                    </div>
                                                </div>
                                                <div class="datagrid-item">
                                                    <div class="datagrid-title">Item Value</div>
                                                    <div class="datagrid-content">
                                                        <span v-if='equipment.value' v-text='equipment.value'/>
                                                        <span v-else>Unknown</span>
                                                    </div>
                                                </div>
                                                <div v-if='equipment.assigned.length' class="datagrid-item">
                                                    <div class="datagrid-title">Assigned</div>
                                                    <div class="datagrid-content">
                                                        <Avatar :key='a.uid' v-for='a in equipment.assigned' :user='a' class='my-1' :link='true'/>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class='col-12 col-md-3'>
                                    <EquipmentProfile :equipmentid='equipment.id'/>
                                </div>
                            </div>
                            <div v-if='type.schema && type.schema.properties' class="col-md-12">
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
</div>
</template>

<script>
import NoAccess from './util/NoAccess.vue';
import iam from '../iam.js';
import {
    TablerLoading,
    TablerBreadCrumb
} from '@tak-ps/vue-tabler';
import {
    IconSettings
} from '@tabler/icons-vue';
import CardEquipment from './cards/Equipment.vue';
import EquipmentMeta from './util/EquipmentMeta.vue';
import EquipmentProfile from './Equipment/Profile.vue';
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

            this.loading.equipment = false;
        },
    },
    components: {
        NoAccess,
        Avatar,
        IconSettings,
        CardEquipment,
        TablerLoading,
        EquipmentMeta,
        EquipmentProfile,
        TablerBreadCrumb
    }
}
</script>
