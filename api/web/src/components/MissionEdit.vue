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
                <div
                    ref='form'
                    class='row row-deck row-cards'
                    @pointerdown.capture='draft.arm'
                    @keydown.capture='draft.arm'
                    @input.capture='draft.arm'
                    @focusout='onFocusOut'
                >
                    <NoAccess
                        v-if='!is_iam("Mission:Manage")'
                        title='New Mission'
                    />
                    <TablerLoading v-if='loading.mission' />
                    <template v-else>
                        <div
                            v-if='restored'
                            class='col-lg-12'
                        >
                            <div
                                class='alert alert-info d-flex align-items-center w-100 mb-0'
                                role='status'
                            >
                                <IconHistory
                                    :size='24'
                                    stroke='1.5'
                                    class='me-2 flex-shrink-0'
                                />
                                <div>
                                    Unsaved changes from <span v-text='restoredAgo' /> were restored from this device.
                                </div>
                                <button
                                    type='button'
                                    class='btn btn-sm ms-auto flex-shrink-0'
                                    @click='discardDraft'
                                >
                                    Discard Changes
                                </button>
                            </div>
                        </div>
                        <div class='col-lg-12'>
                            <div class='card'>
                                <div class='card-header'>
                                    <h1
                                        class='card-title'
                                        v-text='mission.title || "Mission Editor"'
                                    />
                                    <div class='ms-auto text-secondary small'>
                                        <span class='text-red'>*</span> Required
                                    </div>
                                </div>
                                <div class='card-body'>
                                    <div class='row row-cards'>
                                        <div class='col-12 col-md-8 row'>
                                            <div
                                                class='col-12 col-md-8'
                                                data-field='title'
                                            >
                                                <TablerInput
                                                    v-model='mission.title'
                                                    :error='shown.title'
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
                                            <div
                                                class='col-12 col-md-6'
                                                data-field='start_ts'
                                            >
                                                <TablerInput
                                                    v-model='mission.start_ts'
                                                    type='datetime-local'
                                                    :required='true'
                                                    :error='shown.start_ts'
                                                    label='Mission Start'
                                                />
                                            </div>
                                            <div
                                                class='col-12 col-md-6'
                                                data-field='end_ts'
                                            >
                                                <TablerInput
                                                    v-model='mission.end_ts'
                                                    type='datetime-local'
                                                    :required='true'
                                                    :error='shown.end_ts'
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
                                        <div
                                            class='col-12 col-md-12'
                                            data-field='body'
                                        >
                                            <label class='form-label'>
                                                <span>Description</span>
                                                <span class='text-red mx-1'>*</span>
                                            </label>
                                            <div :class='{ "mission-body-invalid": shown.body }'>
                                                <MDEditorShim v-model='mission.body' />
                                            </div>
                                            <div
                                                v-if='shown.body'
                                                class='invalid-feedback d-block'
                                                v-text='shown.body'
                                            />
                                        </div>
                                        <div
                                            class='col-md-12'
                                            data-field='location'
                                        >
                                            <LocationDropdown
                                                v-model='mission.location'
                                                :error='shown.location'
                                                :required='true'
                                                @loc-geom='mission.location_geom = $event'
                                            />
                                        </div>
                                        <div
                                            class='col-md-12'
                                            data-field='location_geom'
                                        >
                                            <Location
                                                v-model='mission.location_geom'
                                                :disabled='false'
                                                :required='true'
                                                :error='shown.location_geom'
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
                                    <div
                                        v-if='attempted && invalid.length'
                                        class='alert alert-danger'
                                        role='alert'
                                    >
                                        <h4 class='alert-heading'>
                                            <span v-text='invalid.length' />
                                            <span v-text='invalid.length === 1 ? " field needs" : " fields need"' />
                                            attention before the mission can be saved
                                        </h4>
                                        <div class='btn-list mt-2'>
                                            <button
                                                v-for='item in invalid'
                                                :key='item.field'
                                                type='button'
                                                class='btn btn-sm btn-outline-danger'
                                                @click='scrollToField(item.field)'
                                                v-text='item.label'
                                            />
                                        </div>
                                    </div>
                                    <div
                                        v-if='saveError'
                                        class='alert alert-danger'
                                        role='alert'
                                    >
                                        <h4 class='alert-heading'>
                                            The mission could not be saved
                                        </h4>
                                        <div v-text='saveError.message' />
                                        <div class='text-secondary small mt-1'>
                                            Your changes are kept on this device and will still be here after a refresh.
                                        </div>
                                    </div>
                                    <div class='d-flex'>
                                        <button
                                            v-if='route.params.missionid && is_iam("Mission:Admin")'
                                            type='button'
                                            class='btn btn-danger'
                                            :disabled='saving'
                                            @click='deleteMission'
                                        >
                                            Delete Mission
                                        </button>
                                        <button
                                            type='button'
                                            class='btn btn-primary ms-auto'
                                            :disabled='saving'
                                            @click='submit'
                                        >
                                            <span
                                                v-if='saving'
                                                class='spinner-border spinner-border-sm me-2'
                                            />
                                            <span v-text='route.params.missionid ? "Update Mission" : "Create Mission"' />
                                        </button>
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
import { ref, reactive, computed, watch, nextTick, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import iamHelper from '../iam.js';
import moment from 'moment';
import { useFormDraft } from '../base/form-draft.ts';
import NoAccess from './util/NoAccess.vue';
import UserSelect from './util/UserSelect.vue';
import Location from './Mission/Location.vue';
import LocationDropdown from './util/LocationDropdown.vue';
import TeamSelect from './util/TeamSelect.vue';
import MissionTagSelect from './util/MissionTagSelect.vue';
import AgencySelect from './util/AgencySelect.vue';
import MDEditorShim from './util/MDEditorShim.vue';
import { IconHistory } from '@tabler/icons-vue';
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

// Validated fields in the order they appear on the form
const Fields = [
    { field: 'title', label: 'Mission Title' },
    { field: 'start_ts', label: 'Mission Start' },
    { field: 'end_ts', label: 'Mission End' },
    { field: 'body', label: 'Description' },
    { field: 'location', label: 'Location Name' },
    { field: 'location_geom', label: 'Coordinates' }
];

const DraftFields = [
    'title', 'externalid', 'body', 'start_ts', 'end_ts',
    'location', 'location_geom', 'teams', 'tags', 'agencies'
];

const form = ref(null);
const loading = reactive({ mission: true });
const saving = ref(false);
const saveError = ref(null);

// Errors are shown for a field once it has been visited or a save was attempted
const attempted = ref(false);
const touched = reactive({});

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

const draft = useFormDraft(
    () => `draft:mission:${props.auth.id}:${route.params.missionid || 'new'}`,
    () => {
        const data = { assigned: assigned.value };
        for (const field of DraftFields) data[field] = mission[field];
        return data;
    },
    (data) => {
        for (const field of DraftFields) {
            if (field in data) mission[field] = data[field];
        }

        assigned.value = Array.isArray(data.assigned) ? data.assigned : [];
    }
);

const restored = draft.restored;

const restoredAgo = computed(() => {
    return restored.value ? moment(restored.value).fromNow() : '';
});

const errors = computed(() => {
    const res = {};
    for (const { field } of Fields) res[field] = '';

    if (!String(mission.title || '').trim()) res.title = 'A title is required';
    if (!String(mission.body || '').trim()) res.body = 'A description is required';
    if (!String(mission.location || '').trim()) res.location = 'A location name is required';

    for (const field of ['start_ts', 'end_ts']) {
        if (!mission[field]) res[field] = 'A date and time is required';
        else if (!moment(mission[field]).isValid()) res[field] = 'Not a valid date and time';
    }

    if (!res.start_ts && !res.end_ts && moment(mission.end_ts).isBefore(moment(mission.start_ts))) {
        res.end_ts = 'The mission cannot end before it starts';
    }

    const coordinates = mission.location_geom && mission.location_geom.coordinates;
    if (!Array.isArray(coordinates) || coordinates.length < 2) {
        res.location_geom = 'Enter coordinates or click the map to set where the mission took place';
    }

    return res;
});

const shown = computed(() => {
    const res = {};
    for (const { field } of Fields) {
        res[field] = (attempted.value || touched[field]) ? errors.value[field] : '';
    }

    return res;
});

const invalid = computed(() => {
    return Fields.filter(({ field }) => errors.value[field]);
});

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
    }

    draft.begin();

    loading.mission = false;
});

