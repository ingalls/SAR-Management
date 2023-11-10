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
                    <div class="card">
                        <NoAccess v-if='!is_iam("Oncall:View")' title='Schedule'/>
                        <TablerLoading v-else-if='loading.schedule' desc='Loading Schedule'/>
                        <template v-else>
                            <div class='card-header'>
                                <h3 class='card-title' v-text='schedule.name'></h3>
                                <div class='btn-list ms-auto'>
                                    <SettingsIcon v-if='is_iam("Oncall:Admin")' @click='$router.push(`/schedule/${$route.params.scheduleid}/edit`)' class='cursor-pointer'/>
                                </div>
                            </div>
                        </template>
                        <div class="card-body" v-text='schedule.body'></div>
                    </div>
                </div>
                <template v-if='!loading.schedule && is_iam("Oncall:View")'>
                    <div class="col-lg-12">
                        <CardScheduleCalendar
                            :schedule='schedule'
                        />
                    </div>
                    <div class="col-lg-12">
                        <CardScheduleAssigned/>
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
import CardScheduleAssigned from './Schedule/ScheduleAssigned.vue';
import CardScheduleCalendar from './Schedule/ScheduleCalendar.vue';
import UserPresentSelect from './util/UserPresentSelect.vue';
import {
    TablerBreadCrumb,
    TablerLoading
} from '@tak-ps/vue-tabler'
import {
    SettingsIcon
} from 'vue-tabler-icons';

export default {
    name: 'Schedule',
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
                schedule: true,
                assigned: true,
            },
            schedule: {},
            assigned: {
                total: 0,
                assigned: []
            }
        }
    },
    mounted: async function() {
        if (this.is_iam('Oncall:View')) await this.fetch();
    },
    methods: {
        is_iam: function(permission) { return iam(this.iam, this.auth, permission) },
        fetch: async function() {
            this.loading.schedule = true;
            this.schedule = await window.std(`/api/schedule/${this.$route.params.scheduleid}`);
            this.loading.schedule = false;
        },
        fetchAssigned: async function() {
            this.loading.assigned = true;
            this.assigned = await window.std(`/api/schedule/${this.$route.params.scheduleid}/assigned`);
            this.loading.assigned = false;
        },
    },
    components: {
        CardScheduleAssigned,
        CardScheduleCalendar,
        UserPresentSelect,
        TablerLoading,
        TablerBreadCrumb,
        SettingsIcon,
        NoAccess
    }
}
</script>
