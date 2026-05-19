<template>
    <div>
        <div class='page-body'>
            <div class='container-xl'>
                <div class='row row-deck row-cards'>
                    <NoAccess
                        v-if='!is_iam("Team:View")'
                        title='Attendance'
                    />
                    <template v-else>
                        <div class='col-12'>
                            <div class='card'>
                                <TablerLoading
                                    v-if='loading.teams'
                                    desc='Loading Attendance'
                                />
                                <div
                                    v-else
                                    class='card-body'
                                >
                                    <div class='attendance-controls'>
                                        <div class='attendance-controls__inputs'>
                                            <div class='attendance-control'>
                                                <TablerInput
                                                    v-model='filter.start'
                                                    label='Start Date'
                                                    :disabled='loading.attendance'
                                                    :error='errors.start'
                                                    type='date'
                                                />
                                            </div>
                                            <div class='attendance-control'>
                                                <TablerInput
                                                    v-model='filter.end'
                                                    label='End Date'
                                                    :disabled='loading.attendance'
                                                    :error='errors.end'
                                                    type='date'
                                                />
                                            </div>
                                            <div class='attendance-control'>
                                                <label class='form-label'>Team</label>
                                                <select
                                                    v-model='filter.team'
                                                    class='form-select'
                                                    :disabled='loading.attendance'
                                                >
                                                    <option value=''>
                                                        All Teams
                                                    </option>
                                                    <option
                                                        v-for='team in teams'
                                                        :key='team.id'
                                                        :value='String(team.id)'
                                                    >
                                                        {{ team.name }}
                                                    </option>
                                                </select>
                                            </div>
                                        </div>

                                        <div class='row g-3'>
                                            <div class='col-12 col-lg-6'>
                                                <div class='attendance-controls__group'>
                                                    <div class='attendance-controls__label'>
                                                        Show
                                                    </div>
                                                    <TablerPillGroup
                                                        v-model='filter.eventType'
                                                        class='attendance-segmented'
                                                        :disabled='loading.attendance'
                                                        name='attendance-event-type'
                                                        :options='eventTypeOptions'
                                                    >
                                                        <template #option='{ option }'>
                                                            <span class='attendance-pill-option d-inline-flex align-items-center gap-1'>
                                                                <component
                                                                    :is='pillIcon(option.icon)'
                                                                    :size='14'
                                                                    stroke='2'
                                                                />
                                                                <span v-text='option.label' />
                                                            </span>
                                                        </template>
                                                    </TablerPillGroup>
                                                </div>
                                            </div>

                                            <div class='col-12 col-lg-6'>
                                                <div class='attendance-controls__group'>
                                                    <div class='attendance-controls__label'>
                                                        Cutoff Mode
                                                    </div>
                                                    <TablerPillGroup
                                                        :model-value='filter.cutoffMode'
                                                        class='attendance-segmented'
                                                        :disabled='loading.attendance'
                                                        name='attendance-cutoff-mode'
                                                        :options='cutoffModeOptions'
                                                        @update:model-value='setCutoffMode'
                                                    >
                                                        <template #option='{ option }'>
                                                            <span class='attendance-pill-option d-inline-flex align-items-center gap-1'>
                                                                <component
                                                                    :is='pillIcon(option.icon)'
                                                                    :size='14'
                                                                    stroke='2'
                                                                />
                                                                <span v-text='option.label' />
                                                            </span>
                                                        </template>
                                                    </TablerPillGroup>

                                                    <div
                                                        v-if='filter.cutoffMode === "percent"'
                                                        class='attendance-control'
                                                    >
                                                        <TablerInput
                                                            v-model='filter.percent'
                                                            label='Percent Target'
                                                            :disabled='loading.attendance'
                                                            :error='errors.percent'
                                                            type='number'
                                                            min='0'
                                                            max='100'
                                                            step='1'
                                                        />
                                                    </div>
                                                    <div
                                                        v-else
                                                        class='attendance-control'
                                                    >
                                                        <TablerInput
                                                            v-model='filter.count'
                                                            label='Attendance Count'
                                                            :disabled='loading.attendance'
                                                            :error='errors.count'
                                                            type='number'
                                                            min='0'
                                                            step='1'
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div class='attendance-controls__footer'>
                                            <div class='attendance-cutoff'>
                                                <div class='attendance-cutoff__label'>
                                                    Current Threshold
                                                </div>
                                                <div class='attendance-cutoff__value'>
                                                    <span v-text='requiredCount' /> of <span v-text='totalVisibleEvents' />
                                                    <span class='attendance-cutoff__context'>
                                                        <template v-if='filter.cutoffMode === "percent"'>
                                                            from a <span v-text='`${cutoffPercent}%`' /> target
                                                        </template>
                                                        <template v-else>
                                                            from a fixed attendance count
                                                        </template>
                                                    </span>
                                                </div>
                                            </div>

                                            <TablerButton
                                                class='btn btn-primary attendance-filter-button'
                                                :disabled='loading.attendance'
                                                @click='refresh'
                                            >
                                                Refresh Roster
                                            </TablerButton>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class='col-12'>
                            <TablerLoading
                                v-if='loading.attendance'
                                desc='Refreshing Attendance' 
                            />

                            <template v-else>
                                <div
                                    v-if='!filteredEvents.length'
                                    class='card attendance-empty-state'
                                >
                                    <div class='card-body'>
                                        <h3 class='attendance-empty-state__title'>
                                            No attendance opportunities in this view
                                        </h3>
                                        <p class='attendance-empty-state__body'>
                                            Adjust the date range or switch the type filter back to All to bring missions and trainings back into the roster.
                                        </p>
                                    </div>
                                </div>

                                <div
                                    v-else
                                    class='card attendance-roster-card'
                                >
                                    <div class='card-header attendance-roster-card__header'>
                                        <div>
                                            <h3 class='card-title'>
                                                Attendance Matrix
                                            </h3>
                                            <div class='text-secondary small'>
                                                Click any event card or member row to jump into the underlying record.
                                            </div>
                                        </div>

                                        <div class='attendance-legend btn-list'>
                                            <span class='badge bg-green-lt'>Attended</span>
                                            <span class='badge bg-secondary-lt'>Missed</span>
                                        </div>
                                    </div>

                                    <div class='attendance-matrix-wrap'>
                                        <table class='table card-table table-hover table-vcenter attendance-matrix'>
                                            <thead>
                                                <tr>
                                                    <th class='attendance-matrix__member-col'>
                                                        Responder
                                                    </th>
                                                    <th
                                                        v-for='event in filteredEvents'
                                                        :key='event.key'
                                                        class='attendance-matrix__event-col'
                                                    >
                                                        <button
                                                            type='button'
                                                            class='attendance-event-head'
                                                            :title='eventTooltip(event)'
                                                            @click='gotoEvent(event)'
                                                        >
                                                            <span class='attendance-event-head__badges'>
                                                                <span
                                                                    class='badge'
                                                                    :class='event.source === "mission" ? "bg-orange-lt" : "bg-green-lt"'
                                                                    v-text='event.sourceLabel'
                                                                />
                                                                <span
                                                                    v-if='event.required'
                                                                    class='badge bg-red-lt'
                                                                >
                                                                    Required
                                                                </span>
                                                            </span>
                                                            <span
                                                                class='attendance-event-head__title'
                                                                v-text='event.title'
                                                            />
                                                            <span
                                                                class='text-secondary small'
                                                                v-text='formatCompactDate(event.start_ts)'
                                                            />
                                                        </button>
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr
                                                    v-for='row in rosterRows'
                                                    :key='row.id'
                                                    :class='{ "attendance-row--failing": !row.meetsCutoff }'
                                                >
                                                    <th class='attendance-matrix__member-col'>
                                                        <button
                                                            type='button'
                                                            class='attendance-member'
                                                            @click='gotoUser(row)'
                                                        >
                                                            <span
                                                                class='avatar avatar-sm attendance-member__avatar'
                                                                v-text='row.initials'
                                                            />

                                                            <span class='attendance-member__meta'>
                                                                <span
                                                                    class='attendance-member__name'
                                                                    v-text='row.displayName'
                                                                />
                                                                <span class='attendance-member__stats text-secondary small'>
                                                                    <span v-text='`${row.attended}/${totalVisibleEvents || 0} attended`' />
                                                                    <span v-text='`${row.percent}%`' />
                                                                </span>
                                                            </span>

                                                            <span
                                                                class='badge ms-auto'
                                                                :class='row.meetsCutoff ? "bg-green-lt" : "bg-red-lt"'
                                                                v-text='row.meetsCutoff ? "Passing" : "Below Cutoff"'
                                                            />
                                                        </button>
                                                    </th>

                                                    <td
                                                        v-for='event in filteredEvents'
                                                        :key='`${row.id}-${event.key}`'
                                                        class='attendance-matrix__cell'
                                                    >
                                                        <button
                                                            type='button'
                                                            class='attendance-mark'
                                                            :class='{ "is-attended": event.attendees.has(row.id), "is-missed": !event.attendees.has(row.id) }'
                                                            :title='event.attendees.has(row.id) ? `${row.displayName} attended ${event.title}` : `${row.displayName} did not attend ${event.title}`'
                                                            @click='gotoEvent(event)'
                                                        >
                                                            <IconCheck
                                                                v-if='event.attendees.has(row.id)'
                                                                :size='14'
                                                                stroke='2'
                                                            />
                                                            <span
                                                                v-else
                                                                class='attendance-mark__dot'
                                                            />
                                                        </button>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </template>
                        </div>
                    </template>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import NoAccess from './util/NoAccess.vue';
