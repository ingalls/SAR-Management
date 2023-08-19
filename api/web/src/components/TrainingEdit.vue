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
                <div class="col-lg-12">
                    <NoAccess v-if='!is_iam("Training:Manage")' title='Edit Training'/>
                    <div v-else class="card">
                        <TablerLoading v-if='loading.training'/>
                        <template v-else>
                            <div class='card-header'>
                                <h1 class='card-title' v-text='training.title || "Training Editor"'></h1>
                                <div class='ms-auto'>
                                    <TablerToggle label='Required Training' v-model='training.required'/>
                                </div>
                            </div>
                            <div class="card-body">
                                <div class='row row-cards'>
                                    <div class="col-12 col-md-8">
                                        <TablerInput v-model='training.title' label='Training Title'/>
                                        <TablerInput type='datetime-local' v-model='training.start_ts' label='Training Start'/>
                                        <TablerInput type='datetime-local' v-model='training.end_ts' label='Training End'/>
                                    </div>
                                    <div class="col-12 col-md-4">
                                        <TeamSelect
                                            v-model='training.teams'
                                            label='Assigned'
                                        />
                                    </div>
                                    <div class="col-md-12">
                                        <TablerInput v-model='training.body' :rows='6' label='Training Summary'/>
                                    </div>
                                    <div class='col-md-12'>
                                        <LocationDropdown @locGeom='training.location_geom = $event' v-model='training.location'/>
                                    </div>
                                    <div class='col-md-12'>
                                        <Location v-model='training.location_geom' :disabled='false'/>
                                    </div>

                                    <div class="col-md-12">
                                        <div class='d-flex'>
                                            <a v-if='$route.params.trainingid && is_iam("Training:Admin")' @click='deleteTraining' class="cursor-pointer btn btn-danger">
                                                Delete Training
                                            </a>
                                            <div class='ms-auto'>

                                                <a v-if='$route.params.trainingid' @click='update' class="cursor-pointer btn btn-primary">
                                                    Update Training
                                                </a>
                                                <a v-else @click='create' class="cursor-pointer btn btn-primary">
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

<script>
import iam from '../iam.js';
import NoAccess from './util/NoAccess.vue';
import TeamSelect from './util/TeamSelect.vue';
import Location from './Mission/Location.vue';
import LocationDropdown from './util/LocationDropdown.vue';
import {
    TablerBreadCrumb,
    TablerInput,
    TablerToggle,
    TablerLoading
} from '@tak-ps/vue-tabler';

export default {
    name: 'TrainingsEdit',
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
                training: true
            },
            training: {
                title: '',
                required: false,
                body: '',
                location: '',
                location_geom: null,
                start_ts: '',
                end_ts: '',
                teams: []
            }
        }
    },
    mounted: async function() {
        if (this.$route.params.trainingid && this.is_iam('Training:Manage')) {
            await this.fetch();
        } else {
            this.loading.training = false;
        }
    },
    methods: {
        is_iam: function(permission) { return iam(this.iam, this.auth, permission) },
        fetch: async function() {
            this.loading.training = true;
            const training = await window.std(`/api/training/${this.$route.params.trainingid}`);

            training.start_ts = (new Date(training.start_ts)).toISOString().replace(/:\d+\.\d+[A-Z]/, '');
            training.end_ts = (new Date(training.end_ts)).toISOString().replace(/:\d+\.\d+[A-Z]/, '');

            this.training = training;
            this.loading.training = false;
        },
        create: async function() {
            const body = JSON.parse(JSON.stringify(this.training));
            body.teams = body.teams.map((team) => { return team.id });

            const create = await window.std('/api/training', {
                method: 'POST', body
            });

            this.$router.push(`/training/${create.id}`);
        },
        deleteTraining: async function() {
            await window.std(`/api/training/${this.training.id}`, {
                method: 'DELETE'
            });
            this.$router.push(`/training`);
        },
        update: async function() {
            const body = JSON.parse(JSON.stringify(this.training));
            body.teams = body.teams.map((team) => { return team.id });

            const create = await window.std(`/api/training/${this.training.id}`, {
                method: 'PATCH', body
            });

            this.$router.push(`/training/${create.id}`);
        }
    },
    components: {
        Location,
        TablerInput,
        TablerToggle,
        TablerLoading,
        TeamSelect,
        LocationDropdown,
        NoAccess,
        TablerBreadCrumb
    }
}
</script>
