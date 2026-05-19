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
                            v-if='!is_iam("Training:Manage")'
                            title='Edit Training'
                        />
                        <div
                            v-else
                            class='card'
                        >
                            <TablerLoading v-if='loading.training' />
                            <template v-else>
                                <div class='card-header'>
                                    <h1
                                        class='card-title'
                                        v-text='training.title || "Training Editor"'
                                    />
                                    <div class='ms-auto'>
                                        <TablerToggle
                                            v-model='training.required'
                                            label='Required Training'
                                        />
                                    </div>
                                </div>
                                <div class='card-body'>
                                    <div class='row row-cards'>
                                        <div class='col-12 col-md-8 row'>
                                            <div class='col-12'>
                                                <TablerInput
                                                    v-model='training.title'
                                                    label='Training Title'
                                                />
                                            </div>
                                            <div class='col-12 col-md-6'>
                                                <TablerInput
                                                    v-model='training.start_ts'
                                                    type='datetime-local'
                                                    label='Training Start'
                                                />
                                            </div>
                                            <div class='col-12 col-md-6'>
                                                <TablerInput
                                                    v-model='training.end_ts'
                                                    type='datetime-local'
                                                    label='Training End'
                                                />
                                            </div>
                                        </div>
                                        <div class='col-12 col-md-4'>
                                            <TeamSelect
                                                v-model='training.teams'
                                                label='Assigned'
                                            />
                                            <TrainingTagSelect
                                                v-model='training.tags'
                                                label='Tags'
                                            />
                                        </div>
                                        <div class='col-md-12'>
                                            <MDEditorShim v-model='training.body' />
                                        </div>
                                        <div class='col-md-12'>
                                            <LocationDropdown
                                                v-model='training.location'
                                                @loc-geom='training.location_geom = $event'
                                            />
                                        </div>
                                        <div class='col-md-12'>
                                            <Location
                                                v-model='training.location_geom'
                                                :disabled='false'
                                            />
                                        </div>

                                        <div class='col-md-12'>
                                            <div class='d-flex'>
                                                <a
                                                    v-if='$route.params.trainingid && is_iam("Training:Admin")'
                                                    class='cursor-pointer btn btn-danger'
                                                    @click='deleteTraining'
                                                >
                                                    Delete Training
                                                </a>
                                                <div class='ms-auto'>
                                                    <a
                                                        v-if='$route.params.trainingid'
                                                        class='cursor-pointer btn btn-primary'
                                                        @click='update'
                                                    >
                                                        Update Training
                                                    </a>
                                                    <a
                                                        v-else
                                                        class='cursor-pointer btn btn-primary'
                                                        @click='create'
                                                    >
                                                        Create Training
                                                    </a>
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
        </div>
    </div>
</template>

<script setup>
import iamHelper from '../iam.js';
import moment from 'moment';
import NoAccess from './util/NoAccess.vue';
import TeamSelect from './util/TeamSelect.vue';
import TrainingTagSelect from './util/TrainingTagSelect.vue';
import Location from './Mission/Location.vue';
import LocationDropdown from './util/LocationDropdown.vue';
import MDEditorShim from './util/MDEditorShim.vue';
import {
    TablerBreadCrumb,
    TablerInput,
    TablerToggle,
    TablerLoading
} from '@tak-ps/vue-tabler';
import { reactive, watch, onMounted } from 'vue';
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

const loading = reactive({
    training: true
});
const training = reactive({
    title: '',
    required: false,
    body: '',
    tags: [],
    location: '',
    location_geom: null,
    start_ts: '',
    end_ts: '',
    teams: []
});

function is_iam(permission) { return iamHelper(props.iam, props.auth, permission); }

watch(() => training.start_ts, () => {
    if (training.start_ts && !training.end_ts) {
        training.end_ts = training.start_ts;
    }
});

async function fetch() {
    loading.training = true;
    const data = await window.std(`/api/training/${route.params.trainingid}`);

    data.start_ts = moment(data.start_ts).format('YYYY-MM-DDTHH:mm');
    data.end_ts = moment(data.end_ts).format('YYYY-MM-DDTHH:mm');

    Object.assign(training, data);
    loading.training = false;
}

async function create() {
    const body = JSON.parse(JSON.stringify(training));
    body.teams = body.teams.map((team) => { return team.id });
    body.tags = body.tags.map((tag) => { return tag.id });
    body.start_ts = moment(body.start_ts).toISOString();
    body.end_ts = moment(body.end_ts).toISOString();

    const created = await window.std('/api/training', {
        method: 'POST', body
    });

    router.push(`/training/${created.id}`);
}

async function deleteTraining() {
    await window.std(`/api/training/${training.id}`, {
        method: 'DELETE'
    });
    router.push(`/training`);
}

async function update() {
    const body = JSON.parse(JSON.stringify(training));
    body.teams = body.teams.map((team) => { return team.id });
    body.tags = body.tags.map((tag) => { return tag.id });
    body.start_ts = moment(body.start_ts).toISOString();
    body.end_ts = moment(body.end_ts).toISOString();

    const updated = await window.std(`/api/training/${training.id}`, {
        method: 'PATCH', body
    });

    router.push(`/training/${updated.id}`);
}

onMounted(async () => {
    if (route.params.trainingid && is_iam('Training:Manage')) {
        await fetch();
    } else {
        const url = new URL(window.location);

        if (url.searchParams.has('title')) {
            training.title = url.searchParams.get('title');
        }

        if (url.searchParams.has('start')) {
            training.start_ts = moment(url.searchParams.get('start')).format('YYYY-MM-DDTHH:mm');
        }

        if (url.searchParams.has('end')) {
            training.end_ts = moment(url.searchParams.get('end')).format('YYYY-MM-DDTHH:mm');
        }

        loading.training = false;
    }
});
</script>
