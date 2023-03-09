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
                    <Alert v-if='equipment.archived' label='Cannot Edit Archived Equipment'/>
                    <div v-else class="card">
                        <TablerLoading v-if='loading.equipment'/>
                        <template v-else>
                            <div class='card-header'>
                                <div class='card-title'>Equipment Editor</div>
                            </div>
                            <div class="card-body">
                                <div class='row row-cards'>
                                    <div class="col-md-8">
                                        <TablerInput v-model='equipment.name' label='Equipment Name'/>
                                    </div>
                                    <div class="col-md-4">
                                        <TablerList
                                            key='type'
                                            :initial='type'
                                            label='Equipment Type'
                                            url='/api/equipment-type'
                                            @selected='equipment.type_id = $event.id'
                                            listkey='types'
                                            namekey='type'
                                        />
                                    </div>
                                    <div class="col-md-12">
                                        <TablerInput v-model='equipment.description' :rows='5' label='Equipment Description'/>
                                    </div>
                                    <div class="col-md-6">
                                        <label class='form-label'>Equipment Heiarchy</label>
                                        <div class='row border rounded px-2 py-2' style='margin-left: 0px; margin-right: 0px;'>
                                            <TablerToggle v-model='equipment.container' label='Equipment Container?'/>

                                            <TablerList
                                                key='parent'
                                                :initial='parent'
                                                label='Parent Container'
                                                url='/api/equipment?container=true'
                                                @selected='equipment.parent = $event.id'
                                                listkey='equipment'
                                                namekey='name'
                                            />
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <label class='form-label'>Assigned Equipment</label>
                                        <div class='row border rounded px-2 py-2' style='margin-left: 0px; margin-right: 0px;'>
                                            <UserSelect
                                                v-model='assigned'
                                                label=''
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-12">
                                <EquipmentMeta v-model='equipment.meta' :schema='type.schema'/>
                            </div>

                            <div class="card-body col-md-12">
                                <div class='d-flex'>
                                    <a v-if='$route.params.equipid' @click='archive' class="cursor-pointer btn btn-danger">
                                        Archive Equipment
                                    </a>

                                    <div class='ms-auto'>
                                        <a @click='save' class="cursor-pointer btn btn-primary">
                                            <span v-text='$route.params.equipid ? "Update Equipment" : "Create Equipment"'/>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </template>
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
    TablerToggle,
    TablerInput,
    TablerList
} from '@tak-ps/vue-tabler'
import UserSelect from './util/UserSelect.vue';
import PageFooter from './PageFooter.vue';
import NoAccess from './util/NoAccess.vue';
import Alert from './util/Alert.vue';
import EquipmentMeta from './util/EquipmentMeta.vue';
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
                equipment: true,
            },
            type: {
                schema: {}
            },
            parent: {},
            assigned: [],
            equipment: {
                name: '',
                description: '',
                container: false,
                parent: null,
                type: null,
                meta: {}
            }
        }
    },
    mounted: async function() {
        if (this.is_iam("Equipment:Manage") && this.$route.params.equipid) {
            await this.fetch();
        } else if (!this.$route.params.equipid) {
            const url = new URL(window.location);
            if (url.searchParams.has('parent')) {
                this.parent = await window.std(`/api/equipment/${url.searchParams.get('parent')}`);
                this.equipment.parent = this.parent.id;
            }

            this.loading.equipment = false;
        }
    },
    watch: {
        'equipment.type_id': async function() {
            this.type = await window.std(`/api/equipment-type/${this.equipment.type_id}`);
        }
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
        archive: async function() {
            this.loading.equipment = true;

            await window.std(`/api/equipment/${this.$route.params.equipid}`, {
                method: 'PATCH',
                body: {
                    archived: true
                }
            })

            this.loading.equipment = false;
            this.$router.push(`/equipment/${this.$route.params.equipid}`);
        },
        save: async function() {
            this.loading.equipment = true;

            if (this.$route.params.equipid) {
                await window.std(`/api/equipment/${this.$route.params.equipid}`, {
                    method: 'PATCH',
                    body: {
                        ...this.equipment,
                        assigned: this.assigned.map((a) => { return a.uid || a.id })
                    }
                })

                this.loading.equipment = false;
                this.$router.push(`/equipment/${this.$route.params.equipid}`);
            } else {
                const equip = await window.std('/api/equipment', {
                    method: 'POST',
                    body: {
                        ...this.equipment,
                        assigned: this.assigned.map((a) => { return a.uid || a.id })
                    }
                })

                this.loading.equipment = false;
                this.$router.push(`/equipment/${equip.id}`);
            }
        }
    },
    components: {
        Alert,
        NoAccess,
        UserSelect,
        PageFooter,
        TablerList,
        TablerInput,
        TablerToggle,
        TablerLoading,
        EquipmentMeta
    }
}
</script>