function is_iam(permission) {
    return iamHelper(props.iam, props.auth, permission);
}

function onFocusOut(event) {
    if (!(event.target instanceof Element)) return;

    const wrapper = event.target.closest('[data-field]');
    if (!wrapper) return;
    if (event.relatedTarget instanceof Node && wrapper.contains(event.relatedTarget)) return;

    touched[wrapper.getAttribute('data-field')] = true;
}

function scrollToField(field) {
    if (!form.value) return;

    const wrapper = form.value.querySelector(`[data-field="${field}"]`);
    if (!wrapper) return;

    wrapper.scrollIntoView({ behavior: 'smooth', block: 'center' });

    const input = wrapper.querySelector('input, textarea');
    if (input) input.focus({ preventScroll: true });
}

function discardDraft() {
    draft.discard();
    attempted.value = false;
    saveError.value = null;
    for (const field of Object.keys(touched)) delete touched[field];
}

async function deleteMission() {
    loading.mission = true;
    await window.std(`/api/mission/${route.params.missionid}`, {
        method: 'DELETE',
    });

    draft.clear();
    loading.mission = false;
    router.push('/mission');
}

async function submit() {
    attempted.value = true;
    saveError.value = null;

    if (invalid.value.length) {
        await nextTick();
        scrollToField(invalid.value[0].field);
        return;
    }

    const body = {
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
    };

    saving.value = true;

    try {
        let saved;

        if (route.params.missionid) {
            saved = await window.std(`/api/mission/${route.params.missionid}`, {
                method: 'PATCH',
                body
            });
        } else {
            saved = await window.std('/api/mission', {
                method: 'POST',
                body: {
                    ...body,
                    assigned: assigned.value.map((a) => ({
                        uid: a.id,
                        role: a.role || 'General',
                        confirmed: a.confirmed || true
                    }))
                }
            });
        }

        draft.clear();
        router.push(`/mission/${saved.id}`);
    } catch (err) {
        saveError.value = err instanceof Error ? err : new Error(String(err));
    } finally {
        saving.value = false;
    }
}

async function fetch() {
    loading.mission = true;
    const data = await window.std(`/api/mission/${route.params.missionid}`);

    data.start_ts = moment(data.start_ts).format('YYYY-MM-DDTHH:mm');
    data.end_ts = moment(data.end_ts).format('YYYY-MM-DDTHH:mm');

    Object.assign(mission, data);
}
</script>

<style scoped>
.mission-body-invalid :deep(.md-editor) {
    border-color: var(--tblr-danger);
    box-shadow: 0 0 0 1px var(--tblr-danger);
}
</style>
