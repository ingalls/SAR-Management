<template>
<div>
    <div class='page-wrapper'>
        <div class="page-header d-print-none">
            <div class="container-xl">
                <div class="row g-2 align-items-center">
                    <div class="col d-flex">
                        <TablerBreadCrumb/>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class='page-body'>
        <div class='container-xl'>
            <div class='row row-deck row-cards'>
                <NoAccess v-if='!is_iam("Mission:View")' title='Mission'/>
                <TablerLoading v-if='loading.mission'/>
                <template v-else>
                    <div v-if='!loading.assigned && is_roster' class="col-lg-12">
                        <div class='card'>
                            <div class="alert alert-info alert-dismissible" role="alert">
                                <h3 class="mb-1">Roster Correction</h3>
                                <p>You aren't marked as present for this mission. If this is incorrect, request to be added to the mission roster</p>
                                <div class='d-flex'>
                                    <div class='ms-auto'>
                                        <a href="#" class="btn btn-info">Request Inclusion</a>
                                    </div>
                                </div>
                                <a class="btn-close" data-bs-dismiss="alert" aria-label="close"></a>
                            </div>
                        </div>
                    </div>

                    <div class="col-lg-12">
                        <div class="card">
                            <div class='card-header'>
                                <div class='row col-12'>
                                    <div class='col-12 d-flex'>
                                        <div>
                                            <div class='card-title' v-text='`${mission.title}`'></div>
                                            <div class='subheader' v-text='`${mission.location || "Location Unknown"} - ${mission.externalid || "No Mission Number"}`'></div>
                                        </div>

                                        <div class='ms-auto btn-list'>
                                            <TablerEpochRange :start='mission.start_ts' :end='mission.end_ts'/>
                                            <SettingsIcon v-if='is_iam("Mission:Manage")' @click='$router.push(`/mission/${$route.params.missionid}/edit`)' height='24' width='24' class='cursor-pointer'/>
                                        </div>
                                    </div>
                                    <div v-if='mission.teams.length' class='col-12 mt-2 btn-list'>
                                        <template v-for='team in mission.teams'>
                                            <TeamBadge :team='team'/>
                                        </template>
                                    </div>
                                </div>
                            </div>
                            <div class="card-body">
                                <div class='row row-cards'>
                                    <TablerMarkdown class='col-md-12' :markdown='mission.body'/>

                                    <div class='col-12 datagrid'>
                                        <div v-if='mission.end_ts < +new Date()' class="datagrid-item">
                                            <div class="datagrid-title">Personnel</div>
                                            <div class="datagrid-content" v-text='mission.users.length'></div>
                                        </div>
                                        <div v-if='mission.end_ts < +new Date()' class="datagrid-item">
                                            <div class="datagrid-title">Man-Hours</div>
                                            <div class="datagrid-content" v-text='Math.round(mission.users.length * (mission.end_ts - mission.start_ts) / 1000 / 60 / 60)'></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <Location v-if='mission.location_geom' v-model='mission.location_geom' :search='false'/>
                        </div>
                    </div>

                    <div class="col-lg-12" v-if='!loading.mission'>
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
import UserPresentSelect from './util/UserPresentSelect.vue';
import TeamBadge from './util/TeamBadge.vue';
import {
    TablerEpochRange,
    TablerBreadCrumb,
    TablerMarkdown,
    TablerLoading
} from '@tak-ps/vue-tabler';
import {
    SettingsIcon
} from 'vue-tabler-icons';

export default {
    name: 'Mission',
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
                teams: []
            },
            assigned: []
        }
    },
    mounted: async function() {
        await window.std('/api/location');

        if (this.is_iam("Mission:View")) {
            await this.fetch();
            await this.fetchAssigned();
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
    methods: {
        is_iam: function(permission) { return iam(this.iam, this.auth, permission) },
        fetch: async function() {
            this.loading.mission = true;
            this.mission = await window.std(`/api/mission/${this.$route.params.missionid}`);
            this.loading.mission = false;
        },
        fetchAssigned: async function() {
            this.loading.assigned = true;
            this.assigned = (await window.std(`/api/mission/${this.$route.params.missionid}/assigned`)).assigned;
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
    },
    components: {
        TablerEpochRange,
        SettingsIcon,
        Location,
        UserPresentSelect,
        TablerBreadCrumb,
        TablerLoading,
        TablerMarkdown,
        TeamBadge,
        NoAccess
    }
}
</script>
