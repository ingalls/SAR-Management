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
                <TablerLoading v-if='loading.mission'/>
                <template v-else>
                    <div class="col-lg-12">
                        <div class="card">
                            <div class='card-header'>
                                <h1 class='card-title' v-text='mission.title || "Mission Editor"'></h1>
                            </div>
                            <div class="card-body">
                                <div class='row row-cards'>
                                    <div class='col-12 col-md-8 row'>
                                        <div class="col-12 col-md-8">
                                            <TablerInput
                                                v-model='mission.title'
                                                :error='errors.title'
                                                :required='true'
                                                label='Mission Title'
                                                description='A Human Readable name for the mission'
                                            />
                                        </div>
                                        <div class="col-12 col-md-4">
                                            <TablerInput
                                                v-model='mission.externalid'
                                                label='Mission Number'
                                                description='A CAD number or similiar External ID'
                                            />
                                        </div>
                                        <div class="col-12 col-md-6">
                                            <TablerInput
                                                type='datetime-local'
                                                :required='true'
                                                :error='errors.start_ts'
                                                v-model='mission.start_ts'
                                                label='Mission Start'
                                            />
                                        </div>
                                        <div class="col-12 col-md-6">
                                            <TablerInput
                                                type='datetime-local'
                                                :required='true'
                                                :error='errors.end_ts'
                                                v-model='mission.end_ts'
                                                label='Mission End'
                                            />
                                        </div>
                                    </div>
                                    <div class="col-12 col-md-4">
                                        <TeamSelect
                                            v-model='mission.teams'
                                            label='Assigned'
                                            :fieldable='true'
                                        />
                                    </div>
                                    <div class="col-12 col-md-12">
                                        <MdEditor
                                            :preview='false' noUploadImg noMermaid
                                            :noKatex='true'
                                            :toolbarsExclude='[
                                                "save",
                                                "prettier",
                                                "mermaid"
                                            ]'
                                            language='en-US'
                                            v-model="mission.body"
                                        />
                                    </div>
                                    <div class='col-md-12'>
                                        <LocationDropdown
                                            @locGeom='mission.location_geom = $event'
                                            :error='errors.location'
                                            :required='true'
                                            v-model='mission.location'
                                        />
                                    </div>
                                    <div class='col-md-12'>
                                        <Location
                                            v-model='mission.location_geom'
                                            :disabled='false'
                                        />
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
import TeamSelect from './util/TeamSelect.vue';
import { MdEditor } from 'md-editor-v3';
import 'md-editor-v3/lib/style.css';
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
            errors: {
                title: '',
                body: '',
                start_ts: '',
                end_ts: '',
                location_geom: '',
                location: ''
            },
            mission: {
                title: '',
                location: '',
                body: '',
                start_ts: '',
                end_ts: '',
                externalid: '',
                location_geom: null,
                teams: [],
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
        validate: function() {
            for (const field of ['title', 'location', 'body', 'location']) {
                if (!this.mission[field]) this.errors[field] = 'Cannot be empty';
                else this.errors[field] = '';
            }

            for (const field of ['start_ts', 'end_ts']) {
                if (!this.mission[field]) {
                    this.errors[field] = 'Cannot be empty';
                    continue;
                }

                try {
                    new Date(this.mission[field]);
                    this.errors[field] = '';
                } catch (err) {
                    this.errors[field] = 'Invalid Date';
                }
            }

            for (const e in this.errors) {
                if (this.errors[e]) return;
            }

            if (!this.mission.location_geom) throw new Error('A Location Geometry must be selected');

            return true;
        },
        update: async function() {
            if (!this.validate()) return;

            this.loading = true;
            const update = await window.std(`/api/mission/${this.$route.params.missionid}`, {
                method: 'PATCH',
                body: {
                    ...this.mission,
                    teams: this.mission.teams.map((team) => { return team.id }),
                }
            });

            this.loading = false;
            this.$router.push(`/mission/${update.id}`);
        },
        create: async function() {
            if (!this.validate()) return;

            this.loading = true;

            const create = await window.std('/api/mission', {
                method: 'POST',
                body: {
                    ...this.mission,
                    teams: this.mission.teams.map((team) => { return team.id }),
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
        MdEditor,
        TablerInput,
        LocationDropdown,
        UserPresentSelect,
        TablerLoading,
        TablerBreadCrumb,
        TeamSelect,
        NoAccess
    }
}
</script>