import iamHelper from '../iam.js';
import {
    TablerButton,
    TablerInput,
    TablerLoading,
    TablerPillGroup
} from '@tak-ps/vue-tabler';
import {
    IconCheck,
    IconHash,
    IconHelicopter,
    IconList,
    IconPercentage,
    IconSchool
} from '@tabler/icons-vue';
import { reactive, ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const props = defineProps({
    iam: {
        type: Object,
        required: true
    },
    auth: {
        type: Object,
        required: true
    }
});

const route = useRoute();
const router = useRouter();

function todayDate() {
    return new Date().toISOString().slice(0, 10);
}

function monthAgoDate() {
    return new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().slice(0, 10);
}

function rangeBoundary(date, endOfDay = false) {
    return new Date(`${date}T${endOfDay ? '23:59:59.999' : '00:00:00.000'}`).toISOString();
}

function parseDateValue(value) {
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return new Date(`${value}T12:00:00`);
    }

    return new Date(value);
}

const loading = reactive({
    teams: true,
    attendance: true
});
const errors = reactive({
    start: '',
    end: '',
    percent: '',
    count: ''
});
const filter = reactive({
    start: monthAgoDate(),
    end: todayDate(),
    team: '',
    eventType: 'all',
    cutoffMode: 'percent',
    percent: 33,
    count: 4
});
const events = ref([]);
const teams = ref([]);
const users = ref([]);

