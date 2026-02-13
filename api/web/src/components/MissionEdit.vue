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
                        v-if='!is_iam("Mission:Manage")'
                        title='New Mission'
                    />
                    <TablerLoading v-if='loading.mission' />
                    <template v-else>
                        <div class='col-lg-12'>
                            <div class='card'>
                                <div class='card-header'>
                                    <h1
                                        class='card-title'
                                        v-text='mission.title || "Mission Editor"'
                                    />
                                </div>
                                <div class='card-body'>
                                    <div class='row row-cards'>
                                        <div class='col-12 col-md-8 row'>
                                            <div class='col-12 col-md-8'>
                                                <TablerInput
                                                    v-model='mission.title'
                                                    :error='errors.title'
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
                                            <div class='col-12 col-md-6'>
                                                <TablerInput
                                                    v-model='mission.start_ts'
                                                    type='datetime-local'
                                                    :required='true'
                                                    :error='errors.start_ts'
                                                    label='Mission Start'
                                                />
                                            </div>
                                            <div class='col-12 col-md-6'>
                                                <TablerInput
                                                    v-model='mission.end_ts'
                                                    type='datetime-local'
                                                    :required='true'
                                                    :error='errors.end_ts'
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
                                        </div>
                                        <div class='col-12 col-md-12'>
                                            <MdEditor
                                                v-model='mission.body'
                                                :preview='false'
                                                no-upload-img
                                                no-mermaid
                                                :no-katex='true'
                                                :toolbars-exclude='[
                                                    "save",
                                                    "prettier",
                                                    "mermaid"
                                                ]'
                                                language='en-US'
                                            />
                                        </div>
                                        <div class='col-md-12'>
                                            <LocationDropdown
                                                v-model='mission.location'
                                                :error='errors.location'
                                                :required='true'
                                                @loc-geom='mission.location_geom = $event'
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
                        <div
                            v-if='!$route.params.missionid'
                            class='col-lg-12'
                        >
                            <UserPresentSelect
                                v-model='assigned'
                                :confirmed='true'
                            />
                        </div>
                        <div class='col-lg-12'>
                            <div class='card'>
                                <div class='card-body'>
                                    <div class='col-md-12'>
                                        <div class='d-flex'>
                                            <a
                                                v-if='$route.params.missionid && is_iam("Mission:Admin")'
                                                class='cursor-pointer btn btn-danger'
                                                @click='deleteMission'
                                            >
                                                Delete Mission
                                            </a>
                                            <div class='ms-auto'>
                                                <a
                                                    v-if='$route.params.missionid'
                                                    class='cursor-pointer btn btn-primary'
                                                    @click='update'
                                                >
                                                    Update Mission
                                                </a>
                                                <a
                                                    v-else
                                                    class='cursor-pointer btn btn-primary'
                                                    @click='create'
                                                >
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
import moment from 'moment';
import NoAccess from './util/NoAccess.vue';
import UserPresentSelect from './util/UserPresentSelect.vue';
import Location from './Mission/Location.vue';
import LocationDropdown from './util/LocationDropdown.vue';
import TeamSelect from './util/TeamSelect.vue';
import MissionTagSelect from './util/MissionTagSelect.vue';
import { MdEditor } from 'md-editor-v3';
import 'md-editor-v3/lib/style.css';
import {
    TablerBreadCrumb,
    TablerInput,
    TablerLoading
} from '@tak-ps/vue-tabler';

export default {
    name: 'MissionEdit',
    components: {
        Location,
        MdEditor,
        TablerInput,
        LocationDropdown,
        UserPresentSelect,
        TablerLoading,
        TablerBreadCrumb,
        MissionTagSelect,
        TeamSelect,
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
                tags: [],
            },
            assigned: []
        }
    },
    watch: {
        'mission.start_ts': function() {
            if (this.mission.start_ts && !this.mission.end_ts) {
                this.mission.end_ts = this.mission.start_ts;
            }
        }
    },
    mounted: async function() {
        if (this.$route.params.missionid && this.is_iam('Mission:Manage')) {
            await this.fetch();
        } else {
            const url = new URL(window.location);

            if (url.searchParams.has('title')) {
                this.mission.title = url.searchParams.get('title')
            }

            if (url.searchParams.has('start')) {
                this.mission.start_ts = moment(url.searchParams.get('start')).format('YYYY-MM-DDTHH:mm');
            }

            if (url.searchParams.has('end')) {
                this.mission.end_ts = moment(url.searchParams.get('end')).format('YYYY-MM-DDTHH:mm');
            }

            this.loading.mission = false;
        }
    },
    methods: {
        is_iam: function(permission) { return iam(this.iam, this.auth, permission) },
        deleteMission: async function() {
            this.loading.mission = true;
            await window.std(`/api/mission/${this.$route.params.missionid}`, {
                method: 'DELETE',
            });

            this.loading.mission = false;
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
                } catch {
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

            try {
                this.loading.mission = true;
                const update = await window.std(`/api/mission/${this.$route.params.missionid}`, {
                    method: 'PATCH',
                    body: {
                        title: this.mission.title,
                        externalid: this.mission.externalid,
                        body: this.mission.body,
                        location: this.mission.location,
                        location_geom: this.mission.location_geom,
                        start_ts: moment(this.mission.start_ts).toISOString(),
                        end_ts: moment(this.mission.end_ts).toISOString(),
                        teams: this.mission.teams.map((team) => { return team.id }),
                        tags: this.mission.tags.map((tag) => { return tag.id }),
                    }
                });

                this.$router.push(`/mission/${update.id}`);
            } catch (err) {
                console.error(err);
            } finally {
                this.loading.mission = false;
            }
        },
        create: async function() {
            if (!this.validate()) return;

            this.loading.mission = true;

            const create = await window.std('/api/mission', {
                method: 'POST',
                body: {
                    ...this.mission,
                    start_ts: moment(this.mission.start_ts).toISOString(),
                    end_ts: moment(this.mission.end_ts).toISOString(),
                    teams: this.mission.teams.map((team) => { return team.id }),
                    tags: this.mission.tags.map((tag) => { return tag.id }),
                    assigned: this.assigned.map((a) => {
                        return {
                            uid: a.id,
                            role: a.role || 'General',
                            confirmed: a.confirmed || true
                        }
                    })
                }
            });

            this.loading.mission = false;
            this.$router.push(`/mission/${create.id}`);
        },
        fetch: async function() {
            this.loading.mission = true;
            const mission = await window.std(`/api/mission/${this.$route.params.missionid}`);

            mission.start_ts = moment(mission.start_ts).format('YYYY-MM-DDTHH:mm');
            mission.end_ts = moment(mission.end_ts).format('YYYY-MM-DDTHH:mm');

            this.mission = mission;
            this.loading.mission = false;
        },
    }
}
</script>
