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
                            <li class="breadcrumb-item active" aria-current="page"><a href="#">New</a></li>
                        </ol>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class='page-body'>
        <div class='container-xl'>
            <div class='row row-deck row-cards'>
                <div class="col-lg-12">
                    <div class="card">
                        <TablerLoading v-if='loading.training'/>
                        <div v-else class="card-body">
                            <div class='row row-cards'>
                                <div class="col-md-12">
                                    <TablerInput v-model='training.title' label='Training Title'/>
                                </div>
                                <div class="col-md-6">
                                    <TablerInput type='datetime-local' v-model='training.start_ts' label='Training Start'/>
                                </div>
                                <div class="col-md-6">
                                    <TablerInput type='datetime-local' v-model='training.end_ts' label='Training End'/>
                                </div>
                                <div class="col-md-12">
                                    <TablerInput v-model='training.body' :rows='6' label='Training Summary'/>
                                </div>
                                <div class='col-md-12'>
                                    <TablerInput v-model='training.location' label='Training Location'/>
                                </div>
                                <div class='col-md-12'>
                                    <Location/>
                                </div>

                                <div class="col-md-12">
                                    <div class='d-flex'>
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
                    </div>
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
import {
    TablerInput,
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
                body: '',
                location: '',
                start_ts: '',
                end_ts: ''
            }
        }
    },
    mounted: async function() {
        if (this.$route.params.trainingid) {
            await this.fetch();
        } else {
            this.loading.training = false;
        }
    },
    methods: {
        fetch: async function() {
            this.loading.training = true;
            const training = await window.std(`/api/training/${this.$route.params.trainingid}`);

            training.start_ts = (new Date(training.start_ts)).toISOString().replace(/:\d+\.\d+[A-Z]/, '');
            training.end_ts = (new Date(training.end_ts)).toISOString().replace(/:\d+\.\d+[A-Z]/, '');

            this.training = training;
            this.loading.training = false;
        },
        create: async function() {
            const create = await window.std('/api/training', {
                method: 'POST',
                body: this.training
            });

            this.$router.push(`/training/${create.id}`);
        },
        update: async function() {
            const create = await window.std(`/api/training/${this.training.id}`, {
                method: 'PATCH',
                body: this.training
            });

            this.$router.push(`/training/${create.id}`);
        }
    },
    components: {
        Location,
        PageFooter,
        TablerInput,
        TablerLoading
    }
}
</script>