function is_iam(permission) { return iamHelper(props.iam, props.auth, permission); }

const canViewMission = computed(() => is_iam('Mission:View'));
const canViewTraining = computed(() => is_iam('Training:View'));

const eventTypeOptions = computed(() => [
    { value: 'all', label: 'All', icon: 'all' },
    { value: 'mission', label: 'Missions', icon: 'mission', disabled: !canViewMission.value },
    { value: 'training', label: 'Trainings', icon: 'training', disabled: !canViewTraining.value }
]);

const cutoffModeOptions = computed(() => [
    { value: 'percent', label: 'Percent', icon: 'percent' },
    { value: 'number', label: 'Count', icon: 'count' }
]);

const filteredEvents = computed(() => {
    if (filter.eventType === 'mission') return events.value.filter((event) => event.source === 'mission');
    if (filter.eventType === 'training') return events.value.filter((event) => event.source === 'training');
    return events.value;
});

const totalVisibleEvents = computed(() => filteredEvents.value.length);

const cutoffPercent = computed(() => {
    const value = Number(filter.percent);
    return Number.isFinite(value) ? value : 0;
});

const cutoffNumber = computed(() => {
    const value = Number(filter.count);
    if (!Number.isFinite(value)) return 0;
    return Math.max(0, Math.floor(value));
});

const requiredCount = computed(() => {
    if (filter.cutoffMode === 'percent') {
        return Math.ceil(totalVisibleEvents.value * (cutoffPercent.value / 100));
    }
    return cutoffNumber.value;
});

const rosterRows = computed(() => {
    return [...users.value]
        .map((user) => {
            const attended = filteredEvents.value.reduce((sum, event) => {
                return sum + (event.attendees.has(user.id) ? 1 : 0);
            }, 0);

            const percent = totalVisibleEvents.value ? Math.round((attended / totalVisibleEvents.value) * 100) : 0;

            return {
                ...user,
                attended,
                percent,
                initials: userInitials(user),
                displayName: `${user.fname} ${user.lname}`,
                meetsCutoff: attended >= requiredCount.value
            };
        })
        .sort((a, b) => {
            if (a.meetsCutoff !== b.meetsCutoff) return a.meetsCutoff ? -1 : 1;
            if (a.attended !== b.attended) return b.attended - a.attended;
            return a.displayName.localeCompare(b.displayName);
        });
});

