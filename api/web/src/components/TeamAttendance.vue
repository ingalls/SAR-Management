<template>
    <div class='attendance-page'>
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
                    <NoAccess
                        v-if='!is_iam("Team:View")'
                        title='Team'
                    />
                    <template v-else>
                        <div class='col-12'>
                            <div
                                v-if='loading.team'
                                class='card'
                            >
                                <TablerLoading desc='Loading Team Attendance' />
                            </div>

                            <template v-else>
                                <div class='card attendance-hero'>
                                    <div class='attendance-hero__body'>
                                        <div class='attendance-hero__copy'>
                                            <div class='attendance-hero__eyebrow'>Attendance Roster</div>
                                            <h1
                                                class='attendance-hero__title'
                                                v-text='team.name'
                                            />
                                            <p class='attendance-hero__subtitle'>
                                                Compare every member against the selected mission and training window, then apply either a percent target or a raw attendance count.
                                            </p>
                                        </div>

                                        <div class='attendance-hero__meta'>
                                            <TeamBadge :team='team' />
                                            <div class='attendance-hero__range'>
                                                <span v-text='formatDate(filter.start)' />
                                                <span class='mx-2'>to</span>
                                                <span v-text='formatDate(filter.end)' />
                                            </div>
                                        </div>
                                    </div>

                                    <div class='attendance-hero__stats'>
                                        <div class='attendance-stat-tile'>
                                            <div class='attendance-stat-tile__label'>Visible Events</div>
                                            <div
                                                class='attendance-stat-tile__value'
                                                v-text='totalVisibleEvents'
                                            />
                                        </div>
                                        <div class='attendance-stat-tile'>
                                            <div class='attendance-stat-tile__label'>Passing Members</div>
                                            <div
                                                class='attendance-stat-tile__value'
                                                v-text='passingUsers'
                                            />
                                        </div>
                                        <div class='attendance-stat-tile'>
                                            <div class='attendance-stat-tile__label'>Missions</div>
                                            <div
                                                class='attendance-stat-tile__value'
                                                v-text='missionCount'
                                            />
                                        </div>
                                        <div class='attendance-stat-tile'>
                                            <div class='attendance-stat-tile__label'>Trainings</div>
                                            <div
                                                class='attendance-stat-tile__value'
                                                v-text='trainingCount'
                                            />
                                        </div>
                                    </div>
                                </div>
                            </template>
                        </div>

                        <div class='col-12'>
                            <div class='card attendance-panel'>
                                <div class='card-body'>
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
                                        </div>

                                        <div class='attendance-controls__group'>
                                            <div class='attendance-controls__label'>Show</div>
                                            <div class='attendance-segmented'>
                                                <button
                                                    class='attendance-segmented__button'
                                                    :class='{ "is-active": filter.eventType === "all" }'
                                                    :disabled='loading.attendance'
                                                    @click='filter.eventType = "all"'
                                                >
                                                    All
                                                </button>
                                                <button
                                                    class='attendance-segmented__button'
                                                    :class='{ "is-active": filter.eventType === "mission" }'
                                                    :disabled='loading.attendance || !canViewMission'
                                                    @click='filter.eventType = "mission"'
                                                >
                                                    Missions
                                                </button>
                                                <button
                                                    class='attendance-segmented__button'
                                                    :class='{ "is-active": filter.eventType === "training" }'
                                                    :disabled='loading.attendance || !canViewTraining'
                                                    @click='filter.eventType = "training"'
                                                >
                                                    Trainings
                                                </button>
                                            </div>
                                        </div>

                                        <div class='attendance-controls__group'>
                                            <div class='attendance-controls__label'>Cutoff Mode</div>
                                            <div class='attendance-segmented'>
                                                <button
                                                    class='attendance-segmented__button'
                                                    :class='{ "is-active": filter.cutoffMode === "percent" }'
                                                    :disabled='loading.attendance'
                                                    @click='setCutoffMode("percent")'
                                                >
                                                    Percent
                                                </button>
                                                <button
                                                    class='attendance-segmented__button'
                                                    :class='{ "is-active": filter.cutoffMode === "number" }'
                                                    :disabled='loading.attendance'
                                                    @click='setCutoffMode("number")'
                                                >
                                                    Count
                                                </button>
                                            </div>
                                        </div>

                                        <div class='attendance-controls__inputs'>
                                            <div class='attendance-control'>
                                                <TablerInput
                                                    v-model='filter.percent'
                                                    label='Percent Target'
                                                    :disabled='loading.attendance || filter.cutoffMode !== "percent"'
                                                    :error='errors.percent'
                                                    type='number'
                                                    min='0'
                                                    max='100'
                                                    step='1'
                                                />
                                            </div>
                                            <div class='attendance-control'>
                                                <TablerInput
                                                    v-model='filter.count'
                                                    label='Attendance Count'
                                                    :disabled='loading.attendance || filter.cutoffMode !== "number"'
                                                    :error='errors.count'
                                                    type='number'
                                                    min='0'
                                                    step='1'
                                                />
                                            </div>
                                        </div>

                                        <div class='attendance-controls__footer'>
                                            <div class='attendance-cutoff'>
                                                <div class='attendance-cutoff__label'>Current Threshold</div>
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

                                            <button
                                                class='btn btn-primary attendance-filter-button'
                                                :disabled='loading.attendance'
                                                @click='refresh'
                                            >
                                                Refresh Roster
                                            </button>
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
                                <div class='attendance-summary-grid'>
                                    <div class='card attendance-summary-card'>
                                        <div class='attendance-summary-card__label'>Passing Threshold</div>
                                        <div class='attendance-summary-card__value'>
                                            <span v-text='requiredCount' />
                                        </div>
                                        <div class='attendance-summary-card__detail'>
                                            Members need at least <span v-text='requiredCount' /> attended <span v-text='opportunityLabel' /> in the visible range.
                                        </div>
                                    </div>
                                    <div class='card attendance-summary-card'>
                                        <div class='attendance-summary-card__label'>Pass Rate</div>
                                        <div class='attendance-summary-card__value'>
                                            <span v-text='users.length ? `${Math.round((passingUsers / users.length) * 100)}%` : "0%"' />
                                        </div>
                                        <div class='attendance-summary-card__detail'>
                                            <span v-text='passingUsers' /> of <span v-text='users.length' /> team members currently meet the cutoff.
                                        </div>
                                    </div>
                                    <div class='card attendance-summary-card'>
                                        <div class='attendance-summary-card__label'>Visible Mix</div>
                                        <div class='attendance-summary-card__value'>
                                            <span v-text='visibleMissionCount' /> / <span v-text='visibleTrainingCount' />
                                        </div>
                                        <div class='attendance-summary-card__detail'>
                                            Missions on the left, trainings on the right, with filtering available at any time.
                                        </div>
                                    </div>
                                </div>

                                <div
                                    v-if='!filteredEvents.length'
                                    class='card attendance-empty-state'
                                >
                                    <div class='card-body'>
                                        <h3 class='attendance-empty-state__title'>No attendance opportunities in this view</h3>
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
                                            <h3 class='card-title'>Attendance Matrix</h3>
                                            <div class='attendance-roster-card__subtitle'>
                                                Click any event card or member row to jump into the underlying record.
                                            </div>
                                        </div>

                                        <div class='attendance-legend'>
                                            <span class='attendance-legend__item'>
                                                <span class='attendance-legend__swatch is-attended' /> Attended
                                            </span>
                                            <span class='attendance-legend__item'>
                                                <span class='attendance-legend__swatch is-missed' /> Missed
                                            </span>
                                        </div>
                                    </div>

                                    <div class='attendance-matrix-wrap'>
                                        <table class='attendance-matrix'>
                                            <thead>
                                                <tr>
                                                    <th class='attendance-matrix__member-col'>Responder</th>
                                                    <th
                                                        v-for='event in filteredEvents'
                                                        :key='event.key'
                                                        class='attendance-matrix__event-col'
                                                    >
                                                        <button
                                                            class='attendance-event-card'
                                                            :class='`is-${event.source}`'
                                                            :title='eventTooltip(event)'
                                                            @click='gotoEvent(event)'
                                                        >
                                                            <span class='attendance-event-card__type'>
                                                                <span
                                                                    class='attendance-event-card__badge'
                                                                    :class='`is-${event.source}`'
                                                                    v-text='event.sourceLabel'
                                                                />
                                                                <span
                                                                    v-if='event.required'
                                                                    class='attendance-event-card__required'
                                                                >
                                                                    Required
                                                                </span>
                                                            </span>
                                                            <span
                                                                class='attendance-event-card__title'
                                                                v-text='event.title'
                                                            />
                                                            <span
                                                                class='attendance-event-card__date'
                                                                v-text='formatDate(event.start_ts)'
                                                            />
                                                        </button>
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr
                                                    v-for='row in rosterRows'
                                                    :key='row.id'
                                                    class='attendance-row'
                                                    :class='{ "is-failing": !row.meetsCutoff }'
                                                >
                                                    <th class='attendance-matrix__member-col'>
                                                        <button
                                                            class='attendance-member-card'
                                                            @click='gotoUser(row)'
                                                        >
                                                            <span
                                                                class='attendance-member-card__avatar'
                                                                v-text='row.initials'
                                                            />

                                                            <span class='attendance-member-card__meta'>
                                                                <span
                                                                    class='attendance-member-card__name'
                                                                    v-text='row.displayName'
                                                                />
                                                                <span class='attendance-member-card__stats'>
                                                                    <span v-text='`${row.attended}/${totalVisibleEvents || 0} attended`' />
                                                                    <span v-text='`${row.percent}%`' />
                                                                </span>
                                                                <span class='attendance-member-card__progress'>
                                                                    <span
                                                                        class='attendance-member-card__progress-bar'
                                                                        :style='{ width: `${row.percent}%` }'
                                                                    />
                                                                </span>
                                                            </span>

                                                            <span
                                                                class='attendance-member-card__status'
                                                                :class='{ "is-passing": row.meetsCutoff, "is-failing": !row.meetsCutoff }'
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
                                                            class='attendance-mark'
                                                            :class='{ "is-attended": event.attendees.has(row.id), "is-missed": !event.attendees.has(row.id) }'
                                                            :title='event.attendees.has(row.id) ? `${row.displayName} attended ${event.title}` : `${row.displayName} did not attend ${event.title}`'
                                                            @click='gotoEvent(event)'
                                                        >
                                                            <IconCheck
                                                                v-if='event.attendees.has(row.id)'
                                                                :size='18'
                                                                stroke='2'
                                                            />
                                                            <span v-else class='attendance-mark__dot' />
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

