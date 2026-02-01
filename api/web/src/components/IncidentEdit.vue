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
                        v-if='!is_iam("Incident:Manage")'
                        :title='$route.params.incidentid ? "Edit Incident" : "New Incident"'
                    />
                    <TablerLoading v-if='loading' />
                    <template v-else>
                        <div class='col-lg-12'>
                            <div class='card'>
                                <div class='card-header'>
                                    <h1
                                        class='card-title'
                                        v-text='incident.id ? incident.title : "New Incident"'
                                    />
                                    <div class='ms-auto'>
                                        <div class='btn-list'>
                                            <TablerDelete
                                                v-if='incident.id'
                                                displaytype='icon'
                                                @delete='deleteIncident'
                                            />
                                            <button
                                                class='btn btn-primary'
                                                @click='save'
                                            >
                                                Save
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div class='card-body'>
                                    <div class='row row-cards'>
                                        <div class='col-12 col-md-6 col-lg-3'>
                                            <TablerInput
                                                v-model='incident.title'
                                                label='Title'
                                                :required='true'
                                            />
                                        </div>
                                        <div class='col-12 col-md-6 col-lg-3'>
                                            <TablerInput
                                                v-model='incident.date'
                                                label='Date'
                                                type='datetime-local'
                                                :required='true'
                                            />
                                        </div>
                                        <div class='col-12 col-md-6 col-lg-3'>
                                            <TablerSelect
                                                v-model='incident.severity'
                                                label='Severity'
                                                :options='["minor", "moderate", "severe", "critical"]'
                                            />
                                        </div>
                                        <div class='col-12 col-md-6 col-lg-3'>
                                            <label class='form-label'>User</label>
                                            <TablerDropdown>
                                                <template #default>
                                                    <div class='form-control d-flex align-items-center cursor-pointer'>
                                                        <template v-if='selected_user'>
                                                            <Avatar :user='selected_user' />
                                                        </template>
                                                        <span
                                                            v-else
                                                            class='text-muted'
                                                        >Select User...</span>
                                                    </div>
                                                </template>
                                                <template #dropdown>
                                                    <div class='card'>
                                                        <div class='card-body'>
                                                            <TablerInput
                                                                v-model='user_filter'
                                                                icon='search'
                                                                placeholder='Filter Users'
                                                            />

                                                            <TablerNone
                                                                v-if='user_list.items.length === 0'
                                                                label='No Users'
                                                                :create='false'
                                                            />
                                                            <template v-else>
                                                                <div
                                                                    v-for='user in user_list.items'
                                                                    :key='user.id'
                                                                    class='py-2 px-2 rounded cursor-pointer hover-light'
                                                                    @click='selectUser(user)'
                                                                >
                                                                    <Avatar :user='user' />
                                                                </div>
                                                            </template>
                                                        </div>
                                                    </div>
                                                </template>
                                            </TablerDropdown>
                                        </div>
                                        <div class='col-12'>
                                            <label class='form-label'>Associated With</label>
                                            <div class='input-group'>
                                                <button
                                                    type='button'
                                                    class='btn'
                                                    :class='mode === "mission" ? "btn-primary" : ""'
                                                    @click='mode = "mission"'
                                                >
                                                    Mission
                                                </button>
                                                <button
                                                    type='button'
                                                    class='btn'
                                                    :class='mode === "training" ? "btn-primary" : ""'
                                                    @click='mode = "training"'
                                                >
                                                    Training
                                                </button>

                                                <div class='col'>
                                                    <TablerDropdown
                                                        v-if='mode === "mission"'
                                                        class='w-100'
                                                    >
                                                        <template #default>
                                                            <div
                                                                class='form-control d-flex align-items-center cursor-pointer'
                                                                style='border-top-left-radius: 0; border-bottom-left-radius: 0;'
                                                            >
                                                                <span
                                                                    v-if='selected_mission'
                                                                    v-text='selected_mission.title'
                                                                />
                                                                <span
                                                                    v-else
                                                                    class='text-muted'
                                                                >Select Mission...</span>
                                                                <IconX
                                                                    v-if='selected_mission'
                                                                    :size='16'
                                                                    class='ms-auto'
                                                                    @click.stop='selected_mission = null; incident.mission_id = null'
                                                                />
                                                            </div>
                                                        </template>
                                                        <template #dropdown>
                                                            <div class='card'>
                                                                <div class='card-body'>
                                                                    <TablerInput
                                                                        v-model='mission_filter'
                                                                        icon='search'
                                                                        placeholder='Filter Missions'
                                                                    />
                                                                    <TablerNone
                                                                        v-if='mission_list.items.length === 0'
                                                                        label='No Missions'
                                                                        :create='false'
                                                                    />
                                                                    <template v-else>
                                                                        <div
                                                                            v-for='mission in mission_list.items'
                                                                            :key='mission.id'
                                                                            class='py-2 px-2 rounded cursor-pointer hover-light'
                                                                            @click='selectMission(mission)'
                                                                            v-text='mission.title'
                                                                        />
                                                                    </template>
                                                                </div>
                                                            </div>
                                                        </template>
                                                    </TablerDropdown>

                                                    <TablerDropdown
                                                        v-if='mode === "training"'
                                                        class='w-100'
                                                    >
                                                        <template #default>
                                                            <div
                                                                class='form-control d-flex align-items-center cursor-pointer'
                                                                style='border-top-left-radius: 0; border-bottom-left-radius: 0;'
                                                            >
                                                                <span
                                                                    v-if='selected_training'
                                                                    v-text='selected_training.title'
                                                                />
                                                                <span
                                                                    v-else
                                                                    class='text-muted'
                                                                >Select Training...</span>
                                                                <IconX
                                                                    v-if='selected_training'
                                                                    :size='16'
                                                                    class='ms-auto'
                                                                    @click.stop='selected_training = null; incident.training_id = null'
                                                                />
                                                            </div>
                                                        </template>
                                                        <template #dropdown>
                                                            <div class='card'>
                                                                <div class='card-body'>
                                                                    <TablerInput
                                                                        v-model='training_filter'
                                                                        icon='search'
                                                                        placeholder='Filter Trainings'
                                                                    />
                                                                    <TablerNone
                                                                        v-if='training_list.items.length === 0'
                                                                        label='No Trainings'
                                                                        :create='false'
                                                                    />
                                                                    <template v-else>
                                                                        <div
                                                                            v-for='training in training_list.items'
                                                                            :key='training.id'
                                                                            class='py-2 px-2 rounded cursor-pointer hover-light'
                                                                            @click='selectTraining(training)'
                                                                            v-text='training.title'
                                                                        />
                                                                    </template>
                                                                </div>
                                                            </div>
                                                        </template>
                                                    </TablerDropdown>
                                                </div>
                                            </div>
                                        </div>
                                        <div class='col-12'>
                                            <label class='form-label'>Description</label>
                                            <MdEditor
                                                v-model='incident.body'
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
import Avatar from './util/Avatar.vue';
import { MdEditor } from 'md-editor-v3';
import 'md-editor-v3/lib/style.css';
import {
    TablerBreadCrumb,
    TablerLoading,
    TablerInput,
    TablerSelect,
    TablerDelete,
    TablerDropdown,
    TablerNone
} from '@tak-ps/vue-tabler';
import { IconX } from '@tabler/icons-vue';

