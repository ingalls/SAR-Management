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
                                        <IconPencil
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
                        <div
                            v-if='oncall.length'
                            class='col-lg-12'
                        >
                            <div class='card'>
                                <div class='card-header'>
                                    <h3 class='card-title'>
                                        <IconPhoneCall
                                            :size='20'
                                            :stroke='1.5'
                                            class='me-2'
                                        />
                                        Currently On-Call
                                    </h3>
                                </div>
                                <div class='list-group list-group-flush'>
                                    <div
                                        v-for='entry in oncall'
                                        :key='entry.uid'
                                        class='list-group-item'
                                    >
                                        <div class='d-flex align-items-center'>
                                            <span class='avatar avatar-sm me-2'>
                                                {{ entry.fname.charAt(0) }}{{ entry.lname.charAt(0) }}
                                            </span>
                                            <div>
                                                <span class='fw-medium'>{{ entry.fname }} {{ entry.lname }}</span>
                                                <span
                                                    v-if='entry.is_override'
                                                    class='badge bg-yellow-lt ms-2'
                                                >
                                                    Override
                                                </span>
                                            </div>
                                            <small class='text-muted ms-auto'>
                                                Until {{ formatTime(entry.end_ts) }}
                                            </small>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
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
import { ref, reactive, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import moment from 'moment';
import iamHelper from '../iam.js';
import NoAccess from './util/NoAccess.vue';
import CardScheduleAssigned from './Schedule/ScheduleAssigned.vue';
import CardScheduleCalendar from './Schedule/ScheduleCalendar.vue';
import {
    TablerBreadCrumb,
    TablerLoading
} from '@tak-ps/vue-tabler'
import {
    IconPencil,
    IconPhoneCall
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
const oncall = ref([])

const assigned = reactive({
    total: 0,
    assigned: []
})

function is_iam(permission) { 
    return iamHelper(props.iam, props.auth, permission) 
}

function formatTime(ts) {
    return moment(ts).format('ddd MMM D, h:mm A');
}

async function fetch() {
    loading.schedule = true;
    const result = await window.std(`/api/schedule/${route.params.scheduleid}`);
    Object.assign(schedule, result);
    loading.schedule = false;
}

async function fetchOnCall() {
    try {
        oncall.value = await window.std(`/api/schedule/${route.params.scheduleid}/oncall`);
    } catch {
        oncall.value = [];
    }
}

async function fetchAssigned() {
    loading.assigned = true;
    const result = await window.std(`/api/schedule/${route.params.scheduleid}/assigned`);
    assigned.total = result.total;
    assigned.assigned = result.assigned;
    loading.assigned = false;
}

onMounted(async () => {
    if (is_iam('Oncall:View')) {
        await fetch();
        await fetchOnCall();
    }
})

defineExpose({
    fetchAssigned
})
</script>
