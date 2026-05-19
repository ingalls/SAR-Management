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
                        v-if='!is_iam("Incident:Manage")'
                        :title='$route.params.incidentid ? "Edit Incident" : "New Incident"'
                    />
                    <TablerLoading v-if='loading' />
                    <template v-else>
                        <div class='col-lg-12'>
                            <div class='card'>
                                <div class='card-header'>
                                    <h1
                                        class='card-title'
                                        v-text='incident.id ? incident.title : "New Incident"'
                                    />
                                    <div class='ms-auto'>
                                        <div class='btn-list'>
                                            <TablerDelete
                                                v-if='incident.id'
                                                displaytype='icon'
                                                @delete='deleteIncident'
                                            />
                                            <button
                                                class='btn btn-primary'
                                                @click='save'
                                            >
                                                Save
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div class='card-body'>
                                    <div class='row row-cards'>
                                        <div class='col-12 col-md-6 col-lg-3'>
                                            <TablerInput
                                                v-model='incident.title'
                                                label='Title'
                                                :required='true'
                                            />
                                        </div>
                                        <div class='col-12 col-md-6 col-lg-3'>
                                            <TablerInput
                                                v-model='incident.date'
                                                label='Date'
                                                type='datetime-local'
                                                :required='true'
                                            />
                                        </div>
                                        <div class='col-12 col-md-6 col-lg-3'>
                                            <TablerEnum
                                                v-model='incident.severity'
                                                label='Severity'
                                                :options='["minor", "moderate", "severe", "critical"]'
                                            />
                                        </div>
                                        <div class='col-12 col-md-6 col-lg-3'>
                                            <label class='form-label'>User</label>
                                            <TablerDropdown>
                                                <template #default>
                                                    <div class='form-control d-flex align-items-center cursor-pointer'>
                                                        <template v-if='selected_user'>
                                                            <Avatar :user='selected_user' />
                                                        </template>
                                                        <span
                                                            v-else
                                                            class='text-muted'
                                                        >Select User...</span>
                                                    </div>
                                                </template>
                                                <template #dropdown>
                                                    <div class='p-3'>
                                                        <TablerInput
                                                            v-model='user_filter'
                                                            icon='search'
                                                            placeholder='Filter Users'
                                                        />

                                                        <TablerNone
                                                            v-if='user_list.items.length === 0'
                                                            label='No Users'
                                                            :create='false'
                                                        />
                                                        <template v-else>
                                                            <div
                                                                v-for='user in user_list.items'
                                                                :key='user.id'
                                                                class='py-2 px-2 rounded cursor-pointer hover-light'
                                                                @click='selectUser(user)'
                                                            >
                                                                <Avatar :user='user' />
                                                            </div>
                                                        </template>
                                                    </div>
                                                </template>
                                            </TablerDropdown>
                                        </div>
                                        <div class='col-12'>
                                            <label class='form-label'>Associated With</label>
                                            <div class='input-group'>
                                                <button
                                                    type='button'
                                                    class='btn'
                                                    :class='mode === "mission" ? "btn-primary" : ""'
                                                    @click='mode = "mission"'
                                                >
                                                    Mission
                                                </button>
                                                <button
                                                    type='button'
                                                    class='btn'
                                                    :class='mode === "training" ? "btn-primary" : ""'
                                                    @click='mode = "training"'
                                                >
                                                    Training
                                                </button>

                                                <div class='col'>
                                                    <TablerDropdown
                                                        v-if='mode === "mission"'
                                                        class='w-100'
                                                    >
                                                        <template #default>
                                                            <div
                                                                class='form-control d-flex align-items-center cursor-pointer'
                                                                style='border-top-left-radius: 0; border-bottom-left-radius: 0;'
                                                            >
                                                                <span
                                                                    v-if='selected_mission'
                                                                    v-text='selected_mission.title'
                                                                />
                                                                <span
                                                                    v-else
                                                                    class='text-muted'
                                                                >Select Mission...</span>
                                                                <IconX
                                                                    v-if='selected_mission'
                                                                    :size='16'
                                                                    class='ms-auto'
                                                                    @click.stop='selected_mission = null; incident.mission_id = null'
                                                                />
                                                            </div>
                                                        </template>
                                                        <template #dropdown>
                                                            <div class='p-3'>
                                                                <TablerInput
                                                                    v-model='mission_filter'
                                                                    icon='search'
                                                                    placeholder='Filter Missions'
                                                                />
                                                                <TablerNone
                                                                    v-if='mission_list.items.length === 0'
                                                                    label='No Missions'
                                                                    :create='false'
                                                                />
                                                                <template v-else>
                                                                    <div
                                                                        v-for='mission in mission_list.items'
                                                                        :key='mission.id'
                                                                        class='py-2 px-2 rounded cursor-pointer hover-light'
                                                                        @click='selectMission(mission)'
                                                                        v-text='mission.title'
                                                                    />
                                                                </template>
                                                            </div>
                                                        </template>
                                                    </TablerDropdown>

                                                    <TablerDropdown
                                                        v-if='mode === "training"'
                                                        class='w-100'
                                                    >
                                                        <template #default>
                                                            <div
                                                                class='form-control d-flex align-items-center cursor-pointer'
                                                                style='border-top-left-radius: 0; border-bottom-left-radius: 0;'
                                                            >
                                                                <span
                                                                    v-if='selected_training'
                                                                    v-text='selected_training.title'
                                                                />
                                                                <span
                                                                    v-else
                                                                    class='text-muted'
                                                                >Select Training...</span>
                                                                <IconX
                                                                    v-if='selected_training'
                                                                    :size='16'
                                                                    class='ms-auto'
                                                                    @click.stop='selected_training = null; incident.training_id = null'
                                                                />
                                                            </div>
                                                        </template>
                                                        <template #dropdown>
                                                            <div class='p-3'>
                                                                <TablerInput
                                                                    v-model='training_filter'
                                                                    icon='search'
                                                                    placeholder='Filter Trainings'
                                                                />
                                                                <TablerNone
                                                                    v-if='training_list.items.length === 0'
                                                                    label='No Trainings'
                                                                    :create='false'
                                                                />
                                                                <template v-else>
                                                                    <div
                                                                        v-for='training in training_list.items'
                                                                        :key='training.id'
                                                                        class='py-2 px-2 rounded cursor-pointer hover-light'
                                                                        @click='selectTraining(training)'
                                                                        v-text='training.title'
                                                                    />
                                                                </template>
                                                            </div>
                                                        </template>
                                                    </TablerDropdown>
                                                </div>
                                            </div>
                                        </div>
                                        <div class='col-12'>
                                            <label class='form-label'>Description</label>
                                            <MDEditorShim v-model='incident.body' />
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
import iamHelper from '../iam.js';
import NoAccess from './util/NoAccess.vue';
import Avatar from './util/Avatar.vue';
import MDEditorShim from './util/MDEditorShim.vue';
import {
    TablerBreadCrumb,
    TablerLoading,
    TablerInput,
    TablerEnum,
    TablerDelete,
    TablerDropdown,
    TablerNone
} from '@tak-ps/vue-tabler';
import { IconX } from '@tabler/icons-vue';
import { reactive, ref, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

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
const router = useRouter();

const loading = ref(true);
const mode = ref('mission');
const user_filter = ref('');
const mission_filter = ref('');
const training_filter = ref('');
const incident = reactive({
    id: null,
    title: '',
    severity: 'minor',
    body: '',
    date: new Date().toISOString().slice(0, 16),
    uid: null,
    mission_id: null,
    training_id: null
});
const selected_user = ref(null);
const selected_mission = ref(null);
const selected_training = ref(null);
const user_list = reactive({ items: [] });
const mission_list = reactive({ items: [] });
const training_list = reactive({ items: [] });

function is_iam(permission) { return iamHelper(props.iam, props.auth, permission); }

watch(mode, () => {
    if (mode.value === 'mission') {
        incident.training_id = null;
        selected_training.value = null;
    } else if (mode.value === 'training') {
        incident.mission_id = null;
        selected_mission.value = null;
    }
});

watch(user_filter, async () => { await searchUsers(); });
watch(mission_filter, async () => { await searchMissions(); });
watch(training_filter, async () => { await searchTrainings(); });

async function searchUsers() {
    const url = window.stdurl('/api/user');
    if (user_filter.value) url.searchParams.append('filter', user_filter.value);
    url.searchParams.append('limit', 10);
    const listResult = await window.std(url);
    if (listResult.assigned) listResult.items = listResult.assigned;
    Object.assign(user_list, listResult);
}

async function searchMissions() {
    const url = window.stdurl('/api/mission');
    if (mission_filter.value) url.searchParams.append('filter', mission_filter.value);
    url.searchParams.append('limit', 10);
    Object.assign(mission_list, await window.std(url));
}

async function searchTrainings() {
    const url = window.stdurl('/api/training');
    if (training_filter.value) url.searchParams.append('filter', training_filter.value);
    url.searchParams.append('limit', 10);
    Object.assign(training_list, await window.std(url));
}

function selectUser(user) {
    selected_user.value = user;
    incident.uid = user.id;
}

function selectMission(mission) {
    selected_mission.value = mission;
    incident.mission_id = mission.id;
}

function selectTraining(training) {
    selected_training.value = training;
    incident.training_id = training.id;
}

async function deleteIncident() {
    await window.std(`/api/incident/${incident.id}`, { method: 'DELETE' });
    router.go(-1);
}

async function save() {
    if (!incident.title) return;
    if (!incident.uid) return;
    if (!incident.date) return;

    const body = {
        title: incident.title,
        severity: incident.severity,
        body: incident.body,
        date: new Date(incident.date).toISOString(),
        uid: incident.uid,
        mission_id: incident.mission_id || undefined,
        training_id: incident.training_id || undefined
    };

    if (incident.id) {
        await window.std(`/api/incident/${incident.id}`, {
            method: 'PATCH',
            body
        });
    } else {
        await window.std(`/api/incident`, {
            method: 'POST',
            body
        });
    }

    router.go(-1);
}

onMounted(async () => {
    if (!is_iam('Incident:Manage')) return;

    if (route.params.incidentid) {
        Object.assign(incident, await window.std(`/api/incident/${route.params.incidentid}`));

        if (incident.uid) selected_user.value = await window.std(`/api/user/${incident.uid}`);
        if (incident.mission_id) {
             selected_mission.value = await window.std(`/api/mission/${incident.mission_id}`);
             mode.value = 'mission';
        }
        if (incident.training_id) {
            selected_training.value = await window.std(`/api/training/${incident.training_id}`);
            mode.value = 'training';
        }

        if (incident.date) {
            incident.date = incident.date.slice(0, 16);
        }
    } else {
        if (route.query.mission_id) {
            incident.mission_id = parseInt(route.query.mission_id);
            selected_mission.value = await window.std(`/api/mission/${incident.mission_id}`);
            mode.value = 'mission';
        }
        if (route.query.training_id) {
            incident.training_id = parseInt(route.query.training_id);
            selected_training.value = await window.std(`/api/training/${incident.training_id}`);
            mode.value = 'training';
        }
    }

    await Promise.all([
        searchUsers(),
        searchMissions(),
        searchTrainings()
    ]);

    loading.value = false;
});
</script>
