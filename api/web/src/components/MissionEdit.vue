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
                        v-if='!is_iam("Mission:Manage")'
                        title='New Mission'
                    />
                    <TablerLoading v-if='loading.mission' />
                    <template v-else>
                        <div class='col-lg-12'>
                            <div class='card'>
                                <div class='card-header'>
                                    <h1
                                        class='card-title'
                                        v-text='mission.title || "Mission Editor"'
                                    />
                                </div>
                                <div class='card-body'>
                                    <div class='row row-cards'>
                                        <div class='col-12 col-md-8 row'>
                                            <div class='col-12 col-md-8'>
                                                <TablerInput
                                                    v-model='mission.title'
                                                    :error='errors.title'
                                                    :required='true'
                                                    label='Mission Title'
                                                    description='A Human Readable name for the mission'
                                                />
                                            </div>
                                            <div class='col-12 col-md-4'>
                                                <TablerInput
                                                    v-model='mission.externalid'
                                                    label='Mission Number'
                                                    description='A CAD number or similiar External ID'
                                                />
                                            </div>
                                            <div class='col-12 col-md-6'>
                                                <TablerInput
                                                    v-model='mission.start_ts'
                                                    type='datetime-local'
                                                    :required='true'
                                                    :error='errors.start_ts'
                                                    label='Mission Start'
                                                />
                                            </div>
                                            <div class='col-12 col-md-6'>
                                                <TablerInput
                                                    v-model='mission.end_ts'
                                                    type='datetime-local'
                                                    :required='true'
                                                    :error='errors.end_ts'
                                                    label='Mission End'
                                                />
                                            </div>
                                        </div>
                                        <div class='col-12 col-md-4'>
                                            <TeamSelect
                                                v-model='mission.teams'
                                                label='Assigned'
                                                :fieldable='true'
                                            />
                                            <MissionTagSelect
                                                v-model='mission.tags'
                                                label='Tags'
                                            />
                                            <AgencySelect
                                                v-model='mission.agencies'
                                                label='Agencies'
                                                :user-id='auth.id'
                                            />
                                        </div>
                                        <div class='col-12 col-md-12'>
                                            <MDEditorShim v-model='mission.body' />
                                        </div>
                                        <div class='col-md-12'>
                                            <LocationDropdown
                                                v-model='mission.location'
                                                :error='errors.location'
                                                :required='true'
                                                @loc-geom='mission.location_geom = $event'
                                            />
                                        </div>
                                        <div class='col-md-12'>
                                            <Location
                                                v-model='mission.location_geom'
                                                :disabled='false'
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div
                            v-if='!route.params.missionid'
                            class='col-lg-12'
                        >
                            <UserSelect
                                v-model='assigned'
                                mode='card'
                                :confirmed='true'
                            />
                        </div>
                        <div class='col-lg-12'>
                            <div class='card'>
                                <div class='card-body'>
                                    <div class='col-md-12'>
                                        <div class='d-flex'>
                                            <a
                                                v-if='route.params.missionid && is_iam("Mission:Admin")'
                                                class='cursor-pointer btn btn-danger'
                                                @click='deleteMission'
                                            >
                                                Delete Mission
                                            </a>
                                            <div class='ms-auto'>
                                                <a
                                                    v-if='route.params.missionid'
                                                    class='cursor-pointer btn btn-primary'
                                                    @click='update'
                                                >
                                                    Update Mission
                                                </a>
                                                <a
                                                    v-else
                                                    class='cursor-pointer btn btn-primary'
                                                    @click='create'
                                                >
                                                    Create Mission
                                                </a>
                                            </div>
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

