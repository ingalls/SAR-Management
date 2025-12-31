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
                    <div class='col-lg-12'>
                        <div class='card'>
                            <NoAccess
                                v-if='!is_iam("Oncall:View")'
                                title='Schedule'
                            />
                            <TablerLoading
                                v-else-if='loading.schedule'
                                desc='Loading Schedule'
                            />
                            <template v-else>
                                <div class='card-header'>
                                    <h3
                                        class='card-title'
                                        v-text='schedule.name'
                                    />
                                    <div class='btn-list ms-auto'>
                                        <IconSettings
                                            v-if='is_iam("Oncall:Admin")'
                                            :size='32'
                                            stroke='1'
                                            class='cursor-pointer'
                                            @click='$router.push(`/schedule/${$route.params.scheduleid}/edit`)'
                                        />
                                    </div>
                                </div>
                            </template>
                            <div
                                class='card-body'
                                v-text='schedule.body'
                            />
                        </div>
                    </div>
                    <template v-if='!loading.schedule && is_iam("Oncall:View")'>
                        <div class='col-lg-12'>
                            <CardScheduleCalendar
                                :schedule='schedule'
                            />
                        </div>
                        <div class='col-lg-12'>
                            <CardScheduleAssigned />
                        </div>
                    </template>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { reactive, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import iamHelper from '../iam.js';
import NoAccess from './util/NoAccess.vue';
import CardScheduleAssigned from './Schedule/ScheduleAssigned.vue';
import CardScheduleCalendar from './Schedule/ScheduleCalendar.vue';
import {
    TablerBreadCrumb,
    TablerLoading
} from '@tak-ps/vue-tabler'
import {
    IconSettings
} from '@tabler/icons-vue';

const route = useRoute();

const props = defineProps({
    iam: {
        type: Object,
        required: true
    },
    auth: {
        type: Object,
        required: true
    }
})

const loading = reactive({
    schedule: true,
    assigned: true,
})

const schedule = reactive({})

const assigned = reactive({
    total: 0,
    assigned: []
})

function is_iam(permission) { 
    return iamHelper(props.iam, props.auth, permission) 
}

async function fetch() {
    loading.schedule = true;
    const result = await window.std(`/api/schedule/${route.params.scheduleid}`);
    Object.assign(schedule, result);
    loading.schedule = false;
}

async function fetchAssigned() {
    loading.assigned = true;
    const result = await window.std(`/api/schedule/${route.params.scheduleid}/assigned`);
    assigned.total = result.total;
    assigned.assigned = result.assigned;
    loading.assigned = false;
}

onMounted(async () => {
    if (is_iam('Oncall:View')) await fetch();
})

defineExpose({
    fetchAssigned
})
</script>
