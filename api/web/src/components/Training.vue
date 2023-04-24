<template>
<div>
    <div class='page-wrapper'>
        <div class="page-header d-print-none">
            <div class="container-xl">
                <div class="row g-2 align-items-center">
                    <div class="col d-flex">
                        <BreadCrumb/>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class='page-body'>
        <div class='container-xl'>
            <div class='row row-deck row-cards'>
                <NoAccess v-if='!is_iam("Training:View")' title='Training'/>
                <template v-else>
                    <div v-if='!loading.assigned && is_roster' class="col-lg-12">
                        <div class='card'>
                            <div class="alert alert-info alert-dismissible" role="alert">
                                <h3 class="mb-1">Roster Correction</h3>
                                <p>You aren't marked as present for this training. If this is incorrect, request to be added to the training roster</p>
                                <div class='d-flex'>
                                    <div class='ms-auto'>
                                        <TablerLoading v-if='loading.request' :inline='true'/>
                                        <button v-else @click='request' class="btn btn-info cursor-pointer">Request Inclusion</button>
                                    </div>
                                </div>
                                <a class="btn-close" data-bs-dismiss="alert" aria-label="close"></a>
                            </div>
                        </div>
                    </div>
                    <div class="col-lg-12">
                        <TablerLoading v-if='loading.training'/>
                        <div v-else class="card">
                            <div class='card-header'>
                                <h3 class='card-title' v-text='`${training.title} @ ${training.location}`'/>
                                <span v-if='training.required' class="mx-2 badge bg-red">Required</span>

                                <div class='ms-auto btn-list'>
                                    <EpochRange :start='training.start_ts' :end='training.end_ts'/>
                                    <SettingsIcon v-if='is_iam("Training:Manage")' @click='$router.push(`/training/${$route.params.trainingid}/edit`)' height='24' width='24' class='cursor-pointer'/>
                                </div>
                            </div>
                            <div class="card-body">
                                <div class='row row-cards'>
                                    <div class="col-md-12" v-text='training.body'></div>

                                    <div class='col-md-12'>
                                        <Location v-if='training.location_geom' v-model='training.location_geom'/>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="col-lg-12">
                        <UserPresentSelect
                            label='Training Roster'
                            :disabled='!is_iam("Training:Manage")'
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
import BreadCrumb from './util/BreadCrumb.vue';
import EpochRange from './util/EpochRange.vue';
import {
    SettingsIcon
} from 'vue-tabler-icons';
import {
    TablerLoading
} from '@tak-ps/vue-tabler';

export default {
    name: 'TrainingsNew',
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
    mounted: async function() {
        if (this.is_iam('Training:View')) {
            await this.fetch();
            await this.fetchAssigned();
        }
    },
    computed: {
        is_roster: function() {
            if (this.training.start_ts > +new Date()) return false;
            if (this.training.start_ts < +new Date() - 604800000) return false; //Only request in last week

            return this.assigned.every((a) => {
                return a.uid != this.auth.id;
            });
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
            this.assigned = (await window.std(`/api/training/${this.$route.params.trainingid}/assigned`)).assigned;
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
    },
    components: {
        EpochRange,
        Location,
        SettingsIcon,
        UserPresentSelect,
        TablerLoading,
        BreadCrumb,
        NoAccess
    }
}
</script>
