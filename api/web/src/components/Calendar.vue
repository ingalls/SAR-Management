<template>
<div>
    <div class='page-wrapper'>
        <div class="page-header d-print-none">
            <div class="container-xl">
                <div class="row g-2 align-items-center">
                    <div class="col d-flex">
                        <TablerBreadCrumb/>

                        <div class='ms-auto btn-list'>
                            <a v-if='is_iam("Training:Manage")' @click='$router.push("/training/new")' class="cursor-pointer btn btn-primary">
                                New Training
                            </a>
                        </div>
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
                        <div class="card-header">
                            <h1 class='card-title'>Team Calendar</h1>

                            <div v-if='is_iam("Calendar:View")' class='ms-auto btn-list'>
                                <FileExportIcon @click='createExport' v-tooltip='"Google Calendar Export"' class='cursor-pointer'/>
                            </div>
                        </div>
                        <div v-if='is_iam("Calendar:View")' class="card-body">
                            <pre v-if='showExport' v-text='exportURL'/>

                            <div id='calendar' style='width: 100%; height: 500px;'></div>
                        </div>
                        <NoAccess v-else title='Calendar'/>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
</template>

<script>
import iam from '../iam.js';
import NoAccess from './util/NoAccess.vue';
import { Calendar } from '@fullcalendar/core';
import {
    FileExportIcon
} from 'vue-tabler-icons';
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import listPlugin from '@fullcalendar/list'
import {
    TablerBreadCrumb
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
        }
    },
    data: function() {
        return {
            calendar: null,
            showExport: false,
            exportURL: '',
            layers: {
                layers: []
            }
        }
    },
    watch: {
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
        TablerBreadCrumb,
        FileExportIcon,
        NoAccess,
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
