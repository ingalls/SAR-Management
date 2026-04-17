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
                        v-if='!is_iam("Equipment:Manage")'
                        :title='$route.params.incidentid ? "Edit Equipment Incident" : "New Equipment Incident"'
                    />
                    <TablerLoading v-else-if='loading' />
                    <template v-else>
                        <div class='col-lg-12'>
                            <div class='card'>
                                <div class='card-header'>
                                    <h1
                                        class='card-title'
                                        v-text='incident.id ? incident.title : "New Equipment Incident"'
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
                                        <div class='col-12 col-md-6 col-lg-4'>
                                            <TablerInput
                                                v-model='incident.title'
                                                label='Title'
                                                :required='true'
                                            />
                                        </div>
                                        <div class='col-12 col-md-6 col-lg-4'>
                                            <TablerInput
                                                v-model='incident.date'
                                                label='Date'
                                                type='datetime-local'
                                                :required='true'
                                            />
                                        </div>
                                        <div class='col-12 col-md-6 col-lg-4'>
                                            <label class='form-label'>Equipment</label>
                                            <div class='form-control'>
                                                <span v-text='equipmentName' />
                                            </div>
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
                                                            <div class='p-3'>
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
                                                            <div class='p-3'>
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
import { MdEditor } from 'md-editor-v3';
import 'md-editor-v3/lib/style.css';
import {
    TablerBreadCrumb,
    TablerLoading,
    TablerInput,
    TablerDelete,
    TablerDropdown,
    TablerNone
} from '@tak-ps/vue-tabler';
import { IconX } from '@tabler/icons-vue';

export default {
    name: 'EquipmentIncidentEdit',
    components: {
        MdEditor,
        TablerBreadCrumb,
        TablerLoading,
        TablerInput,
        TablerDelete,
        TablerDropdown,
        TablerNone,
        NoAccess,
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
            mission_filter: '',
            training_filter: '',
            equipmentName: '',
            incident: {
                id: null,
                title: '',
                body: '',
                date: new Date().toISOString().slice(0, 16),
                equipment_id: null,
                mission_id: null,
                training_id: null
            },
            selected_mission: null,
            selected_training: null,
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
        mission_filter: async function() { await this.searchMissions(); },
        training_filter: async function() { await this.searchTrainings(); }
    },
    mounted: async function() {
        if (!this.is_iam('Equipment:Manage')) return;

        const equipmentId = parseInt(this.$route.params.equipid);
        const equipment = await window.std(`/api/equipment/${equipmentId}`);
        this.equipmentName = equipment.name;

        if (this.$route.params.incidentid) {
            this.incident = await window.std(`/api/equipment/${equipmentId}/incident/${this.$route.params.incidentid}`);

            if (this.incident.mission_id) {
                this.selected_mission = await window.std(`/api/mission/${this.incident.mission_id}`);
                this.mode = 'mission';
            }
            if (this.incident.training_id) {
                this.selected_training = await window.std(`/api/training/${this.incident.training_id}`);
                this.mode = 'training';
            }

            if (this.incident.date) {
                this.incident.date = this.incident.date.slice(0, 16);
            }
        } else {
            this.incident.equipment_id = equipmentId;
        }

        await Promise.all([
            this.searchMissions(),
            this.searchTrainings()
        ]);

        this.loading = false;
    },
    methods: {
        is_iam: function(permission) { return iam(this.iam, this.auth, permission) },
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
        selectMission: function(mission) {
            this.selected_mission = mission;
            this.incident.mission_id = mission.id;
        },
        selectTraining: function(training) {
            this.selected_training = training;
            this.incident.training_id = training.id;
        },
        deleteIncident: async function() {
            const equipmentId = this.$route.params.equipid;
            await window.std(`/api/equipment/${equipmentId}/incident/${this.incident.id}`, { method: 'DELETE' });
            this.$router.push(`/equipment/${equipmentId}`);
        },
        save: async function() {
            if (!this.incident.title) return;
            if (!this.incident.date) return;

            const equipmentId = this.$route.params.equipid;
            const body = {
                title: this.incident.title,
                body: this.incident.body,
                date: new Date(this.incident.date).toISOString(),
                mission_id: this.incident.mission_id || undefined,
                training_id: this.incident.training_id || undefined
            };

            if (this.incident.id) {
                await window.std(`/api/equipment/${equipmentId}/incident/${this.incident.id}`, {
                    method: 'PATCH',
                    body
                });
            } else {
                await window.std(`/api/equipment/${equipmentId}/incident`, {
                    method: 'POST',
                    body
                });
            }

            this.$router.push(`/equipment/${equipmentId}`);
        }
    }
}
</script>
