<template>
<div>
    <div class='page-wrapper'>
        <div class="page-header d-print-none">
            <div class="container-xl">
                <div class="row g-2 align-items-center">
                    <div class="col d-flex">
                        <ol class="breadcrumb" aria-label="breadcrumbs">
                            <li class="breadcrumb-item"><a @click='$router.push("/")' class="cursor-pointer">Home</a></li>
                            <li class="breadcrumb-item" aria-current="page"><a  @click='$router.push("/training")' class="cursor-pointer">Training</a></li>
                            <li class="breadcrumb-item active" aria-current="page"><a href="#" v-text='$route.params.trainingid'></a></li>
                        </ol>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class='page-body'>
        <div class='container-xl'>
            <div class='row row-deck row-cards'>
                <div v-if='!loading.assigned && is_roster' class="col-lg-12">
                    <div class='card'>
                        <div class="alert alert-info alert-dismissible" role="alert">
                            <h3 class="mb-1">Roster Correction</h3>
                            <p>You aren't marked as present for this training. If this is incorrect, request to be added to the training roster</p>
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
                    <TablerLoading v-if='loading.training'/>
                    <div v-else class="card">
                        <div class='card-header'>
                            <h3 class='card-title' v-text='`${training.title} @ ${training.location}`'/>

                            <div class='ms-auto'>
                                <div class='btn-list'>
                                    <EpochRange :start='training.start_ts' :end='training.end_ts'/>
                                    <SettingsIcon @click='$router.push(`/training/${$route.params.trainingid}/edit`)' height='24' width='24' class='cursor-pointer'/>
                                </div>
                            </div>
                        </div>
                        <div class="card-body">
                            <div class='row row-cards'>
                                <div class="col-md-12" v-text='training.body'></div>

                                <div class='col-md-12'>
                                    <Location/>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="col-lg-12">
                    <UserPresentSelect
                        label='Training Roster'
                        v-model='assigned'
                        :loading='loading.assigned'
                        @push='postAssigned($event)'
                        @patch='patchAssigned($event)'
                        @delete='deleteAssigned($event)'
                    />
                </div>
            </div>
        </div>
    </div>

    <PageFooter/>
</div>
</template>

<script>
import PageFooter from './PageFooter.vue';
import Location from './Mission/Location.vue';
import UserPresentSelect from './util/UserPresentSelect.vue';
import EpochRange from './util/EpochRange.vue';
import {
    SettingsIcon
} from 'vue-tabler-icons';
import {
    TablerLoading
} from '@tak-ps/vue-tabler';

export default {
    name: 'TrainingsNew',
    data: function() {
        return {
            loading: {
                assigned: true,
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
        await this.fetch();
        await this.fetchAssigned();
    },
    computed: {
        is_roster: function() {
            if (this.training.end_ts > +new Date()) return false;

            return this.assigned.every((a) => {
                return a.uid != this.auth.id;
            });
        }
    },
    methods: {
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
        PageFooter,
        UserPresentSelect,
        TablerLoading
    }
}
</script>
