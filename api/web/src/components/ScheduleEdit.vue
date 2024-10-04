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
                        v-if='!is_iam("Schedule:Admin")'
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

                                <div class='col-12 py-1 pb-4 px-4'>
                                    <div class='d-flex'>
                                        <a
                                            v-if='$route.params.scheduleid && is_iam("Schedule:Admin")'
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
                handoff: '06:00'
            },
            assigned: []
        }
    },
    mounted: async function() {
        if (this.$route.params.scheduleid && this.is_iam('Schedule:Admin')) {
            await this.fetch();
        } else {
            this.loading.schedule = false;
        }
    },
    methods: {
        is_iam: function(permission) { return iam(this.iam, this.auth, permission) },
        deleteMission: async function() {
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
        update: async function() {
            if (!this.validate()) return;

            this.loading = true;
            const update = await window.std(`/api/schedule/${this.$route.params.scheduleid}`, {
                method: 'PATCH',
                body: this.schedule
            });

            this.loading = false;
            this.$router.push(`/schedule/${this.schedule.id}`);
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
    }
}
</script>
