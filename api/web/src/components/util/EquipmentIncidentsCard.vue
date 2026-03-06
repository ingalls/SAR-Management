<template>
    <div :class='cols'>
        <div class='card'>
            <div class='card-header'>
                <h3
                    class='card-title'
                    v-text='label'
                />
                <div class='ms-auto btn-list'>
                    <TablerIconButton
                        v-if='is_iam("Equipment:Manage")'
                        title='Add Equipment Incident'
                        @click='create'
                    >
                        <IconPlus
                            :size='24'
                            stroke='1'
                        />
                    </TablerIconButton>
                </div>
            </div>
            <NoAccess
                v-if='!is_iam("Equipment:View")'
                :compact='true'
            />
            <TablerLoading v-else-if='loading' />
            <TablerNone
                v-else-if='!incidents.length'
                label='No Equipment Incidents'
                :create='false'
            />
            <div
                v-else
                class='list-group list-group-flush list-group-hoverable'
            >
                <div
                    v-for='incident in incidents'
                    :key='incident.id'
                    class='list-group-item'
                    :class='{ "cursor-pointer": is_iam("Equipment:Manage") }'
                    @click='is_iam("Equipment:Manage") ? $router.push(`/equipment/${equipmentId}/incident/${incident.id}/edit`) : null'
                >
                    <div class='row align-items-center'>
                        <div class='col text-truncate'>
                            <div
                                class='text-reset d-block'
                                v-text='incident.title'
                            />
                            <div
                                class='d-block text-secondary text-truncate mt-n1'
                                v-text='incident.body'
                            />
                        </div>
                        <div class='col-auto'>
                            <TablerEpoch :date='incident.date' />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import iam from '../../iam.js';
import NoAccess from './NoAccess.vue';
import { TablerNone, TablerEpoch, TablerIconButton, TablerLoading } from '@tak-ps/vue-tabler';
import { IconPlus } from '@tabler/icons-vue';

export default {
    name: 'EquipmentIncidentsCard',
    components: {
        TablerNone,
        TablerEpoch,
        TablerIconButton,
        TablerLoading,
        IconPlus,
        NoAccess
    },
    props: {
        cols: {
            type: String,
            default: 'col-lg-12'
        },
        equipmentId: {
            type: Number,
            required: true
        },
        label: {
            type: String,
            default: 'Equipment Incidents'
        },
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
            loading: true,
            incidents: []
        }
    },
    mounted: async function() {
        await this.fetch();
    },
    methods: {
        is_iam: function(permission) { return iam(this.iam, this.auth, permission) },
        fetch: async function() {
            this.loading = true;
            const res = await window.std(`/api/equipment/${this.equipmentId}/incident`);
            this.incidents = res.items;
            this.loading = false;
        },
        create: function() {
            this.$router.push(`/equipment/${this.equipmentId}/incident/new`);
        }
    }
}
</script>
