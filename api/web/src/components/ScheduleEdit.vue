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
                        v-if='!is_iam("Oncall:Admin")'
                        title='New Schedule'
                    />
                    <TablerLoading v-if='loading.schedule' />
                    <template v-else>
                        <div class='col-lg-12'>
                            <div class='card'>
                                <div class='card-body'>
                                    <div class='row row-cards'>
                                        <div class='col-md-12'>
                                            <TablerInput
                                                v-model='schedule.name'
                                                :error='errors.name'
                                                :required='true'
                                                label='Schedule Name'
                                                description='A Human Readable name for the schedule'
                                            />
                                        </div>
                                        <div class='col-md-12'>
                                            <TablerInput
                                                v-model='schedule.body'
                                                :rows='5'
                                                :error='errors.body'
                                                :required='true'
                                                label='Schedule Body'
                                                description='A Human Readable description for the schedule'
                                            />
                                        </div>
                                        <div class='col-md-12'>
                                            <TablerInput
                                                v-model='schedule.handoff'
                                                type='time'
                                                :error='errors.handoff'
                                                :required='true'
                                                label='Schedule Handoff'
                                                description='Default time at which Schedules change'
                                            />
                                        </div>
                                        <div class='col-md-6'>
                                            <label class='form-label'>Rotation Type</label>
                                            <select
                                                v-model='schedule.rotation_type'
                                                class='form-select'
                                            >
                                                <option value='none'>
                                                    None (Manual)
                                                </option>
                                                <option value='daily'>
                                                    Daily
                                                </option>
                                                <option value='weekly'>
                                                    Weekly
                                                </option>
                                                <option value='custom'>
                                                    Custom (Days)
                                                </option>
                                            </select>
                                            <small class='form-hint'>How shifts rotate among assigned members</small>
                                        </div>
                                        <div
                                            v-if='schedule.rotation_type !== "none"'
                                            class='col-md-6'
                                        >
                                            <TablerInput
                                                v-model='schedule.rotation_period'
                                                type='number'
                                                label='Rotation Period'
                                                :description='rotationPeriodDescription'
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div class='mx-4'>
                                    <UserSelect
                                        v-if='!$route.params.scheduleid'
                                        v-model='assigned'
                                        mode='card'
                                        label='Scheduled Users'
                                        :confirmed='true'
                                    />
                                </div>

                                <div
                                    v-if='$route.params.scheduleid && schedule.rotation_type !== "none"'
                                    class='card-body border-top'
                                >
                                    <h4 class='mb-3'>
                                        Generate Rotation
                                    </h4>
                                    <p class='text-muted'>
                                        Automatically create shift events by rotating through assigned members.
                                    </p>
                                    <div class='row row-cards'>
                                        <div class='col-md-5'>
                                            <TablerInput
                                                v-model='generate.start_date'
                                                type='date'
                                                label='Start Date'
                                            />
                                        </div>
                                        <div class='col-md-5'>
                                            <TablerInput
                                                v-model='generate.end_date'
                                                type='date'
                                                label='End Date'
                                            />
                                        </div>
                                        <div class='col-md-2 d-flex align-items-end'>
                                            <button
                                                class='btn btn-primary w-100'
                                                :disabled='generate.loading'
                                                @click='generateRotation'
                                            >
                                                <span
                                                    v-if='generate.loading'
                                                    class='spinner-border spinner-border-sm me-1'
                                                />
                                                Generate
                                            </button>
                                        </div>
                                    </div>
                                    <div
                                        v-if='generate.result'
                                        class='alert alert-success mt-3'
                                        v-text='generate.result'
                                    />
                                </div>

                                <div class='col-12 py-1 pb-4 px-4'>
                                    <div class='d-flex'>
                                        <a
                                            v-if='$route.params.scheduleid && is_iam("Oncall:Admin")'
                                            class='cursor-pointer btn btn-danger'
                                            @click='deleteSchedule'
                                        >
                                            Delete Schedule
                                        </a>
                                        <div class='ms-auto'>
                                            <a
                                                v-if='$route.params.scheduleid'
                                                class='cursor-pointer btn btn-primary'
                                                @click='update'
                                            >
                                                Update Schedule
                                            </a>
                                            <a
                                                v-else
                                                class='cursor-pointer btn btn-primary'
                                                @click='create'
                                            >
                                                Create Schedule
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
</template>

<script setup>
import iamHelper from '../iam.js';
import moment from 'moment';
import NoAccess from './util/NoAccess.vue';
import UserSelect from './util/UserSelect.vue';
import {
    TablerBreadCrumb,
    TablerInput,
    TablerLoading
} from '@tak-ps/vue-tabler';
import { reactive, ref, computed, onMounted } from 'vue';
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
    schedule: true
});
const errors = reactive({
    name: '',
    body: '',
    handoff: ''
});
const schedule = reactive({
    name: '',
    body: '',
    handoff: '06:00',
    rotation_type: 'none',
    rotation_period: 1
});
const assigned = ref([]);
const generate = reactive({
    start_date: moment().format('YYYY-MM-DD'),
    end_date: moment().add(4, 'weeks').format('YYYY-MM-DD'),
    loading: false,
    result: ''
});

const rotationPeriodDescription = computed(() => {
    if (schedule.rotation_type === 'daily') return 'Number of days per shift';
    if (schedule.rotation_type === 'weekly') return 'Number of weeks per shift';
    return 'Number of days per shift';
});

function is_iam(permission) { return iamHelper(props.iam, props.auth, permission); }

async function deleteSchedule() {
    loading.schedule = true;
    await window.std(`/api/schedule/${route.params.scheduleid}`, {
        method: 'DELETE',
    });

    loading.schedule = false;
    router.push('/schedule');
}

function validate() {
    for (const field of ['name', 'body', 'handoff']) {
        if (!schedule[field]) errors[field] = 'Cannot be empty';
        else errors[field] = '';
    }

    for (const e in errors) {
        if (errors[e]) return;
    }

    return true;
}

async function create() {
    if (!validate()) return;

    loading.schedule = true;
    const created = await window.std('/api/schedule', {
        method: 'POST',
        body: {
            ...schedule,
            assigned: assigned.value.map((a) => {
                return {
                    uid: a.id,
                    role: a.role
                }
            })
        }
    });

    loading.schedule = false;
    router.push(`/schedule/${created.id}`);
}

async function fetch() {
    loading.schedule = true;
    Object.assign(schedule, await window.std(`/api/schedule/${route.params.scheduleid}`));
    loading.schedule = false;
}

async function update() {
    if (!validate()) return;

    loading.schedule = true;
    await window.std(`/api/schedule/${route.params.scheduleid}`, {
        method: 'PATCH',
        body: {
            name: schedule.name,
            body: schedule.body,
            handoff: schedule.handoff,
            rotation_type: schedule.rotation_type,
            rotation_period: parseInt(schedule.rotation_period)
        }
    });

    loading.schedule = false;
    router.push(`/schedule/${route.params.scheduleid}`);
}

async function generateRotation() {
    generate.loading = true;
    generate.result = '';

    try {
        const result = await window.std(`/api/schedule/${route.params.scheduleid}/generate`, {
            method: 'POST',
            body: {
                start_date: generate.start_date,
                end_date: generate.end_date
            }
        });

        generate.result = result.message;
    } catch (err) {
        generate.result = err.message || 'Failed to generate rotation';
    }

    generate.loading = false;
}

onMounted(async () => {
    if (route.params.scheduleid && is_iam('Oncall:Admin')) {
        await fetch();
    } else {
        loading.schedule = false;
    }
});
</script>