function pillIcon(icon) {
    if (icon === 'mission') return IconHelicopter;
    if (icon === 'training') return IconSchool;
    if (icon === 'percent') return IconPercentage;
    if (icon === 'count') return IconHash;
    return IconList;
}

function setCutoffMode(mode) {
    if (mode === filter.cutoffMode) return;

    if (mode === 'number' && !cutoffNumber.value) {
        filter.count = Math.max(1, Math.ceil(totalVisibleEvents.value * (cutoffPercent.value / 100)));
    }

    filter.cutoffMode = mode;
}

function validateFilters() {
    errors.start = '';
    errors.end = '';
    errors.percent = '';
    errors.count = '';

    if (!filter.start) errors.start = 'Cannot be empty';
    if (!filter.end) errors.end = 'Cannot be empty';

    if (filter.start && filter.end && filter.start > filter.end) {
        errors.end = 'End date must be on or after the start date';
    }

    const rawCount = Number(filter.count);
    if (filter.cutoffMode === 'percent') {
        if (cutoffPercent.value < 0 || cutoffPercent.value > 100) {
            errors.percent = 'Use a value between 0 and 100';
        }
    } else if (!Number.isFinite(rawCount) || rawCount < 0) {
        errors.count = 'Use a value of 0 or more';
    }

    return !Object.values(errors).some(Boolean);
}

async function refresh() {
    if (!validateFilters()) return;

    loading.attendance = true;

    await Promise.all([fetchUsers(), fetchEvents()]);

    if (filter.eventType === 'mission' && !canViewMission.value) filter.eventType = 'all';
    if (filter.eventType === 'training' && !canViewTraining.value) filter.eventType = 'all';

    loading.attendance = false;
}

async function fetchTeams() {
    loading.teams = true;

    const url = window.stdurl('/api/team');
    url.searchParams.append('limit', 1000);

    const list = await window.std(url);
    teams.value = list.items;
    loading.teams = false;
}

async function fetchUsers() {
    const url = window.stdurl('/api/user');
    url.searchParams.append('limit', 1000);

    if (filter.team) url.searchParams.append('team', filter.team);

    const list = await window.std(url);
    users.value = list.items;
}

async function fetchEvents() {
    const tasks = [];

    if (canViewMission.value) tasks.push(fetchEventsByType('mission'));
    if (canViewTraining.value) tasks.push(fetchEventsByType('training'));

    const results = await Promise.all(tasks);
    events.value = results
        .flat()
        .sort((a, b) => new Date(a.start_ts) - new Date(b.start_ts));
}

async function fetchEventsByType(source) {
    const url = window.stdurl(`/api/${source}`);
    url.searchParams.append('start', rangeBoundary(filter.start));
    url.searchParams.append('end', rangeBoundary(filter.end, true));
    url.searchParams.append('limit', 1000);

    if (filter.team) url.searchParams.append('team', filter.team);

    const list = await window.std(url);

    return await Promise.all(list.items.map(async (item) => {
        const assigned = await window.std(`/api/${source}/${item.id}/assigned`);
        const attendees = new Set();

        for (const user of assigned.items) {
            if (!user.confirmed) continue;
            attendees.add(user.uid);
        }

        return {
            id: item.id,
            key: `${source}-${item.id}`,
            title: item.title,
            start_ts: item.start_ts,
            end_ts: item.end_ts,
            source,
            sourceLabel: source === 'mission' ? 'Mission' : 'Training',
            route: `/${source}/${item.id}`,
            required: Boolean(item.required),
            attendees
        };
    }));
}

function gotoEvent(event) {
    router.push(event.route);
}

function gotoUser(user) {
    router.push(`/user/${user.id}`);
}

function formatDate(value) {
    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    }).format(parseDateValue(value));
}

function formatCompactDate(value) {
    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric'
    }).format(parseDateValue(value));
}

function eventTooltip(event) {
    return `${event.sourceLabel}: ${event.title} (${formatDate(event.start_ts)} to ${formatDate(event.end_ts)})`;
}

function userInitials(user) {
    return `${user.fname?.[0] || ''}${user.lname?.[0] || ''}`.toUpperCase();
}

onMounted(async () => {
    if (!is_iam('Team:View')) return;

    const routeTeam = route.query.team;
    if (routeTeam) filter.team = String(routeTeam);

    await fetchTeams();
    await refresh();
});
</script>