export default {
    name: 'IncidentEdit',
    components: {
        MdEditor,
        TablerBreadCrumb,
        TablerLoading,
        TablerInput,
        TablerSelect,
        TablerDelete,
        TablerDropdown,
        TablerNone,
        NoAccess,
        Avatar,
        IconX
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
            loading: true,
            mode: 'mission',
            user_filter: '',
            mission_filter: '',
            training_filter: '',
            incident: {
                id: null,
                title: '',
                severity: 'minor',
                body: '',
                date: new Date().toISOString().slice(0, 16),
                uid: null,
                mission_id: null,
                training_id: null
            },
            selected_user: null,
            selected_mission: null,
            selected_training: null,
            user_list: { items: [] },
            mission_list: { items: [] },
            training_list: { items: [] }
        }
    },
    watch: {
        mode: function() {
            if (this.mode === 'mission') {
                this.incident.training_id = null;
                this.selected_training = null;
            } else if (this.mode === 'training') {
                this.incident.mission_id = null;
                this.selected_mission = null;
            }
        },
        user_filter: async function() { await this.searchUsers(); },
        mission_filter: async function() { await this.searchMissions(); },
        training_filter: async function() { await this.searchTrainings(); }
    },
    mounted: async function() {
        if (!this.is_iam('Incident:Manage')) return;

        if (this.$route.params.incidentid) {
            this.incident = await window.std(`/api/incident/${this.$route.params.incidentid}`);

            if (this.incident.uid) this.selected_user = await window.std(`/api/user/${this.incident.uid}`);
            if (this.incident.mission_id) {
                 this.selected_mission = await window.std(`/api/mission/${this.incident.mission_id}`);
                 this.mode = 'mission';
            }
            if (this.incident.training_id) {
                this.selected_training = await window.std(`/api/training/${this.incident.training_id}`);
                this.mode = 'training';
            }

            // Format date for inputs
             if (this.incident.date) {
                this.incident.date = this.incident.date.slice(0, 16);
            }
        } else {
            if (this.$route.query.mission_id) {
                this.incident.mission_id = parseInt(this.$route.query.mission_id);
                this.selected_mission = await window.std(`/api/mission/${this.incident.mission_id}`);
                this.mode = 'mission';
            }
            if (this.$route.query.training_id) {
                this.incident.training_id = parseInt(this.$route.query.training_id);
                this.selected_training = await window.std(`/api/training/${this.incident.training_id}`);
                this.mode = 'training';
            }
        }

        await Promise.all([
            this.searchUsers(),
            this.searchMissions(),
            this.searchTrainings()
        ]);

        this.loading = false;
    },
    methods: {
        is_iam: function(permission) { return iam(this.iam, this.auth, permission) },
        searchUsers: async function() {
            const url = window.stdurl('/api/user');
            if (this.user_filter) url.searchParams.append('filter', this.user_filter);
            url.searchParams.append('limit', 10);
            const listResult = await window.std(url);
            if (listResult.assigned) listResult.items = listResult.assigned;
            this.user_list = listResult;
        },
        searchMissions: async function() {
            const url = window.stdurl('/api/mission');
            if (this.mission_filter) url.searchParams.append('filter', this.mission_filter);
            url.searchParams.append('limit', 10);
            this.mission_list = await window.std(url);
        },
        searchTrainings: async function() {
            const url = window.stdurl('/api/training');
            if (this.training_filter) url.searchParams.append('filter', this.training_filter);
            url.searchParams.append('limit', 10);
            this.training_list = await window.std(url);
        },
        selectUser: function(user) {
            this.selected_user = user;
            this.incident.uid = user.id;
        },
        selectMission: function(mission) {
            this.selected_mission = mission;
            this.incident.mission_id = mission.id;
        },
        selectTraining: function(training) {
            this.selected_training = training;
            this.incident.training_id = training.id;
        },
        deleteIncident: async function() {
            await window.std(`/api/incident/${this.incident.id}`, { method: 'DELETE' });
            this.$router.go(-1);
        },
        save: async function() {
            if (!this.incident.title) return; // Add better validation
            if (!this.incident.uid) return;
            if (!this.incident.date) return;

            let res;
            const body = {
                title: this.incident.title,
                severity: this.incident.severity,
                body: this.incident.body,
                date: new Date(this.incident.date).toISOString(),
                uid: this.incident.uid,
                mission_id: this.incident.mission_id || undefined,
                training_id: this.incident.training_id || undefined
            };

            if (this.incident.id) {
                res = await window.std(`/api/incident/${this.incident.id}`, {
                    method: 'PATCH',
                    body
                });
            } else {
                res = await window.std(`/api/incident`, {
                    method: 'POST',
                    body
                });
            }

            this.$router.go(-1);
        }
    }
}
</script>
