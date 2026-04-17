schedules_assigned.json<template>
    <div class='card'>
        <div class='card-header'>
            <h1 class='card-title'>
                Schedule Calendar
            </h1>
            <div class='btn-list ms-auto'>
                <button
                    class='btn btn-sm'
                    :class='showOverrides ? "btn-yellow" : "btn-outline-yellow"'
                    @click='showOverrides = !showOverrides; calendar.refetchEvents()'
                >
                    <IconArrowsExchange
                        :size='16'
                        :stroke='1.5'
                        class='me-1'
                    />
                    Overrides
                </button>
            </div>
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
            <div
                class='modal-status'
                :class='modal.type === "override" ? "bg-orange" : "bg-yellow"'
            />
            <div class='modal-header'>
                <template v-if='modal.type === "override"'>
                    <div class='modal-title'>
                        {{ modal.id ? 'Edit Override' : 'Create Override' }}
                    </div>
                    <div
                        v-if='modal.id'
                        class='ms-auto'
                    >
                        <TablerDelete
                            v-tooltip='"Delete Override"'
                            displaytype='icon'
                            @delete='deleteOverride'
                        />
                    </div>
                </template>
                <template v-else>
                    <div class='modal-title'>
                        {{ modal.id ? 'Edit Shift' : 'Create Shift' }}
                    </div>
                    <div class='ms-auto btn-list'>
                        <button
                            v-if='modal.id'
                            class='btn btn-sm btn-outline-orange'
                            @click='switchToOverride'
                        >
                            <IconArrowsExchange
                                :size='16'
                                :stroke='1.5'
                                class='me-1'
                            />
                            Override This Shift
                        </button>
                        <TablerDelete
                            v-if='modal.id'
                            v-tooltip='"Delete Event"'
                            displaytype='icon'
                            @delete='deleteAssignment'
                        />
                    </div>
                </template>
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

                    <template v-if='modal.type === "override"'>
                        <UserDropdown
                            v-model='modal.title'
                            :url='`/api/schedule/${schedule.id}/assigned`'
                            label='Replacement'
                            @selected='modal.user = $event.uid'
                        />
                        <TablerInput
                            v-model='modal.reason'
                            :rows='3'
                            label='Reason'
                        />
                    </template>
                    <template v-else>
                        <UserDropdown
                            v-model='modal.title'
                            :url='`/api/schedule/${schedule.id}/assigned`'
                            @selected='modal.user = $event.uid'
                        />
                    </template>
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
import {
    IconArrowsExchange,
} from '@tabler/icons-vue';

const props = defineProps({
    schedule: {
        type: Object,
        required: true
    }
});

const calendar = ref(null);
const showOverrides = ref(true);
const modal = reactive({
    loading: false,
    shown: false,
    type: 'event',
    id: null,
    user: null,
    title: '',
    start: '',
    end: '',
    reason: '',
    override_uid: null,
});

const resetModal = () => {
    Object.assign(modal, {
        loading: false,
        shown: false,
        type: 'event',
        id: null,
        user: null,
        title: '',
        start: '',
        end: '',
        reason: '',
        override_uid: null,
    });
};

const switchToOverride = () => {
    modal.type = 'override';
    modal.override_uid = modal.user;
    modal.user = null;
    modal.title = '';
    modal.reason = '';
};

const deleteAssignment = async () => {
    modal.loading = true;

    await window.std(`/api/schedule/${props.schedule.id}/events/${modal.id}`, {
        method: 'DELETE',
    });

    calendar.value.refetchEvents();
    resetModal();
};

const deleteOverride = async () => {
    modal.loading = true;

    await window.std(`/api/schedule/${props.schedule.id}/override/${modal.id}`, {
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

const submitOverride = async () => {
    modal.loading = true;

    const body = {
        uid: modal.user,
        start_ts: moment(modal.start).toISOString(),
        end_ts: moment(modal.end).toISOString(),
        reason: modal.reason || '',
    };

    if (modal.override_uid) {
        body.override_uid = modal.override_uid;
    }

    if (modal.id) {
        await window.std(`/api/schedule/${props.schedule.id}/override/${modal.id}`, {
            method: 'PATCH',
            body
        });
    } else {
        await window.std(`/api/schedule/${props.schedule.id}/override`, {
            method: 'POST',
            body
        });
    }

    calendar.value.refetchEvents();
    resetModal();
};

onMounted(async () => {
    calendar.value = new Calendar(document.getElementById('calendar'), {
        plugins: [dayGridPlugin, interactionPlugin, listPlugin],
        timeZone: 'local',
        selectable: true,
        unselectAuto: true,
        eventClick: async (info) => {
            const event = info.event;
            if (event.extendedProps.type === 'override') {
                Object.assign(modal, {
                    type: 'override',
                    id: event.extendedProps.overrideId,
                    user: event.extendedProps.uid,
                    override_uid: event.extendedProps.override_uid,
                    title: event.title,
                    start: moment(event.start).format('YYYY-MM-DDTHH:mm'),
                    end: moment(event.end).format('YYYY-MM-DDTHH:mm'),
                    reason: event.extendedProps.reason || '',
                    shown: true,
                });
            } else {
                Object.assign(modal, {
                    type: 'event',
                    id: event.id,
                    uid: event.extendedProps.uid,
                    user: event.extendedProps.uid,
                    title: event.title,
                    start: moment(event.start).format('YYYY-MM-DDTHH:mm'),
                    end: moment(event.end).format('YYYY-MM-DDTHH:mm'),
                    shown: true
                });
            }
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
                    type: 'event',
                    backgroundColor: '#206bc4',
                    borderColor: '#206bc4',
                })));

                if (showOverrides.value) {
                    const overrideUrl = window.stdurl(`/api/schedule/${props.schedule.id}/override`);
                    overrideUrl.searchParams.append('start', fetchInfo.startStr);
                    overrideUrl.searchParams.append('end', fetchInfo.endStr);
                    overrideUrl.searchParams.append('limit', '100');

                    const overrideRes = await window.std(overrideUrl);
                    for (const o of overrideRes.items) {
                        events.push({
                            id: `override-${o.id}`,
                            title: `↻ ${o.uid_fname} ${o.uid_lname}`,
                            start: moment(o.start_ts).toISOString(),
                            end: moment(o.end_ts).toISOString(),
                            backgroundColor: '#f76707',
                            borderColor: '#f76707',
                            type: 'override',
                            overrideId: o.id,
                            uid: o.uid,
                            override_uid: o.override_uid,
                            reason: o.reason,
                        });
                    }
                }

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
