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
                        v-if='!is_iam("Training:View")'
                        title='Training'
                    />
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
                                    <p>You aren't marked as present for this training. If this is incorrect, request to be added to the training roster</p>
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
                            <TablerLoading v-if='loading.training' />
                            <div
                                v-else
                                class='card'
                            >
                                <div class='card-header'>
                                    <div class='row col-12'>
                                        <div class='col-12 d-flex align-items-center'>
                                            <h3
                                                class='card-title'
                                                v-text='`${training.title} @ ${training.location || "Unknown"}`'
                                            />
                                            <span
                                                v-if='training.required'
                                                class='mx-2 badge bg-red text-white'
                                                style='height: 20px;'
                                            >Required</span>

                                            <div class='ms-auto btn-list'>
                                                <TablerEpochRange
                                                    :start='training.start_ts'
                                                    :end='training.end_ts'
                                                />
                                                <TablerIconButton
                                                    v-if='is_iam("Training:Manage")'
                                                    title='Edit Training'
                                                    @click='$router.push(`/training/${$route.params.trainingid}/edit`)'
                                                >
                                                    <IconPencil
                                                        :size='24'
                                                        :stroke='1'
                                                    />
                                                </TablerIconButton>
                                            </div>
                                        </div>
                                        <div
                                            v-if='training.teams.length'
                                            class='mt-2'
                                        >
                                            <template
                                                v-for='team in training.teams'
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
                                            :markdown='training.body'
                                        />

                                        <div class='col-12 datagrid'>
                                            <div
                                                v-if='training.end_ts < +new Date()'
                                                class='datagrid-item'
                                            >
                                                <div class='datagrid-title'>
                                                    Personnel
                                                </div>
                                                <div
                                                    class='datagrid-content'
                                                    v-text='training.users.length'
                                                />
                                            </div>
                                            <div
                                                v-if='training.end_ts < +new Date()'
                                                class='datagrid-item'
                                            >
                                                <div class='datagrid-title'>
                                                    Man-Hours
                                                </div>
                                                <div
                                                    class='datagrid-content'
                                                    v-text='Math.round(training.users.length * (training.end_ts - training.start_ts) / 1000 / 60 / 60)'
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <Location
                                    v-if='training.location_geom'
                                    v-model='training.location_geom'
                                    :search='false'
                                />
                            </div>
                        </div>

                        <div
                            v-if='!loading.training'
                            class='col-lg-6'
                        >
                            <TrainingAssets
                                :training='training'
                                :iam='iam'
                                :auth='auth'
                                @refresh='fetch'
                            />
                        </div>

                        <div
                            v-if='!loading.training'
                            class='col-lg-6'
                        >
                            <UserPresentSelect
                                v-model='assigned'
                                label='Training Roster'
                                :disabled='!is_iam("Training:Manage")'
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

<script>
import iam from '../iam.js';
import NoAccess from './util/NoAccess.vue';
import Location from './Mission/Location.vue';
import TrainingAssets from './Training/Assets.vue';
import UserPresentSelect from './util/UserPresentSelect.vue';
import TeamBadge from './util/TeamBadge.vue';
import {
    IconPencil
} from '@tabler/icons-vue';
import {
    TablerEpochRange,
    TablerBreadCrumb,
    TablerMarkdown,
    TablerLoading,
    TablerIconButton
} from '@tak-ps/vue-tabler';

export default {
    name: 'TrainingsNew',
    components: {
        TablerEpochRange,
        TeamBadge,
        Location,
        TrainingAssets,
        IconPencil,
        TablerIconButton,
        UserPresentSelect,
        TablerLoading,
        TablerBreadCrumb,
        TablerMarkdown,
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
                assigned: true,
                request: false,
                training: true
            },
            assigned: [],
            training: {
                title: '',
                body: '',
                start_ts: '',
                end_ts: ''
            }
        }
    },
    computed: {
        is_roster: function() {
            if (this.training.start_ts > +new Date()) return false;
            if (this.training.start_ts < +new Date() - (604800000 * 2)) return false; //Only request in last 2 weeks

            return this.assigned.every((a) => {
                return a.uid != this.auth.id;
            });
        }
    },
    mounted: async function() {
        if (this.is_iam('Training:View')) {
            await this.fetch();
            await this.fetchAssigned();
        }
    },
    methods: {
        is_iam: function(permission) { return iam(this.iam, this.auth, permission) },
        fetch: async function() {
            this.loading.training = true;
            this.training = await window.std(`/api/training/${this.$route.params.trainingid}`);
            this.loading.training = false;
        },
        fetchAssigned: async function() {
            this.loading.assigned = true;
            this.assigned = (await window.std(`/api/training/${this.$route.params.trainingid}/assigned`)).items;
            this.loading.assigned = false;
        },
        request: async function() {
            this.loading.request = true;
            await window.std(`/api/training/${this.$route.params.trainingid}/assigned/request`, {
                method: 'POST'
            })

            await this.fetchAssigned();

            this.loading.request = false;
        },
        deleteAssigned: async function(user) {
            await window.std(`/api/training/${this.$route.params.trainingid}/assigned/${user.id}`, {
                method: 'DELETE'
            })
        },
        patchAssigned: async function(user) {
            await window.std(`/api/training/${this.$route.params.trainingid}/assigned/${user.id}`, {
                method: 'PATCH',
                body: {
                    role: user.role,
                    confirmed: user.confirmed
                }
            })
        },
        postAssigned: async function(user) {
            this.loading.assigned = true;
            await window.std(`/api/training/${this.$route.params.trainingid}/assigned`, {
                method: 'POST',
                body: {
                    uid: user.id
                }
            })

            await this.fetchAssigned();
        },
    }
}
</script>
