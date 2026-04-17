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
                                    <UserPresentSelect
                                        v-if='!$route.params.scheduleid'
                                        v-model='assigned'
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

<script>
import iam from '../iam.js';
import moment from 'moment';
import NoAccess from './util/NoAccess.vue';
import UserPresentSelect from './util/UserPresentSelect.vue';
import {
    TablerBreadCrumb,
    TablerInput,
    TablerLoading
} from '@tak-ps/vue-tabler';

export default {
    name: 'ScheduleEdit',
    components: {
        TablerInput,
        UserPresentSelect,
        TablerLoading,
        TablerBreadCrumb,
        NoAccess
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
            loading: {
                schedule: true
            },
            errors: {
                name: '',
                body: '',
                handoff: ''
            },
            schedule: {
                name: '',
                body: '',
                handoff: '06:00',
                rotation_type: 'none',
                rotation_period: 1
            },
            assigned: [],
            generate: {
                start_date: moment().format('YYYY-MM-DD'),
                end_date: moment().add(4, 'weeks').format('YYYY-MM-DD'),
                loading: false,
                result: ''
            }
        }
    },
    computed: {
        rotationPeriodDescription: function() {
            if (this.schedule.rotation_type === 'daily') return 'Number of days per shift';
            if (this.schedule.rotation_type === 'weekly') return 'Number of weeks per shift';
            return 'Number of days per shift';
        }
    },
    mounted: async function() {
        if (this.$route.params.scheduleid && this.is_iam('Oncall:Admin')) {
            await this.fetch();
        } else {
            this.loading.schedule = false;
        }
    },
    methods: {
        is_iam: function(permission) { return iam(this.iam, this.auth, permission) },
        deleteSchedule: async function() {
            this.loading = true;
            await window.std(`/api/schedule/${this.$route.params.scheduleid}`, {
                method: 'DELETE',
            });

            this.loading = false;
            this.$router.push('/schedule');
        },
        validate: function() {
            for (const field of ['name', 'body', 'handoff']) {
                if (!this.schedule[field]) this.errors[field] = 'Cannot be empty';
                else this.errors[field] = '';
            }

            for (const e in this.errors) {
                if (this.errors[e]) return;
            }

            return true;
        },
        create: async function() {
            if (!this.validate()) return;

            this.loading = true;
            const create = await window.std('/api/schedule', {
                method: 'POST',
                body: {
                    ...this.schedule,
                    assigned: this.assigned.map((a) => {
                        return {
                            uid: a.id,
                            role: a.role
                        }
                    })
                }
            });

            this.loading = false;
            this.$router.push(`/schedule/${create.id}`);
        },
        fetch: async function() {
            this.loading.schedule = true;
            this.schedule = await window.std(`/api/schedule/${this.$route.params.scheduleid}`);
            this.loading.schedule = false;
        },
        update: async function() {
            if (!this.validate()) return;

            this.loading.schedule = true;
            await window.std(`/api/schedule/${this.$route.params.scheduleid}`, {
                method: 'PATCH',
                body: {
                    name: this.schedule.name,
                    body: this.schedule.body,
                    handoff: this.schedule.handoff,
                    rotation_type: this.schedule.rotation_type,
                    rotation_period: parseInt(this.schedule.rotation_period)
                }
            });

            this.loading.schedule = false;
            this.$router.push(`/schedule/${this.$route.params.scheduleid}`);
        },
        generateRotation: async function() {
            this.generate.loading = true;
            this.generate.result = '';

            try {
                const result = await window.std(`/api/schedule/${this.$route.params.scheduleid}/generate`, {
                    method: 'POST',
                    body: {
                        start_date: this.generate.start_date,
                        end_date: this.generate.end_date
                    }
                });

                this.generate.result = result.message;
            } catch (err) {
                this.generate.result = err.message || 'Failed to generate rotation';
            }

            this.generate.loading = false;
        }
    }
}
</script>
