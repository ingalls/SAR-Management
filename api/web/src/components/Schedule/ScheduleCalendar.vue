<template>
    <div class='card'>
        <div class='card-header'>
            <h1 class='card-title'>
                Schedule Calendar
            </h1>
        </div>

        <div class='card-body'>
            <div
                id='calendar'
                style='width: 100%; height: 600px;'
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
                <div class='modal-title'>
                    {{ modal.id ? 'Edit Shift' : 'Create Shift' }}
                </div>
                <div class='ms-auto btn-list'>
                    <TablerDelete
                        v-if='modal.id'
                        v-tooltip='"Delete Event"'
                        displaytype='icon'
                        @delete='deleteAssignment'
                    />
                </div>
            </div>
            <div class='modal-body'>
                <TablerLoading
                    v-if='modal.loading'
                    desc='Loading'
                />
                <div
                    v-else
                    class='col-12'
                >
                    <TablerInput
                        v-model='modal.start'
                        type='datetime-local'
                        label='Start'
                    />
                    <TablerInput
                        v-model='modal.end'
                        type='datetime-local'
                        label='End'
                    />
                    <UserDropdown
                        v-model='modal.title'
                        :url='`/api/schedule/${schedule.id}/members`'
                        @selected='modal.user = $event.id'
                    />
                </div>
            </div>
            <div class='modal-footer'>
                <button
                    class='btn btn-primary mt-2 ms-auto'
                    @click='modal.type === "override" ? submitOverride() : submitAssignment()'
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
    id: null,
    user: null,
    title: '',
    start: '',
    end: '',
});

const resetModal = () => {
    Object.assign(modal, {
        loading: false,
        shown: false,
        id: null,
        user: null,
        title: '',
        start: '',
        end: '',
    });
};

const deleteAssignment = async () => {
    modal.loading = true;

    await window.std(`/api/schedule/${props.schedule.id}/events/${modal.id}`, {
        method: 'DELETE',
    });

    calendar.value.refetchEvents();
    resetModal();
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
    resetModal();
};

onMounted(async () => {
    calendar.value = new Calendar(document.getElementById('calendar'), {
        plugins: [dayGridPlugin, interactionPlugin, listPlugin],
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,dayGridWeek,dayGridDay,listWeek'
        },
        initialView: 'dayGridMonth',
        timeZone: 'local',
        selectable: true,
        unselectAuto: true,
        eventClick: async (info) => {
            const event = info.event;
            Object.assign(modal, {
                id: event.id,
                uid: event.extendedProps.uid,
                user: event.extendedProps.uid,
                title: event.title,
                start: moment(event.start).format('YYYY-MM-DDTHH:mm'),
                end: moment(event.end).format('YYYY-MM-DDTHH:mm'),
                shown: true
            });
        },
        eventSources: async (fetchInfo, resolve, reject) => {
            try {
                let events = [];
                const url = window.stdurl(`/api/schedule/${props.schedule.id}/events`)
                url.searchParams.append('start', fetchInfo.startStr);
                url.searchParams.append('end', fetchInfo.endStr);
                const shiftEvents = await window.std(url);

                events = events.concat(shiftEvents.map(e => ({
                    ...e,
                    backgroundColor: e.color || '#206bc4',
                    borderColor: e.color || '#206bc4',
                })));

                return resolve(events);
            } catch (err) {
                return reject(err);
            }
        }
    });

    calendar.value.render();

    calendar.value.on('select', (event) => {
        resetModal();
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
