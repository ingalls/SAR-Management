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
                        v-if='is_iam("Incident:Manage")'
                        title='Add Incident'
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
                v-if='!is_iam("Incident:View")'
                :compact='true'
            />
            <TablerNone
                v-else-if='!incidents.length'
                label='No Incidents'
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
                    :class='{ "cursor-pointer": is_iam("Incident:Manage") }'
                    @click='is_iam("Incident:Manage") ? router.push(`/incident/${incident.id}/edit`) : null'
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

<script setup>
import iamHelper from '../../iam.js';
import NoAccess from './NoAccess.vue';
import { TablerNone, TablerEpoch, TablerIconButton } from '@tak-ps/vue-tabler';
import { IconPlus } from '@tabler/icons-vue';
import { useRouter } from 'vue-router';

const props = defineProps({
    cols: {
        type: String,
        default: 'col-lg-12'
    },
    incidents: {
        type: Array,
        required: true
    },
    label: {
        type: String,
        default: 'Related Incidents'
    },
    mission_id: {
        type: Number
    },
    training_id: {
        type: Number
    },
    iam: {
        type: Object,
        required: true
    },
    auth: {
        type: Object,
        required: true
    }
});

const router = useRouter();

function is_iam(permission) { return iamHelper(props.iam, props.auth, permission); }

function create() {
    if (props.mission_id) {
        router.push(`/incident/new?mission_id=${props.mission_id}`);
    } else if (props.training_id) {
        router.push(`/incident/new?training_id=${props.training_id}`);
    } else {
        router.push('/incident/new');
    }
}
</script>