<script>
import NoAccess from './util/NoAccess.vue';
import TeamBadge from './util/TeamBadge.vue';
import iam from '../iam.js';
import {
    TablerBreadCrumb,
    TablerInput,
    TablerLoading
} from '@tak-ps/vue-tabler';
import {
    IconCheck
} from '@tabler/icons-vue';

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

export default {
    name: 'TeamAttendance',
    components: {
        IconCheck,
        NoAccess,
        TeamBadge,
        TablerInput,
        TablerBreadCrumb,
        TablerLoading
    },
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
            loading: {
                team: true,
                attendance: true
            },
            errors: {
                start: '',
                end: '',
                percent: '',
                count: ''
            },
            filter: {
                start: monthAgoDate(),
                end: todayDate(),
                eventType: 'all',
                cutoffMode: 'percent',
                percent: 33,
                count: 4
            },
            events: [],
            users: [],
            team: {
                id: null,
                name: '',
                body: ''
            }
        };
    },
    computed: {
        canViewMission: function() {
            return this.is_iam('Mission:View');
        },
        canViewTraining: function() {
            return this.is_iam('Training:View');
        },
        filteredEvents: function() {
            if (this.filter.eventType === 'mission') return this.events.filter((event) => event.source === 'mission');
            if (this.filter.eventType === 'training') return this.events.filter((event) => event.source === 'training');
            return this.events;
        },
        totalVisibleEvents: function() {
            return this.filteredEvents.length;
        },
        missionCount: function() {
            return this.events.filter((event) => event.source === 'mission').length;
        },
        trainingCount: function() {
            return this.events.filter((event) => event.source === 'training').length;
        },
        visibleMissionCount: function() {
            return this.filteredEvents.filter((event) => event.source === 'mission').length;
        },
        visibleTrainingCount: function() {
            return this.filteredEvents.filter((event) => event.source === 'training').length;
        },
        cutoffPercent: function() {
            const value = Number(this.filter.percent);
            return Number.isFinite(value) ? value : 0;
        },
        cutoffNumber: function() {
            const value = Number(this.filter.count);
            if (!Number.isFinite(value)) return 0;
            return Math.max(0, Math.floor(value));
        },
        requiredCount: function() {
            if (this.filter.cutoffMode === 'percent') {
                return Math.ceil(this.totalVisibleEvents * (this.cutoffPercent / 100));
            }

            return this.cutoffNumber;
        },
        rosterRows: function() {
            return [...this.users]
                .map((user) => {
                    const attended = this.filteredEvents.reduce((sum, event) => {
                        return sum + (event.attendees.has(user.id) ? 1 : 0);
                    }, 0);

                    const percent = this.totalVisibleEvents ? Math.round((attended / this.totalVisibleEvents) * 100) : 0;

                    return {
                        ...user,
                        attended,
                        percent,
                        initials: this.userInitials(user),
                        displayName: `${user.fname} ${user.lname}`,
                        meetsCutoff: attended >= this.requiredCount
                    };
                })
                .sort((a, b) => {
                    if (a.meetsCutoff !== b.meetsCutoff) return a.meetsCutoff ? -1 : 1;
                    if (a.attended !== b.attended) return b.attended - a.attended;
                    return a.displayName.localeCompare(b.displayName);
                });
        },
        passingUsers: function() {
            return this.rosterRows.filter((row) => row.meetsCutoff).length;
        },
        opportunityLabel: function() {
            if (this.filter.eventType === 'mission') return 'missions';
            if (this.filter.eventType === 'training') return 'trainings';
            return 'events';
        }
    },
    mounted: async function() {
        if (!this.is_iam('Team:View')) return;

        await this.fetchTeam();
        await this.refresh();
    },
    methods: {
        is_iam: function(permission) {
            return iam(this.iam, this.auth, permission);
        },
        setCutoffMode: function(mode) {
            if (mode === this.filter.cutoffMode) return;

            if (mode === 'number' && !this.cutoffNumber) {
                this.filter.count = Math.max(1, Math.ceil(this.totalVisibleEvents * (this.cutoffPercent / 100)));
            }

            this.filter.cutoffMode = mode;
        },
        validateFilters: function() {
            const rawCount = Number(this.filter.count);

            this.errors = {
                start: '',
                end: '',
                percent: '',
                count: ''
            };

            if (!this.filter.start) this.errors.start = 'Cannot be empty';
            if (!this.filter.end) this.errors.end = 'Cannot be empty';

            if (this.filter.start && this.filter.end && this.filter.start > this.filter.end) {
                this.errors.end = 'End date must be on or after the start date';
            }

            if (this.filter.cutoffMode === 'percent') {
                if (this.cutoffPercent < 0 || this.cutoffPercent > 100) {
                    this.errors.percent = 'Use a value between 0 and 100';
                }
            } else if (!Number.isFinite(rawCount) || rawCount < 0) {
                this.errors.count = 'Use a value of 0 or more';
            }

            return !Object.values(this.errors).some(Boolean);
        },
        refresh: async function() {
            if (!this.validateFilters()) return;

            this.loading.attendance = true;

            await Promise.all([
                this.fetchUsers(),
                this.fetchEvents()
            ]);

            if (this.filter.eventType === 'mission' && !this.canViewMission) this.filter.eventType = 'all';
            if (this.filter.eventType === 'training' && !this.canViewTraining) this.filter.eventType = 'all';

            this.loading.attendance = false;
        },
        fetchTeam: async function() {
            this.loading.team = true;
            this.team = await window.std(`/api/team/${this.$route.params.teamid}`);
            this.loading.team = false;
        },
        fetchUsers: async function() {
            const url = window.stdurl('/api/user');
            url.searchParams.append('team', this.team.id);
            url.searchParams.append('limit', 1000);

            const list = await window.std(url);
            this.users = list.items;
        },
        fetchEvents: async function() {
            const tasks = [];

            if (this.canViewMission) tasks.push(this.fetchEventsByType('mission'));
            if (this.canViewTraining) tasks.push(this.fetchEventsByType('training'));

            const results = await Promise.all(tasks);
            this.events = results
                .flat()
                .sort((a, b) => new Date(a.start_ts) - new Date(b.start_ts));
        },
        fetchEventsByType: async function(source) {
            const url = window.stdurl(`/api/${source}`);
            url.searchParams.append('start', rangeBoundary(this.filter.start));
            url.searchParams.append('end', rangeBoundary(this.filter.end, true));
            url.searchParams.append('limit', 1000);
            url.searchParams.append('team', this.team.id);

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
        },
        gotoEvent: function(event) {
            this.$router.push(event.route);
        },
        gotoUser: function(user) {
            this.$router.push(`/user/${user.id}`);
        },
        formatDate: function(value) {
            return new Intl.DateTimeFormat('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            }).format(parseDateValue(value));
        },
        eventTooltip: function(event) {
            return `${event.sourceLabel}: ${event.title} (${this.formatDate(event.start_ts)} to ${this.formatDate(event.end_ts)})`;
        },
        userInitials: function(user) {
            return `${user.fname?.[0] || ''}${user.lname?.[0] || ''}`.toUpperCase();
        }
    }
};
</script>