<script setup>
import { ref, reactive, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import iamHelper from '../iam.js';
import moment from 'moment';
import NoAccess from './util/NoAccess.vue';
import UserSelect from './util/UserSelect.vue';
import Location from './Mission/Location.vue';
import LocationDropdown from './util/LocationDropdown.vue';
import TeamSelect from './util/TeamSelect.vue';
import MissionTagSelect from './util/MissionTagSelect.vue';
import AgencySelect from './util/AgencySelect.vue';
import MDEditorShim from './util/MDEditorShim.vue';
import {
    TablerBreadCrumb,
    TablerInput,
    TablerLoading
} from '@tak-ps/vue-tabler';

const route = useRoute();
const router = useRouter();

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

const loading = reactive({ mission: true });

const errors = reactive({
    title: '',
    body: '',
    start_ts: '',
    end_ts: '',
    location_geom: '',
    location: ''
});

const mission = reactive({
    title: '',
    location: '',
    body: '',
    start_ts: '',
    end_ts: '',
    externalid: '',
    location_geom: null,
    teams: [],
    tags: [],
    agencies: [],
});

const assigned = ref([]);

watch(() => mission.start_ts, () => {
    if (mission.start_ts && !mission.end_ts) {
        mission.end_ts = mission.start_ts;
    }
});

onMounted(async () => {
    if (route.params.missionid && is_iam('Mission:Manage')) {
        await fetch();
    } else {
        const url = new URL(window.location);

        if (url.searchParams.has('title')) {
            mission.title = url.searchParams.get('title');
        }

        if (url.searchParams.has('start')) {
            mission.start_ts = moment(url.searchParams.get('start')).format('YYYY-MM-DDTHH:mm');
        }

        if (url.searchParams.has('end')) {
            mission.end_ts = moment(url.searchParams.get('end')).format('YYYY-MM-DDTHH:mm');
        }

        loading.mission = false;
    }
});

function is_iam(permission) {
    return iamHelper(props.iam, props.auth, permission);
}

async function deleteMission() {
    loading.mission = true;
    await window.std(`/api/mission/${route.params.missionid}`, {
        method: 'DELETE',
    });

    loading.mission = false;
    router.push('/mission');
}

function validate() {
    for (const field of ['title', 'location', 'body', 'location']) {
        if (!mission[field]) errors[field] = 'Cannot be empty';
        else errors[field] = '';
    }

    for (const field of ['start_ts', 'end_ts']) {
        if (!mission[field]) {
            errors[field] = 'Cannot be empty';
            continue;
        }

        try {
            new Date(mission[field]);
            errors[field] = '';
        } catch {
            errors[field] = 'Invalid Date';
        }
    }

    for (const e in errors) {
        if (errors[e]) return;
    }

    if (!mission.location_geom) throw new Error('A Location Geometry must be selected');

    return true;
}

async function update() {
    if (!validate()) return;

    try {
        loading.mission = true;
        const updated = await window.std(`/api/mission/${route.params.missionid}`, {
            method: 'PATCH',
            body: {
                title: mission.title,
                externalid: mission.externalid,
                body: mission.body,
                location: mission.location,
                location_geom: mission.location_geom,
                start_ts: moment(mission.start_ts).toISOString(),
                end_ts: moment(mission.end_ts).toISOString(),
                teams: mission.teams.map((team) => team.id),
                tags: mission.tags.map((tag) => tag.id),
                agencies: mission.agencies.map((agency) => agency.id),
            }
        });

        router.push(`/mission/${updated.id}`);
    } catch (err) {
        console.error(err);
    } finally {
        loading.mission = false;
    }
}

async function create() {
    if (!validate()) return;

    loading.mission = true;

    const created = await window.std('/api/mission', {
        method: 'POST',
        body: {
            ...mission,
            start_ts: moment(mission.start_ts).toISOString(),
            end_ts: moment(mission.end_ts).toISOString(),
            teams: mission.teams.map((team) => team.id),
            tags: mission.tags.map((tag) => tag.id),
            agencies: mission.agencies.map((agency) => agency.id),
            assigned: assigned.value.map((a) => ({
                uid: a.id,
                role: a.role || 'General',
                confirmed: a.confirmed || true
            }))
        }
    });

    loading.mission = false;
    router.push(`/mission/${created.id}`);
}

async function fetch() {
    loading.mission = true;
    const data = await window.std(`/api/mission/${route.params.missionid}`);

    data.start_ts = moment(data.start_ts).format('YYYY-MM-DDTHH:mm');
    data.end_ts = moment(data.end_ts).format('YYYY-MM-DDTHH:mm');

    Object.assign(mission, data);
    loading.mission = false;
}
</script>
