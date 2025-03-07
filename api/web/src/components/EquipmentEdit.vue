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
                    <div class='col-lg-12'>
                        <NoAccess
                            v-if='!is_iam("Equipment:Manage")'
                            title='Equipment Editing'
                        />
                        <Alert
                            v-if='equipment.archived'
                            label='Cannot Edit Archived Equipment'
                        />
                        <div
                            v-else
                            class='card'
                        >
                            <TablerLoading v-if='loading.equipment' />
                            <template v-else>
                                <div class='card-header'>
                                    <div class='card-title'>
                                        Equipment Editor
                                    </div>
                                </div>

                                <div class='row row-0'>
                                    <div
                                        class='col-12'
                                        :class='{
                                            "col-md-9": $route.params.equipid
                                        }'
                                    >
                                        <div class='card-body'>
                                            <div class='row row-cards'>
                                                <div class='col-md-8 pb-2'>
                                                    <TablerInput
                                                        v-model='equipment.name'
                                                        label='Equipment Name'
                                                    />
                                                </div>
                                                <div class='col-md-4 pb-2'>
                                                    <TablerList
                                                        key='type'
                                                        :initial='type'
                                                        label='Equipment Type'
                                                        url='/api/equipment-type'
                                                        listkey='items'
                                                        namekey='type'
                                                        @selected='equipment.type_id = $event.id'
                                                    />
                                                </div>
                                                <div class='col-md-12 pb-2'>
                                                    <TablerInput
                                                        v-model='equipment.description'
                                                        :rows='5'
                                                        label='Equipment Description'
                                                    />
                                                </div>
                                                <div class='col-md-6 pb-2'>
                                                    <TablerInput
                                                        v-model='equipment.quantity'
                                                        label='Quantity'
                                                    />
                                                </div>
                                                <div class='col-md-6 pb-2'>
                                                    <TablerInput
                                                        v-model='equipment.value'
                                                        label='Per Item Value ($)'
                                                    />
                                                </div>
                                                <div class='col-md-6 pb-2'>
                                                    <label class='form-label'>Equipment Heiarchy</label>
                                                    <div
                                                        class='row border rounded px-2 py-2'
                                                        style='margin-left: 0px; margin-right: 0px;'
                                                    >
                                                        <TablerToggle
                                                            v-model='equipment.container'
                                                            label='Equipment Container?'
                                                        />

                                                        <TablerList
                                                            key='parent'
                                                            :initial='parent'
                                                            label='Parent Container'
                                                            url='/api/equipment?container=true'
                                                            listkey='equipment'
                                                            namekey='name'
                                                            @selected='equipment.parent = $event.id'
                                                        />
                                                    </div>
                                                </div>
                                                <div class='col-md-6 pb-2'>
                                                    <label class='form-label'>Assigned Equipment</label>
                                                    <div
                                                        class='row border rounded px-2 py-2'
                                                        style='margin-left: 0px; margin-right: 0px;'
                                                    >
                                                        <UserSelect
                                                            v-model='assigned'
                                                            label=''
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div
                                        v-if='$route.params.equipid'
                                        class='col-12 col-md-3'
                                    >
                                        <EquipmentProfile
                                            bgstyle='cover'
                                            :equipmentid='equipment.id'
                                            :cache='cache'
                                        />

                                        <div class='card-body d-flex justify-content-center'>
                                            <a
                                                class='cursor-pointer btn btn-secondary'
                                                @click='upload = true'
                                            >Update Photo</a>
                                        </div>
                                    </div>
                                </div>
                                <div
                                    v-if='type.schema.properties'
                                    class='col-md-12'
                                >
                                    <EquipmentMeta
                                        v-model='equipment.meta'
                                        :schema='type.schema'
                                    />
                                </div>

                                <div class='card-body col-md-12'>
                                    <div class='d-flex'>
                                        <a
                                            v-if='$route.params.equipid'
                                            class='cursor-pointer btn btn-danger'
                                            @click='archive'
                                        >
                                            Archive Equipment
                                        </a>

                                        <div class='ms-auto'>
                                            <a
                                                class='cursor-pointer btn btn-primary'
                                                @click='save'
                                            >
                                                <span v-text='$route.params.equipid ? "Update Equipment" : "Create Equipment"' />
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

        <Upload
            v-if='upload'
            :url='uploadurl()'
            :headers='headers'
            @err='upload = null; err = $event'
            @close='upload = null'
            @done='upload = null; cache = +new Date()'
        />
    </div>
</template>

<script>
import {
    TablerBreadCrumb,
    TablerLoading,
    TablerToggle,
    TablerInput,
    TablerList
} from '@tak-ps/vue-tabler'
import UserSelect from './util/UserSelect.vue';
import NoAccess from './util/NoAccess.vue';
import Alert from './util/Alert.vue';
import EquipmentMeta from './util/EquipmentMeta.vue';
import EquipmentProfile from './Equipment/Profile.vue';
import Upload from './util/Upload.vue';
import iam from '../iam.js';

export default {
    name: 'EquipmentEdit',
    components: {
        Alert,
        NoAccess,
        Upload,
        TablerBreadCrumb,
        UserSelect,
        TablerList,
        TablerInput,
        TablerToggle,
        TablerLoading,
        EquipmentMeta,
        EquipmentProfile
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
            upload: false,
            token: localStorage.token,
            base: window.stdurl('/').origin,
            cache: +new Date(),
            headers: {
                Authorization: `Bearer ${localStorage.token}`
            },
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
                value: '',
                quantity: 1,
                parent: null,
                type: null,
                meta: {}
            }
        }
    },
    watch: {
        'equipment.type_id': async function() {
            this.type = await window.std(`/api/equipment-type/${this.equipment.type_id}`);
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
    methods: {
        is_iam: function(permission) { return iam(this.iam, this.auth, permission) },
        uploadurl: function() {
            return window.stdurl(`api/equipment/${this.$route.params.equipid}/profile`);
        },
        fetch: async function() {
            this.loading.equipment = true;
            this.equipment = await window.std(`/api/equipment/${this.$route.params.equipid}`);

            if (this.equipment.type_id) {
                this.type = await window.std(`/api/equipment-type/${this.equipment.type_id}`);
            }
            if (this.equipment.parent) {
                this.parent = await window.std(`/api/equipment/${this.equipment.parent}`);
            }

            this.assigned = (await window.std(`/api/equipment/${this.equipment.id}/assigned`)).items;

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
                        value: this.equipment.value ? Number(this.equipment.value) : null,
                        quantity: this.equipment.quantity ? parseInt(this.equipment.quantity) : null,
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
                        value: this.equipment.value ? Number(this.equipment.value) : null,
                        quantity: this.equipment.quantity ? parseInt(this.equipment.quantity) : null,
                        assigned: this.assigned.map((a) => { return a.uid || a.id })
                    }
                })

                this.loading.equipment = false;
                this.$router.push(`/equipment/${equip.id}`);
            }
        }
    }
}
</script>
