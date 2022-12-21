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
                        <div class="card-body">
                            <div class='row row-cards'>
                                <div class="col-md-12">
                                    <TablerInput v-model='training.title' label='Training Title'/>
                                </div>
                                <div class="col-md-6">
                                    <TablerInput type='date' v-model='training.start_ts' label='Training Start'/>
                                </div>
                                <div class="col-md-6">
                                    <TablerInput type='date' v-model='training.end_ts' label='Training End'/>
                                </div>
                                <div class="col-md-12">
                                    <TablerInput v-model='training.body' :rows='6' label='Training Summary'/>
                                </div>

                                <div class='col-md-12'>
                                    <Location/>
                                </div>

                                <div class="col-md-12">
                                    <div class='d-flex'>
                                        <div class='ms-auto'>
                                            <a @click='create' class="cursor-pointer btn btn-primary">
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
    TablerInput
} from '@tak-ps/vue-tabler';

export default {
    name: 'TrainingsNew',
    data: function() {
        return {
            err: false,
            training: {
                title: '',
                body: '',
                start_ts: '',
                end_ts: ''
            }
        }
    },
    methods: {
        create: async function() {
            const create = await window.std('/api/training', {
                method: 'POST',
                body: this.training
            });

            this.$router.push(`/training/${create.id}`);
        }
    },
    components: {
        Location,
        PageFooter,
        TablerInput
    }
}
</script>
