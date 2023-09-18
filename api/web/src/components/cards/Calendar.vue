<template>
<div class="card">
    <div class="card-header">
        <GripVerticalIcon v-if='dragHandle' class='drag-handle cursor-pointer'/>
        <h1 class='card-title'>Team Calendar</h1>

        <div v-if='is_iam("Calendar:View")' class='ms-auto btn-list'>
            <FileExportIcon @click='createExport' v-tooltip='"Google Calendar Export"' class='cursor-pointer'/>
            <div class="dropdown">
                <div type="button" id="dropdownLocation" data-bs-toggle="dropdown" aria-expanded="false">
                    <Menu2Icon v-tooltip='"Options"' class='cursor-pointer'/>
                </div>
                <ul class="dropdown-menu" aria-labelledby="dropdownLocation">
                    <div class='m-1'>
                        <div class='d-flex'>
                            <AmbulanceIcon class='my-1 mx-1'/>
                            <TablerToggle v-model='calendars.mission' label='Missions' class='w-full'/>
                        </div>
                        <div class='d-flex'>
                            <TruckIcon class='my-1 mx-1'/>
                            <TablerToggle v-model='calendars.training' label='Trainings' class='w-full'/>
                        </div>
                        <div class='d-flex'>
                            <BalloonIcon class='my-1 mx-1'/>
                            <TablerToggle v-model='calendars.birthday' label='Birthdays' class='w-full'/>
                        </div>
                        <div class='d-flex'>
                            <CalendarTimeIcon class='my-1 mx-1'/>
                            <TablerToggle v-model='calendars.schedule' label='Schedules' class='w-full'/>
                        </div>
                    </div>
                </ul>
            </div>
        </div>
    </div>
    <div v-if='is_iam("Calendar:View")' class="card-body">
        <pre v-if='showExport' v-text='exportURL'/>

        <div id='calendar' style='width: 100%; height: 500px;'></div>
    </div>
    <NoAccess v-else title='Calendar'/>
</div>
</template>

<script>
import iam from '../../iam.js';
import NoAccess from '../util/NoAccess.vue';
import { Calendar } from '@fullcalendar/core';
import {
    GripVerticalIcon,
    Menu2Icon,
    FileExportIcon,
    BalloonIcon,
    AmbulanceIcon,
    CalendarTimeIcon,
    TruckIcon,
} from 'vue-tabler-icons';
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import listPlugin from '@fullcalendar/list'
import {
    TablerToggle,
} from '@tak-ps/vue-tabler';

export default {
    name: 'Calendar',
    props: {
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
    },
    data: function() {
        return {
            calendar: null,
            showExport: false,
            exportURL: '',
            calendars: {
                mission: true,
                training: true,
                birthday: true,
                schedule: true
            },
            layers: {
                layers: []
            }
        }
    },
    watch: {
        calendars: {
            deep: true,
            handler: async function() {
                this.calendar.refetchEvents();
            }
        },
        layers: async function() {
            this.calendar.refetchEvents();
        }
    },
    mounted: async function() {
        if (!this.is_iam("Calendar:View")) return;

        this.calendar = new Calendar(document.getElementById('calendar'), {
            plugins: [dayGridPlugin, interactionPlugin, listPlugin],
            selectable: true,
            unselectAuto: true,
            eventClick: async (event) => {
                this.$router.push(event.event._def.extendedProps.path);
            },
            eventSources: async (fetchInfo, resolve, reject) => {
                try {
                    let events = [];
                    for (const layer of this.layers.layers) {
                        if (this.calendars[layer.id] === false) continue;

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
            }
        });

        this.calendar.render();

        await this.fetchCalendars();
    },
    methods: {
        is_iam: function(permission) { return iam(this.iam, this.auth, permission) },
        createExport: async function() {
            const body = await window.std('/api/calendar/training/ical', {
                method: 'POST'
            });

            const exportURL = window.stdurl('/api/calendar/training/ical');
            exportURL.searchParams.append('token', body.token);
            this.exportURL = exportURL;
            this.showExport = true;
        },
        fetchCalendars: async function() {
            this.layers = await window.std('/api/calendar');
        },
    },
    components: {
        TruckIcon,
        AmbulanceIcon,
        CalendarTimeIcon,
        FileExportIcon,
        TablerToggle,
        BalloonIcon,
        Menu2Icon,
        NoAccess,
        GripVerticalIcon,
    },
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
