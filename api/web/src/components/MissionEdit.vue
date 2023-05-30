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
                <NoAccess v-if='!is_iam("Mission:Manage")' title='New Mission'/>
                <TablerLoading v-if='mission.loading'/>
                <template v-else>
                    <div class="col-lg-12">
                        <div class="card">
                            <div class="card-body">
                                <div class='row row-cards'>
                                    <div class="col-md-8">
                                        <TablerInput v-model='mission.title' label='Mission Title'/>
                                    </div>
                                    <div class="col-md-4">
                                        <TablerInput v-model='mission.externalid' label='Mission Number'/>
                                    </div>
                                    <div class="col-md-6">
                                        <TablerInput type='datetime-local' v-model='mission.start_ts' label='Mission Start'/>
                                    </div>
                                    <div class="col-md-6">
                                        <TablerInput type='datetime-local' v-model='mission.end_ts' label='Mission End'/>
                                    </div>
                                    <div class="col-md-12">
                                        <TablerInput v-model='mission.body' :rows='6' label='Mission Report'/>
                                    </div>
                                    <div class='col-md-12'>
                                        <LocationDropdown @locGeom='mission.location_geom = $event' v-model='mission.location'/>
                                    </div>
                                    <div class='col-md-12'>
                                        <Location v-model='mission.location_geom' :disabled='false'/>
                                    </div>

                                </div>
                            </div>
                        </div>
                    </div>
                    <div v-if='!$route.params.missionid' class="col-lg-12">
                        <UserPresentSelect
                            :confirmed='true'
                            v-model='assigned'
                        />
                    </div>
                    <div class="col-lg-12">
                        <div class="card">
                            <div class="card-body">
                                <div class="col-md-12">
                                    <div class='d-flex'>
                                        <a v-if='$route.params.missionid && is_iam("Mission:Admin")' @click='deleteMission' class="cursor-pointer btn btn-danger">
                                            Delete Mission
                                        </a>
                                        <div class='ms-auto'>

                                            <a v-if='$route.params.missionid' @click='update' class="cursor-pointer btn btn-primary">
                                                Update Mission
                                            </a>
                                            <a v-else @click='create' class="cursor-pointer btn btn-primary">
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

<script>
import iam from '../iam.js';
import NoAccess from './util/NoAccess.vue';
import UserPresentSelect from './util/UserPresentSelect.vue';
import Location from './Mission/Location.vue';
import LocationDropdown from './util/LocationDropdown.vue';
import {
    TablerBreadCrumb,
    TablerInput,
    TablerLoading
} from '@tak-ps/vue-tabler';

export default {
    name: 'MissionEdit',
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
                mission: true
            },
            mission: {
                title: '',
                location: '',
                body: '',
                start_ts: '',
                end_ts: '',
                externalid: ''
            },
            assigned: []
        }
    },
    mounted: async function() {
        if (this.$route.params.missionid && this.is_iam('Mission:Manage')) {
            await this.fetch();
        } else {
            this.loading.mission = false;
        }
    },
    methods: {
        is_iam: function(permission) { return iam(this.iam, this.auth, permission) },
        deleteMission: async function() {
            this.loading = true;
            await window.std(`/api/mission/${this.$route.params.missionid}`, {
                method: 'DELETE',
            });

            this.loading = false;
            this.$router.push('/mission');
        },
        update: async function() {
            this.loading = true;
            const update = await window.std(`/api/mission/${this.$route.params.missionid}`, {
                method: 'PATCH',
                body: this.mission
            });

            this.loading = false;
            this.$router.push(`/mission/${update.id}`);
        },
        create: async function() {
            this.loading = true;
            const create = await window.std('/api/mission', {
                method: 'POST',
                body: {
                    ...this.mission,
                    assigned: this.assigned.map((a) => {
                        return {
                            uid: a.id,
                            role: a.role || 'General',
                            confirmed: a.confirmed || true
                        }
                    })
                }
            });

            this.loading = false;
            this.$router.push(`/mission/${create.id}`);
        },
        fetch: async function() {
            this.loading.mission = true;
            const mission = await window.std(`/api/mission/${this.$route.params.missionid}`);

            mission.start_ts = (new Date(mission.start_ts)).toISOString().replace(/:\d+\.\d+[A-Z]/, '');
            mission.end_ts = (new Date(mission.end_ts)).toISOString().replace(/:\d+\.\d+[A-Z]/, '');

            this.mission = mission;
            this.loading.mission = false;
        },
    },
    components: {
        Location,
        TablerInput,
        LocationDropdown,
        UserPresentSelect,
        TablerLoading,
        TablerBreadCrumb,
        NoAccess
    }
}
</script>