<style scoped>
.attendance-page {
    position: relative;
}

.attendance-hero {
    overflow: hidden;
    border: none;
    color: #f4fbff;
    background:
        radial-gradient(circle at top right, rgba(253, 233, 155, 0.28), transparent 30%),
        linear-gradient(135deg, #17324d 0%, #1f6871 55%, #2aa0a0 100%);
    box-shadow: 0 28px 60px rgba(17, 39, 58, 0.2);
}

.attendance-hero__body {
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
    justify-content: space-between;
    padding: 1.75rem 1.75rem 1rem;
}

.attendance-hero__copy {
    max-width: 42rem;
}

.attendance-hero__eyebrow {
    margin-bottom: 0.65rem;
    font-size: 0.74rem;
    font-weight: 700;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    opacity: 0.78;
}

.attendance-hero__title {
    margin: 0;
    font-family: 'Iowan Old Style', 'Palatino Linotype', 'Book Antiqua', Georgia, serif;
    font-size: clamp(2rem, 3vw, 3.25rem);
    font-weight: 700;
    line-height: 1;
}

.attendance-hero__subtitle {
    max-width: 34rem;
    margin: 1rem 0 0;
    color: rgba(244, 251, 255, 0.82);
    font-size: 1rem;
    line-height: 1.6;
}

.attendance-hero__meta {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.85rem;
}

.attendance-hero__range {
    padding: 0.7rem 1rem;
    border: 1px solid rgba(255, 255, 255, 0.22);
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.08);
    font-weight: 600;
}

