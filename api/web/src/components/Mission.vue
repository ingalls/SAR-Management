<template>
<div>
    <div class='page-wrapper'>
        <div class="page-header d-print-none">
            <div class="container-xl">
                <div class="row g-2 align-items-center">
                    <div class="col d-flex">
                        <ol class="breadcrumb" aria-label="breadcrumbs">
                            <li class="breadcrumb-item"><a @click='$router.push("/")' class="cursor-pointer">Home</a></li>
                            <li class="breadcrumb-item" aria-current="page"><a  @click='$router.push("/mission")' class="cursor-pointer">Mission</a></li>
                            <li class="breadcrumb-item active" aria-current="page"><a href="#" v-text='$route.params.missionid'></a></li>
                        </ol>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class='page-body'>
        <div class='container-xl'>
            <div class='row row-deck row-cards'>
                <NoAccess v-if='!is_iam("Mission:View")' title='Mission'/>
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
                                <h3 class='card-title' v-text='mission.title'/>

                                <div class='ms-auto'>
                                     <EpochRange :start='mission.start_ts' :end='mission.end_ts'/>
                                </div>
                            </div>
                            <div class="card-body">
                                <div class='row row-cards'>
                                    <div class="col-md-12" v-text='mission.body'></div>

                                    <div class='col-md-12'>
                                        <Location/>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="col-lg-12">
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

    <PageFooter/>
</div>
</template>

<script>
import iam from '../iam.js';
import NoAccess from './util/NoAccess.vue';
import PageFooter from './PageFooter.vue';
import Location from './Mission/Location.vue';
import UserPresentSelect from './util/UserPresentSelect.vue';
import EpochRange from './util/EpochRange.vue';

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
                assigned: true
            },
            mission: {
                title: '',
                body: '',
                start_ts: '',
                end_ts: ''
            },
            assigned: []
        }
    },
    mounted: async function() {
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
            this.mission = await window.std(`/api/mission/${this.$route.params.missionid}`);
        },
        fetchAssigned: async function() {
            this.loading.assigned = true;
            this.assigned = (await window.std(`/api/mission/${this.$route.params.missionid}/assigned`)).assigned;
            this.loading.assigned = false;
        },
        deleteAssigned: async function(user) {
            await window.std(`/api/mission/${this.$route.params.missionid}/assigned/${user.id}`, {
                method: 'DELETE'
            })
        },
        patchAssigned: async function(user) {
            await window.std(`/api/mission/${this.$route.params.missionid}/assigned/${user.id}`, {
                method: 'PATCH',
                body: {
                    role: user.role,
                    confirmed: user.confirmed
                }
            })
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
        EpochRange,
        Location,
        PageFooter,
        UserPresentSelect,
        NoAccess
    }
}
</script>
