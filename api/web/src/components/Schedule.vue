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
                                        <TablerIconButton
                                            v-if='is_iam("Oncall:Admin") && schedule.rotation_type !== "none"'
                                            title='Generate Rotation'
                                            @click='modal.generate = true'
                                        >
                                            <IconCalendarPlus
                                                :size='32'
                                                stroke='1'
                                            />
                                        </TablerIconButton>
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
                                            <div class='flex-fill d-flex align-items-center'>
                                                <Avatar
                                                    :user='entry'
                                                    :link='true'
                                                />
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
                                :key='calendarKey'
                                :schedule='schedule'
                            />
                        </div>
                        <div class='col-lg-12'>
                            <CardScheduleAssigned :schedule='schedule' />
                        </div>
                    </template>
                </div>
            </div>
        </div>

        <TablerModal
            v-if='modal.generate'
            size='lg'
        >
            <button
                type='button'
                class='btn-close'
                aria-label='Close'
                @click='modal.generate = false'
            />
            <div class='modal-status bg-blue' />
            <div class='modal-header'>
                <div class='modal-title'>
                    Generate Rotation
                </div>
            </div>
            <div class='modal-body'>
                <ScheduleGenerateRotation
                    :schedule-id='route.params.scheduleid'
                    :show-title='false'
                    @generated='refreshScheduleView'
                />
            </div>
        </TablerModal>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import moment from 'moment';
import iamHelper from '../iam.js';
import ScheduleGenerateRotation from './Schedule/GenerateRotation.vue';
import Avatar from './util/Avatar.vue';
import NoAccess from './util/NoAccess.vue';
import CardScheduleAssigned from './Schedule/ScheduleAssigned.vue';
import CardScheduleCalendar from './Schedule/ScheduleCalendar.vue';
import {
    TablerBreadCrumb,
    TablerIconButton,
    TablerLoading,
    TablerModal
} from '@tak-ps/vue-tabler'
import {
    IconCalendarPlus,
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
})
const modal = reactive({
    generate: false,
})

const schedule = reactive({})
const oncall = ref([])
const calendarKey = ref(0)

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

function refreshScheduleView() {
    calendarKey.value += 1;
}

onMounted(async () => {
    if (is_iam('Oncall:View')) {
        await fetch();
        await fetchOnCall();
    }
})
</script>
