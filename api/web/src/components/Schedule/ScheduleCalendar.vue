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

<script setup>
import { ref, reactive, onMounted } from 'vue';
import moment from 'moment';
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

const props = defineProps({
    schedule: {
        type: Object,
        required: true
    }
});

const calendar = ref(null);
const modal = reactive({
    loading: false,
    shown: false,
    user: null,
    title: '',
    start: '',
    end: ''
});

const deleteAssignment = async () => {
    modal.loading = true;

    await window.std(`/api/schedule/${props.schedule.id}/events/${modal.id}`, {
        method: 'DELETE',
    });

    calendar.value.refetchEvents();

    Object.assign(modal, { shown: false });
};

const submitAssignment = async () => {
    modal.loading = true;

    if (modal.id) {
        await window.std(`/api/schedule/${props.schedule.id}/events/${modal.id}`, {
            method: 'PATCH',
            body: {
                uid:  modal.user,
                start_ts: moment(modal.start).toISOString(),
                end_ts: moment(modal.end).toISOString()
            }
        });
    } else {
        await window.std(`/api/schedule/${props.schedule.id}/events`, {
            method: 'POST',
            body: {
                uid:  modal.user,
                start_ts: moment(modal.start).toISOString(),
                end_ts: moment(modal.end).toISOString()
            }
        });
    }

    calendar.value.refetchEvents();

    Object.assign(modal, { shown: false });
};

onMounted(async () => {
    calendar.value = new Calendar(document.getElementById('calendar'), {
        plugins: [dayGridPlugin, interactionPlugin, listPlugin],
        timeZone: 'local',
        selectable: true,
        unselectAuto: true,
        eventClick: async (event) => {

            Object.assign(modal, {
                id: event.event.id,
                uid: event.event.extendedProps.uid,
                title: event.event.title,
                start: moment(event.event.start).format('YYYY-MM-DDTHH:mm'),
                end: moment(event.event.end).format('YYYY-MM-DDTHH:mm'),
                shown: true
            });
        },
        eventSources: async (fetchInfo, resolve, reject) => {
            try {
                let events = [];
                const url = window.stdurl(`/api/schedule/${props.schedule.id}/events`)
                url.searchParams.append('start', fetchInfo.startStr);
                url.searchParams.append('end', fetchInfo.endStr);
                events = events.concat(await window.std(url));

                return resolve(events);
            } catch (err) {
                return reject(err);
            }
        }
    });

    calendar.value.render();

    calendar.value.on('select', (event) => {
        modal.start = moment(`${event.startStr}T${props.schedule.handoff}`).format('YYYY-MM-DDTHH:mm');
        modal.end = moment(`${event.endStr}T${props.schedule.handoff}`).format('YYYY-MM-DDTHH:mm');
        modal.shown = true;
    });
});
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
