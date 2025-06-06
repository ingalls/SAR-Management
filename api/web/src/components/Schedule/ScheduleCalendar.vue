schedules_assigned.json<template>
    <div class='card'>
        <div class='card-header'>
            <h1 class='card-title'>
                Schedule Calendar
            </h1>
        </div>

        <div class='card-body'>
            <div
                id='calendar'
                style='width: 100%; height: 500px;'
            />
        </div>

        <TablerModal v-if='modal.shown'>
            <button
                type='button'
                class='btn-close'
                aria-label='Close'
                @click='modal.shown = false'
            />
            <div class='modal-status bg-yellow' />
            <div class='modal-header'>
                <template v-if='modal.id'>
                    <div class='modal-title'>
                        Edit Shift
                    </div>

                    <div class='ms-auto'>
                        <TablerDelete
                            v-tooltip='"Delete Event"'
                            displaytype='icon'
                            @delete='deleteAssignment'
                        />
                    </div>
                </template>
                <div
                    v-else
                    class='modal-title'
                >
                    Create Shift
                </div>
            </div>
            <div class='modal-body'>
                <TablerLoading
                    v-if='modal.loading'
                    desc='Loading Assignment'
                />
                <div
                    v-else
                    class='col-12'
                >
                    <TablerInput
                        v-model='modal.start'
                        type='datetime-local'
                        label='Shift Start'
                    />
                    <TablerInput
                        v-model='modal.end'
                        type='datetime-local'
                        label='Shift End'
                    />
                    <UserDropdown
                        v-model='modal.title'
                        :url='`/api/schedule/${schedule.id}/assigned`'
                        @selected='modal.user = $event.uid'
                    />
                </div>
            </div>
            <div class='modal-footer'>
                <button
                    class='btn btn-primary mt-2 ms-auto'
                    @click='submitAssignment'
                >
                    Submit
                </button>
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
    TablerDelete,
    TablerLoading,
} from '@tak-ps/vue-tabler';

export default {
    name: 'Calendar',
    components: {
        TablerModal,
        TablerInput,
        TablerDelete,
        UserDropdown,
        TablerLoading,
    },
    props: {
        schedule: {
            type: Object,
            required: true
        }
    },
    data: function() {
        return {
            calendar: null,
            modal: {
                loading: false,
                shown: false,
                user: null,
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

                this.modal = {
                    id: event.event.id,
                    uid: event.event.extendedProps.uid,
                    title: event.event.title,
                    start: `${event.event.start.getFullYear()}-${String(event.event.start.getMonth() + 1).padStart(2, '0')}-${String(event.event.start.getDate()).padStart(2, '0')} ${String(event.event.start.getHours()).padStart(2, '0')}:${String(event.event.start.getMinutes()).padStart(2, '0')}`,
                    end: `${event.event.end.getFullYear()}-${String(event.event.end.getMonth() + 1).padStart(2, '0')}-${String(event.event.end.getDate()).padStart(2, '0')} ${String(event.event.end.getHours()).padStart(2, '0')}:${String(event.event.end.getMinutes()).padStart(2, '0')}`,
                    shown: true
                }
            },
            eventSources: async (fetchInfo, resolve, reject) => {
                try {
                    let events = [];
                    const url = window.stdurl(`/api/schedule/${this.schedule.id}/events`)
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
            this.modal.start = `${event.startStr}T${this.schedule.handoff}`;
            this.modal.end = `${event.endStr}T${this.schedule.handoff}`;
            this.modal.shown = true;
        });
    },
    methods: {
        deleteAssignment: async function() {
            this.modal.loading = true;

            await window.std(`/api/schedule/${this.schedule.id}/events/${this.modal.id}`, {
                method: 'DELETE',
            });

            this.calendar.refetchEvents();

            this.modal = { shown: false }
        },
        submitAssignment: async function() {
            this.modal.loading = true;

            if (this.modal.id) {
                await window.std(`/api/schedule/${this.schedule.id}/events/${this.modal.id}`, {
                    method: 'PATCH',
                    body: {
                        uid:  this.modal.user,
                        start_ts: this.modal.start,
                        end_ts: this.modal.end
                    }
                });
            } else {
                await window.std(`/api/schedule/${this.schedule.id}/events`, {
                    method: 'POST',
                    body: {
                        uid:  this.modal.user,
                        start_ts: this.modal.start,
                        end_ts: this.modal.end
                    }
                });
            }

            this.calendar.refetchEvents();

            this.modal = { shown: false }
        }
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
