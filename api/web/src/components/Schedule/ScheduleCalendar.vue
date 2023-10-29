<template>
<div class="card">
    <div class="card-header">
        <h1 class='card-title'>Schedule Calendar</h1>
    </div>

    <div class="card-body">
        <div id='calendar' style='width: 100%; height: 500px;'></div>
    </div>

    <TablerModal v-if='modal.shown'>
        <button type="button" class="btn-close" @click='modal.shown = false' aria-label="Close"></button>
        <div class="modal-status bg-yellow"></div>
        <div class='modal-header'>
            <div class='modal-title'>Create Shift</div>
        </div>
        <div class="modal-body">
            <div class='col-12'>
                <TablerInput type='datetime-local' label='Shift Start' v-model='modal.start'/>
                <TablerInput type='datetime-local' label='Shift End' v-model='modal.end'/>
                <UserDropdown/>
            </div>
            <div class='col-12 d-flex'>
                <button @click='createFolder' class='btn btn-primary mt-2 ms-auto'>Submit</button>
            </div>
        </div>
    </TablerModal>
</div>
</template>

<script>
import { Calendar } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import listPlugin from '@fullcalendar/list'
import UserDropdown from '../util/UserDropdown.vue';
import {
    TablerModal,
    TablerInput,
    TablerLoading,
} from '@tak-ps/vue-tabler';

export default {
    name: 'Calendar',
    props: {
        scheduleid: {
            type: Number,
            required: true
        }
    },
    data: function() {
        return {
            calendar: null,
            modal: {
                shown: false,
                start: '',
                end: ''
            }
        }
    },
    mounted: async function() {
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
                    const url = window.stdurl(`/api/schedule/${this.scheduleid}/events`)
                    url.searchParams.append('start', fetchInfo.startStr);
                    url.searchParams.append('end', fetchInfo.endStr);
                    events = events.concat(await window.std(url));

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

        this.calendar.on('select', (event) => {
            console.error(event);
            this.modal.start = String(event.startStr);
            this.modal.end = String(event.endStr);
            this.modal.shown = true;
        });
    },
    components: {
        TablerModal,
        TablerInput,
        UserDropdown,
        TablerLoading,
    }
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
