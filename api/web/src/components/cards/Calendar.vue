<template>
    <div class='card'>
        <div class='card-header'>
            <IconGripVertical
                v-if='dragHandle'
                class='drag-handle cursor-move'
                size='32'
                stroke='1'
            />
            <h1 class='card-title'>
                Team Calendar
            </h1>

            <div
                v-if='is_iam(props.iam, props.auth, "Calendar:View")'
                class='ms-auto btn-list'
            >
                <TablerIconButton
                    title='Google Calendar Export'
                    @click='createExport'
                >
                    <IconFileExport
                        :size='32'
                        stroke='1'
                    />
                </TablerIconButton>

                <TablerDropdown>
                    <TablerIconButton
                        title='Calendar Layers'
                    >
                        <IconMenu2
                            :size='32'
                            stroke='1'
                        />
                    </TablerIconButton>

                    <template #dropdown>
                        <div class='m-1'>
                            <div class='d-flex'>
                                <IconAmbulance
                                    class='my-1 mx-1'
                                    size='32'
                                    stroke='1'
                                />
                                <TablerToggle
                                    v-model='calendars.mission'
                                    label='Missions'
                                    class='w-full'
                                />
                            </div>
                            <div class='d-flex'>
                                <IconTruck
                                    class='my-1 mx-1'
                                    size='32'
                                    stroke='1'
                                />
                                <TablerToggle
                                    v-model='calendars.training'
                                    label='Trainings'
                                    class='w-full'
                                />
                            </div>
                            <div class='d-flex'>
                                <IconBalloon
                                    class='my-1 mx-1'
                                    size='32'
                                    stroke='1'
                                />
                                <TablerToggle
                                    v-model='calendars.birthday'
                                    label='Birthdays'
                                    class='w-full'
                                />
                            </div>
                            <div class='d-flex'>
                                <IconCalendarTime
                                    class='my-1 mx-1'
                                    size='32'
                                    stroke='1'
                                />
                                <TablerToggle
                                    v-model='calendars.schedule'
                                    label='Schedules'
                                    class='w-full'
                                />
                            </div>
                        </div>
                    </template>
                </TablerDropdown>
            </div>
        </div>
        <div
            v-if='is_iam(props.iam, props.auth, "Calendar:View")'
            class='card-body'
        >
            <pre
                v-if='showExport'
                v-text='exportURL'
            />

            <div
                id='calendar'
                style='width: 100%; height: 500px;'
            />
        </div>
        <NoAccess v-else />
    </div>

    <NewEvent
        v-if='selected.shown'
        :start='selected.start'
        :end='selected.end'
        @close='selected.shown = false'
    />
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import is_iam from '../../iam.js';
import NoAccess from '../util/NoAccess.vue';
import { Calendar } from '@fullcalendar/core';
import {
    IconGripVertical,
    IconMenu2,
    IconFileExport,
    IconBalloon,
    IconAmbulance,
    IconCalendarTime,
    IconTruck,
} from '@tabler/icons-vue';
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import listPlugin from '@fullcalendar/list'
import NewEvent from '../Calendar/NewEvent.vue'
import {
    TablerToggle,
    TablerDropdown,
    TablerIconButton,
} from '@tak-ps/vue-tabler';

const props = defineProps({
    iam: {
        type: Object,
        required: true
    },
    auth: {
        type: Object,
        required: true
    },
    dragHandle: {
        type: Boolean,
        default: false
    },
});

const router = useRouter();
const calendar = ref();
const showExport = ref(false);
const exportURL = ref('');
const selected = ref({
    shown: false,
    start: '',
    end: ''
})

const calendars = ref({
    mission: true,
    training: true,
    birthday: true,
    schedule: true
})

const layers = ref({
    layers: []
})

watch(calendars.value, async () => {
    calendar.value.refetchEvents();
});

watch(layers, async () => {
    calendar.value.refetchEvents();
});

onMounted(async () => {
    if (!is_iam(props.iam, props.auth, "Calendar:View")) return;

    calendar.value = new Calendar(document.getElementById('calendar'), {
        plugins: [dayGridPlugin, interactionPlugin, listPlugin],
        selectable: true,
        unselectAuto: true,
        eventClick: async (event) => {
            router.push(event.event._def.extendedProps.path);
        },
        eventSources: async (fetchInfo, resolve, reject) => {
            try {
                let events = [];
                for (const layer of layers.value.layers) {
                    if (calendars.value[layer.id] === false) continue;

                    const url = window.stdurl(`/api/calendar/${layer.id}/events`)
                    url.searchParams.append('start', fetchInfo.startStr);
                    url.searchParams.append('end', fetchInfo.endStr);
                    events = events.concat(await window.std(url));
                }

                return resolve(events.map((event) => {
                    event.start = (new Date(event.start)).toISOString()
                        .replace('T', ' ')
                        .replace(/:[0-9]+\.[0-9]+[A-Z]/, '');

                    event.end = (new Date(event.end)).toISOString()
                        .replace('T', ' ')
                        .replace(/:[0-9]+\.[0-9]+[A-Z]/, '');


                    return event;
                }));
            } catch (err) {
                return reject(err);
            }
        },
        select: function(info) {
            if (!is_iam(props.iam, props.auth, "Calendar:Manage")) return

            const start = new Date(info.start);
            const end = new Date(info.end);

            if (
                start.getFullYear() === end.getFullYear()
                && start.getMonth() === end.getMonth()
                && start.getDate() === end.getDate()
            ) {
                start.setUTCHours(18)
                start.setUTCMinutes(0)

                end.setUTCHours(21)
                end.setUTCMinutes(0)
            } else {
                start.setUTCHours(8)
                start.setUTCMinutes(0)

                end.setUTCHours(17)
                end.setUTCMinutes(0)
            }

            selected.value.start = start.toISOString();
            selected.value.end = end.toISOString();
            selected.value.shown = true;
        },
    });

    calendar.value.render();

    layers.value = await window.std('/api/calendar');
});

async function createExport() {
    const body = await window.std('/api/calendar/training/ical', {
        method: 'POST'
    });

    const exportURL = window.stdurl('/api/calendar/training/ical');
    exportURL.searchParams.append('token', body.token);
    exportURL.value = exportURL;
    showExport.value = true;
}
</script>

<style lang="scss">
#calendar {
    table {
        margin: 0px;
    }

    .fc-event{
        cursor: pointer;
    }

    table, tbody, tr {
        border-top: 0px;
    }
}
</style>
