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
                                                <IconSettings
                                                    v-if='is_iam("Mission:Manage")'
                                                    size='24'
                                                    stroke='1'
                                                    class='cursor-pointer'
                                                    @click='$router.push(`/mission/${$route.params.missionid}/edit`)'
                                                />
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
                            <UserPresentSelect
                                v-model='assigned'
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
import Assets from './Mission/Assets.vue';
import UserPresentSelect from './util/UserPresentSelect.vue';
import TeamBadge from './util/TeamBadge.vue';
import {
    TablerEpochRange,
    TablerBreadCrumb,
    TablerMarkdown,
    TablerLoading
} from '@tak-ps/vue-tabler';
import {
    IconSettings,
} from '@tabler/icons-vue';

export default {
    name: 'Mission',
    components: {
        TablerEpochRange,
        IconSettings,
        Location,
        UserPresentSelect,
        TablerBreadCrumb,
        TablerLoading,
        TablerMarkdown,
        TeamBadge,
        NoAccess,
        Assets
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
                mission: true,
                assigned: true
            },
            mission: {
                title: '',
                body: '',
                start_ts: '',
                end_ts: '',
                teams: [],
                assets: [],
                assets_id: []
            },
            assigned: []
        }
    },
    computed: {
        is_roster: function() {
            if (this.mission.start_ts > +new Date()) return false;
            if (this.mission.start_ts < +new Date() - 604800000) return false; //Only request in last week

            return this.assigned.every((a) => {
                return a.uid != this.auth.id;
            });
        }
    },
    mounted: async function() {
        await window.std('/api/location');

        if (this.is_iam("Mission:View")) {
            await this.fetch();
            await this.fetchAssigned();
        }
    },
    methods: {
        is_iam: function(permission) { return iam(this.iam, this.auth, permission) },
        fetch: async function() {
            this.loading.mission = true;
            this.mission = await window.std(`/api/mission/${this.$route.params.missionid}`);
            this.loading.mission = false;
        },
        request: async function() {
            this.loading.request = true;
            await window.std(`/api/mission/${this.$route.params.missionid}/assigned/request`, {
                method: 'POST'
            })

            await this.fetchAssigned();

            this.loading.request = false;
        },
        fetchAssigned: async function() {
            this.loading.assigned = true;
            this.assigned = (await window.std(`/api/mission/${this.$route.params.missionid}/assigned`)).items;
            this.loading.assigned = false;
        },
        deleteAssigned: async function(user) {
            this.loading.assigned = true;

            await window.std(`/api/mission/${this.$route.params.missionid}/assigned/${user.id}`, {
                method: 'DELETE'
            })

            await this.fetchAssigned();
        },
        patchAssigned: async function(user) {
            this.loading.assigned = true;
            await window.std(`/api/mission/${this.$route.params.missionid}/assigned/${user.id}`, {
                method: 'PATCH',
                body: {
                    role: user.role,
                    confirmed: user.confirmed
                }
            })

            await this.fetchAssigned();
        },
        postAssigned: async function(user) {
            this.loading.assigned = true;
            await window.std(`/api/mission/${this.$route.params.missionid}/assigned`, {
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
