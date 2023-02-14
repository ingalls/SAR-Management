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
                <NoAccess v-if='!is_iam("Mission:Manage")' title='New Mission'/>
                <template v-else>
                    <div class="col-lg-12">
                        <div class="card">
                            <div class="card-body">
                                <div class='row row-cards'>
                                    <div class="col-md-12">
                                        <TablerInput v-model='mission.title' label='Mission Title'/>
                                    </div>
                                    <div class="col-md-6">
                                        <TablerInput type='datetime-local' v-model='mission.start_ts' label='Mission Start'/>
                                    </div>
                                    <div class="col-md-6">
                                        <TablerInput type='datetime-local' v-model='mission.end_ts' label='Mission End'/>
                                    </div>
                                    <div class="col-md-12">
                                        <TablerInput v-model='mission.body' :rows='6' label='Mission Report'/>
                                    </div>

                                    <div class='col-md-12'>
                                        <Location/>
                                    </div>

                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-lg-12">
                        <UserPresentSelect
                            v-model='mission.assigned'
                        />
                    </div>
                    <div class="col-lg-12">
                        <div class="card">
                            <div class="card-body">
                                <div class='d-flex'>
                                    <div class='ms-auto'>
                                        <a @click='create' class="cursor-pointer btn btn-primary">
                                            Create Mission
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

    <PageFooter/>
</div>
</template>

<script>
import iam from '../iam.js';
import NoAccess from './util/NoAccess.vue';
import PageFooter from './PageFooter.vue';
import UserPresentSelect from './util/UserPresentSelect.vue';
import Location from './Mission/Location.vue';
import {
    TablerInput
} from '@tak-ps/vue-tabler';

export default {
    name: 'MissionsNew',
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
            mission: {
                title: '',
                body: '',
                start_ts: '',
                end_ts: '',
                assigned: []
            }
        }
    },
    methods: {
        is_iam: function(permission) { return iam(this.iam, this.auth, permission) },
        create: async function() {
            const create = await window.std('/api/mission', {
                method: 'POST',
                body: this.mission
            });

            this.$router.push(`/mission/${create.id}`);
        }
    },
    components: {
        Location,
        PageFooter,
        TablerInput,
        UserPresentSelect,
        NoAccess
    }
}
</script>