.attendance-hero__stats {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 1rem;
    padding: 0 1.75rem 1.75rem;
}

.attendance-stat-tile {
    min-height: 6.5rem;
    padding: 1rem 1.1rem;
    border: 1px solid rgba(255, 255, 255, 0.16);
    border-radius: 1.1rem;
    background: rgba(255, 255, 255, 0.12);
    backdrop-filter: blur(8px);
}

.attendance-stat-tile__label {
    margin-bottom: 0.45rem;
    color: rgba(244, 251, 255, 0.72);
    font-size: 0.74rem;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
}

.attendance-stat-tile__value {
    font-size: 2rem;
    font-weight: 700;
}

.attendance-panel {
    border: none;
    box-shadow: 0 18px 40px rgba(19, 39, 54, 0.08);
}

.attendance-controls {
    display: grid;
    gap: 1.25rem;
}

.attendance-controls__inputs {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
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

.attendance-segmented {
    display: flex;
    flex-wrap: wrap;
    gap: 0.65rem;
}

.attendance-segmented__button {
    padding: 0.75rem 1rem;
    border: 1px solid #d6e2ea;
    border-radius: 999px;
    background: linear-gradient(180deg, #ffffff 0%, #f4f8fb 100%);
    color: #264454;
    font-weight: 700;
    transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease, background 0.2s ease;
}

.attendance-segmented__button:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 10px 20px rgba(26, 53, 71, 0.08);
}

.attendance-segmented__button.is-active {
    border-color: #134461;
    background: linear-gradient(135deg, #153f5b 0%, #1a6b73 100%);
    color: #ffffff;
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

.attendance-summary-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 1rem;
    margin-bottom: 1rem;
}

.attendance-summary-card {
    padding: 1.3rem;
    border: none;
    background: linear-gradient(180deg, #ffffff 0%, #f9fbfc 100%);
    box-shadow: 0 16px 30px rgba(19, 39, 54, 0.08);
}

.attendance-summary-card__label {
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #637888;
}

.attendance-summary-card__value {
    margin: 0.6rem 0;
    color: #17324d;
    font-size: 2rem;
    font-weight: 700;
}

.attendance-summary-card__detail {
    color: #566c7b;
    line-height: 1.5;
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
    border: none;
    background: linear-gradient(180deg, #f8fbfb 0%, #ffffff 100%);
    box-shadow: 0 22px 45px rgba(19, 39, 54, 0.09);
}

.attendance-roster-card__header {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    justify-content: space-between;
    align-items: center;
}

.attendance-roster-card__subtitle {
    color: #617786;
    font-size: 0.95rem;
}

.attendance-legend {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
}

.attendance-legend__item {
    display: inline-flex;
    align-items: center;
    gap: 0.45rem;
    color: #4d6473;
    font-weight: 600;
}

.attendance-legend__swatch {
    width: 0.9rem;
    height: 0.9rem;
    border-radius: 999px;
    display: inline-block;
}

.attendance-legend__swatch.is-attended {
    background: linear-gradient(135deg, #0e8d7f 0%, #48c692 100%);
}

.attendance-legend__swatch.is-missed {
    background: #dbe6ec;
}

.attendance-matrix-wrap {
    overflow: auto;
    padding: 0 1.25rem 1.25rem;
}

.attendance-matrix {
    width: max-content;
    min-width: 100%;
    border-collapse: separate;
    border-spacing: 0 0.9rem;
}

.attendance-matrix__member-col {
    position: sticky;
    left: 0;
    z-index: 3;
    min-width: 20rem;
    padding: 0 1rem 0 0;
    background: transparent;
}

.attendance-matrix__event-col {
    min-width: 11rem;
    padding: 0 0.6rem;
    vertical-align: top;
}

.attendance-event-card {
    display: grid;
    gap: 0.6rem;
    width: 100%;
    min-height: 8.75rem;
    padding: 1rem;
    text-align: left;
    border: 1px solid #dce6eb;
    border-radius: 1.1rem;
    background: linear-gradient(180deg, #ffffff 0%, #f4f8fb 100%);
    box-shadow: 0 10px 25px rgba(27, 53, 69, 0.08);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.attendance-event-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 16px 28px rgba(27, 53, 69, 0.14);
}

.attendance-event-card.is-mission {
    background: linear-gradient(180deg, #fff7ef 0%, #fffdf9 100%);
}

.attendance-event-card.is-training {
    background: linear-gradient(180deg, #eff8f7 0%, #fbfefd 100%);
}

.attendance-event-card__type {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
    align-items: center;
}

.attendance-event-card__badge,
.attendance-event-card__required {
    display: inline-flex;
    align-items: center;
    padding: 0.28rem 0.55rem;
    border-radius: 999px;
    font-size: 0.68rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
}

.attendance-event-card__badge.is-mission {
    background: rgba(209, 118, 0, 0.12);
    color: #9b4f00;
}

.attendance-event-card__badge.is-training {
    background: rgba(12, 138, 113, 0.12);
    color: #0c725e;
}

.attendance-event-card__required {
    background: rgba(190, 54, 49, 0.12);
    color: #b43b35;
}

.attendance-event-card__title {
    color: #17324d;
    font-weight: 700;
    line-height: 1.35;
}

.attendance-event-card__date {
    color: #617786;
    font-size: 0.9rem;
}

.attendance-row.is-failing .attendance-member-card {
    border-color: rgba(195, 74, 71, 0.24);
    background: linear-gradient(180deg, #fff8f6 0%, #ffffff 100%);
}

.attendance-member-card {
    display: grid;
    grid-template-columns: auto 1fr auto;
    align-items: center;
    gap: 1rem;
    width: 100%;
    padding: 1rem 1.1rem;
    text-align: left;
    border: 1px solid #dce6eb;
    border-radius: 1.1rem;
    background: linear-gradient(180deg, #ffffff 0%, #f7fafc 100%);
    box-shadow: 0 10px 22px rgba(27, 53, 69, 0.08);
}

.attendance-member-card__avatar {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 3rem;
    height: 3rem;
    border-radius: 999px;
    background: linear-gradient(135deg, #17324d 0%, #2a8b88 100%);
    color: #ffffff;
    font-weight: 700;
}

.attendance-member-card__meta {
    display: grid;
    gap: 0.35rem;
}

.attendance-member-card__name {
    color: #17324d;
    font-weight: 700;
}

.attendance-member-card__stats {
    display: flex;
    flex-wrap: wrap;
    gap: 0.7rem;
    color: #627786;
    font-size: 0.92rem;
}

.attendance-member-card__progress {
    position: relative;
    display: block;
    width: 100%;
    height: 0.48rem;
    overflow: hidden;
    border-radius: 999px;
    background: #deeaef;
}

.attendance-member-card__progress-bar {
    position: absolute;
    inset: 0 auto 0 0;
    display: block;
    border-radius: inherit;
    background: linear-gradient(90deg, #1a6b73 0%, #35b38f 100%);
}

.attendance-member-card__status {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.45rem 0.8rem;
    border-radius: 999px;
    font-size: 0.74rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
}

.attendance-member-card__status.is-passing {
    background: rgba(12, 138, 113, 0.12);
    color: #0d7860;
}

.attendance-member-card__status.is-failing {
    background: rgba(190, 54, 49, 0.12);
    color: #b43b35;
}

.attendance-matrix__cell {
    padding: 0 0.6rem;
    text-align: center;
    vertical-align: middle;
}

.attendance-mark {
    width: 3rem;
    height: 3rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 1px solid #dbe5ea;
    border-radius: 1rem;
    background: #f6fafc;
    color: #3b5566;
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.9);
    transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
}

.attendance-mark:hover {
    transform: translateY(-1px);
    box-shadow: 0 10px 16px rgba(27, 53, 69, 0.12);
}

.attendance-mark.is-attended {
    border-color: rgba(12, 138, 113, 0.2);
    background: linear-gradient(135deg, #0e8d7f 0%, #48c692 100%);
    color: #ffffff;
}

.attendance-mark.is-missed {
    background: linear-gradient(180deg, #f7fafc 0%, #eef4f7 100%);
}

.attendance-mark__dot {
    width: 0.45rem;
    height: 0.45rem;
    border-radius: 999px;
    background: #8aa0ae;
}

@media (max-width: 1100px) {
    .attendance-hero__stats,
    .attendance-summary-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .attendance-controls__inputs {
        grid-template-columns: 1fr;
    }
}

@media (max-width: 768px) {
    .attendance-hero__body,
    .attendance-hero__stats {
        padding-left: 1.25rem;
        padding-right: 1.25rem;
    }

    .attendance-hero__stats,
    .attendance-summary-grid {
        grid-template-columns: 1fr;
    }

    .attendance-controls__footer,
    .attendance-roster-card__header {
        align-items: flex-start;
    }

    .attendance-member-card {
        grid-template-columns: auto 1fr;
    }

    .attendance-member-card__status {
        grid-column: 1 / -1;
        justify-self: flex-start;
    }

    .attendance-matrix__member-col {
        min-width: 17rem;
    }
}
</style>