<style scoped>
.attendance-controls {
    display: grid;
    gap: 1.25rem;
}

.attendance-controls__inputs {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 1rem;
}

.attendance-controls__group {
    display: grid;
    gap: 0.6rem;
}

.attendance-controls__label {
    font-size: 0.74rem;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #5e7381;
}

.attendance-pill-option {
    justify-content: center;
    min-height: 1.25rem;
    width: 100%;
    white-space: nowrap;
}

.attendance-controls__footer {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    justify-content: space-between;
    align-items: center;
}

.attendance-cutoff {
    display: grid;
    gap: 0.2rem;
}

.attendance-cutoff__label {
    font-size: 0.74rem;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #5e7381;
}

.attendance-cutoff__value {
    font-size: 1.15rem;
    font-weight: 700;
    color: #17324d;
}

.attendance-cutoff__context {
    margin-left: 0.35rem;
    color: #5e7381;
    font-size: 0.95rem;
    font-weight: 500;
}

.attendance-filter-button {
    min-width: 12rem;
}

.attendance-empty-state {
    border: 1px dashed #c6d5de;
    background: linear-gradient(180deg, #ffffff 0%, #f7fbfc 100%);
}

.attendance-empty-state__title {
    margin: 0 0 0.5rem;
    color: #17324d;
}

.attendance-empty-state__body {
    margin: 0;
    max-width: 36rem;
    color: #5b7080;
}

.attendance-roster-card {
    overflow: hidden;
}

.attendance-roster-card__header {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    justify-content: space-between;
    align-items: center;
}

.attendance-legend {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
}

.attendance-matrix-wrap {
    overflow: auto;
}

.attendance-matrix {
    width: max-content;
    min-width: 100%;
    margin-bottom: 0;
}

.attendance-matrix__member-col {
    position: sticky;
    left: 0;
    z-index: 2;
    min-width: 16rem;
    background: #ffffff;
    box-shadow: 1px 0 0 #e6edf3;
}

.attendance-matrix__event-col {
    min-width: 8.5rem;
    max-width: 8.5rem;
    padding: 0.5rem;
    vertical-align: top;
    text-align: center;
}

.attendance-event-head {
    display: grid;
    gap: 0.35rem;
    width: 100%;
    padding: 0;
    border: none;
    background: transparent;
    text-align: left;
}

.attendance-event-head__badges {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem;
    justify-content: center;
}

.attendance-event-head__title {
    display: -webkit-box;
    overflow: hidden;
    line-clamp: 2;
    color: #1f2d3d;
    font-size: 0.8125rem;
    font-weight: 600;
    line-height: 1.25;
    text-align: center;
    text-wrap: balance;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
}

.attendance-row--failing td,
.attendance-row--failing th {
    background: #fff7f6;
}

.attendance-member {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    width: 100%;
    padding: 0;
    text-align: left;
    border: none;
    background: transparent;
}

.attendance-member__avatar {
    background: #e9f0f5;
    color: #345166;
    font-size: 0.75rem;
    font-weight: 700;
}

.attendance-member__meta {
    display: grid;
    min-width: 0;
    gap: 0.1rem;
}

.attendance-member__name {
    overflow: hidden;
    color: #1f2d3d;
    font-size: 0.875rem;
    font-weight: 600;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.attendance-member__stats {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
}

.attendance-matrix__cell {
    padding: 0.5rem;
    text-align: center;
    vertical-align: middle;
}

.attendance-mark {
    width: 1.75rem;
    height: 1.75rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 1px solid #d7e0e7;
    border-radius: 0.375rem;
    background: #f6f8fb;
    color: #4b6477;
}

.attendance-mark.is-attended {
    border-color: #a9ddbe;
    background: #2fb344;
    color: #ffffff;
}

.attendance-mark.is-missed {
    background: #f3f6f9;
}

.attendance-mark__dot {
    width: 0.3rem;
    height: 0.3rem;
    border-radius: 999px;
    background: #8aa0ae;
}

@media (max-width: 1100px) {
    .attendance-controls__inputs {
        grid-template-columns: 1fr;
    }
}

@media (max-width: 768px) {
    .attendance-controls__footer,
    .attendance-roster-card__header {
        align-items: flex-start;
    }

    .attendance-matrix__member-col {
        min-width: 14rem;
    }

    .attendance-matrix__event-col {
        min-width: 7.5rem;
    }
}
</style>
