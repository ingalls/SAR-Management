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
                        v-if='!is_iam("Mission:View")'
                        title='Mission'
                    />
                    <TablerLoading v-if='loading.mission' />
                    <template v-else>
                        <div
                            v-if='!loading.assigned && is_roster'
                            class='col-12'
                        >
                            <div
                                class='alert alert-info col-12 d-flex align-items-center'
                                role='alert'
                            >
                                <div>
                                    <h3>Roster Correction</h3>
                                    <p>You aren't marked as present for this mission. If this is incorrect, request to be added to the mission roster</p>
                                </div>
                                <div class='ms-auto'>
                                    <TablerLoading
                                        v-if='loading.request'
                                        :inline='true'
                                    />
                                    <button
                                        v-else
                                        class='btn btn-info cursor-pointer'
                                        @click='request'
                                    >
                                        Request Inclusion
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div class='col-lg-12'>
                            <div class='card'>
                                <div class='card-header'>
                                    <div class='row col-12'>
                                        <div class='col-12 d-flex'>
                                            <div>
                                                <div
                                                    class='card-title'
                                                    v-text='`${mission.title}`'
                                                />
                                                <div
                                                    class='subheader'
                                                    v-text='`${mission.location || "Location Unknown"} - ${mission.externalid || "No Mission Number"}`'
                                                />
                                            </div>

                                            <div class='ms-auto btn-list d-flex align-items-center'>
                                                <TablerEpochRange
                                                    :start='mission.start_ts'
                                                    :end='mission.end_ts'
                                                />
                                                <TablerIconButton
                                                    title='Download PDF'
                                                    class='mx-2'
                                                    @click='download'
                                                >
                                                    <IconFileTypePdf
                                                        size='24'
                                                        stroke='1'
                                                    />
                                                </TablerIconButton>
                                                <TablerIconButton
                                                    v-if='is_iam("Mission:Manage")'
                                                    title='Edit Mission'
                                                    @click='$router.push(`/mission/${$route.params.missionid}/edit`)'
                                                >
                                                    <IconPencil
                                                        size='24'
                                                        stroke='1'
                                                    />
                                                </TablerIconButton>
                                            </div>
                                        </div>
                                        <div
                                            v-if='mission.teams.length'
                                            class='col-12 mt-2 btn-list'
                                        >
                                            <template
                                                v-for='team in mission.teams'
                                                :key='team.id'
                                            >
                                                <TeamBadge
                                                    class='mx-1'
                                                    :team='team'
                                                />
                                            </template>
                                        </div>
                                    </div>
                                </div>
                                <div class='card-body'>
                                    <div class='row row-cards'>
                                        <TablerMarkdown
                                            class='col-md-12'
                                            :markdown='mission.body'
                                        />

                                        <div class='col-12 datagrid'>
                                            <div
                                                v-if='mission.end_ts < +new Date()'
                                                class='datagrid-item'
                                            >
                                                <div class='datagrid-title'>
                                                    Personnel
                                                </div>
                                                <div
                                                    class='datagrid-content'
                                                    v-text='mission.users.length'
                                                />
                                            </div>
                                            <div
                                                v-if='mission.end_ts < +new Date()'
                                                class='datagrid-item'
                                            >
                                                <div class='datagrid-title'>
                                                    Man-Hours
                                                </div>
                                                <div
                                                    class='datagrid-content'
                                                    v-text='Math.round(mission.users.length * (mission.end_ts - mission.start_ts) / 1000 / 60 / 60)'
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <Location
                                    v-if='mission.location_geom'
                                    v-model='mission.location_geom'
                                    :search='false'
                                />
                            </div>
                        </div>

                        <People
                            :mission='mission'
                            :iam='iam'
                            :auth='auth'
                        />

                        <IncidentsCard
                            cols='col-lg-6'
                            :incidents='mission.incidents'
                            :mission_id='mission.id'
                            :iam='iam'
                            :auth='auth'
                        />

                        <div
                            v-if='!loading.mission'
                            class='col-lg-6'
                        >
                            <Assets
                                :mission='mission'
                                :iam='iam'
                                :auth='auth'
                                @refresh='fetch'
                            />
                        </div>

                        <div
                            v-if='!loading.mission'
                            class='col-lg-6'
                        >
                            <UserSelect
                                v-model='assigned'
                                mode='card'
                                :loading='loading.assigned'
                                @push='postAssigned($event)'
                                @patch='patchAssigned($event)'
                                @delete='deleteAssigned($event)'
                            />
                        </div>
                    </template>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import iamHelper from '../iam.js';
import NoAccess from './util/NoAccess.vue';
import Location from './Mission/Location.vue';
import Assets from './Mission/Assets.vue';
import People from './Mission/People.vue';
import IncidentsCard from './util/IncidentsCard.vue';
import UserSelect from './util/UserSelect.vue';
import TeamBadge from './util/TeamBadge.vue';
import {
    TablerEpochRange,
    TablerBreadCrumb,
    TablerMarkdown,
    TablerLoading,
    TablerIconButton
} from '@tak-ps/vue-tabler';
import {
    IconPencil,
    IconFileTypePdf
} from '@tabler/icons-vue';
import { reactive, ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';

const props = defineProps({
    iam: {
        type: Object,
        required: true
    },
    auth: {
        type: Object,
        required: true
    }
});

const route = useRoute();

const loading = reactive({
    mission: true,
    assigned: true
});
const mission = reactive({
    title: '',
    body: '',
    start_ts: '',
    end_ts: '',
    teams: [],
    assets: [],
    people: [],
    assets_id: [],
    incidents: []
});
const assigned = ref([]);

const is_roster = computed(() => {
    if (mission.start_ts > +new Date()) return false;
    if (mission.start_ts < +new Date() - 604800000) return false;

    return assigned.value.every((a) => {
        return a.uid != props.auth.id;
    });
});

function is_iam(permission) { return iamHelper(props.iam, props.auth, permission); }

function download() {
    window.open(`/api/mission/${route.params.missionid}/export?format=pdf&token=${localStorage.token}`, "_blank");
}

async function fetch() {
    loading.mission = true;
    Object.assign(mission, await window.std(`/api/mission/${route.params.missionid}`));
    loading.mission = false;
}

async function request() {
    loading.request = true;
    await window.std(`/api/mission/${route.params.missionid}/assigned/request`, {
        method: 'POST'
    });

    await fetchAssigned();

    loading.request = false;
}

async function fetchAssigned() {
    loading.assigned = true;
    assigned.value = (await window.std(`/api/mission/${route.params.missionid}/assigned`)).items;
    loading.assigned = false;
}

async function deleteAssigned(user) {
    loading.assigned = true;

    await window.std(`/api/mission/${route.params.missionid}/assigned/${user.id}`, {
        method: 'DELETE'
    });

    await fetchAssigned();
}

async function patchAssigned(user) {
    loading.assigned = true;
    await window.std(`/api/mission/${route.params.missionid}/assigned/${user.id}`, {
        method: 'PATCH',
        body: {
            role: user.role,
            confirmed: user.confirmed
        }
    });

    await fetchAssigned();
}

async function postAssigned(user) {
    loading.assigned = true;
    await window.std(`/api/mission/${route.params.missionid}/assigned`, {
        method: 'POST',
        body: {
            uid: user.id
        }
    });

    await fetchAssigned();
}

onMounted(async () => {
    await window.std('/api/location');

    if (is_iam("Mission:View")) {
        await fetch();
        await fetchAssigned();
    }
});
</script>
