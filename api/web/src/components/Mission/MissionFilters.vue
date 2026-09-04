<template>
    <div class='mission-filters border-bottom'>
        <div class='px-3 pt-3 pb-2'>
            <div class='row g-2 align-items-center'>
                <div class='col'>
                    <TablerInput
                        :model-value='modelValue.filter'
                        icon='search'
                        placeholder='Search title, description, location or mission number…'
                        @update:model-value='update({ filter: $event })'
                    />
                </div>
                <div class='col-auto'>
                    <select
                        class='form-select'
                        :value='sortKey'
                        title='Sort'
                        @change='setSort($event.target.value)'
                    >
                        <option
                            v-for='opt in SORT_OPTIONS'
                            :key='`${opt.sort}-${opt.order}`'
                            :value='`${opt.sort}-${opt.order}`'
                            v-text='opt.label'
                        />
                    </select>
                </div>
                <div class='col-auto'>
                    <button
                        type='button'
                        class='btn position-relative'
                        :class='expanded ? "btn-primary" : "btn-outline-secondary"'
                        title='Advanced Filters'
                        @click='expanded = !expanded'
                    >
                        <IconAdjustmentsHorizontal
                            :size='20'
                            stroke='1.5'
                            class='me-1'
                        />
                        Filters
                        <span
                            v-if='active'
                            class='badge bg-red text-white ms-2'
                            v-text='active'
                        />
                    </button>
                </div>
            </div>

            <div class='d-flex flex-wrap align-items-center gap-2 mt-2'>
                <span class='text-muted small me-1'>Quick:</span>
                <button
                    v-if='auth && auth.id'
                    type='button'
                    class='btn btn-sm btn-pill'
                    :class='modelValue.attended ? "btn-primary" : "btn-outline-secondary"'
                    @click='update({ attended: !modelValue.attended })'
                >
                    <IconUserCheck
                        :size='16'
                        stroke='1.5'
                        class='me-1'
                    />
                    Attended by me
                </button>
                <button
                    type='button'
                    class='btn btn-sm btn-pill'
                    :class='isPreset("Last 30 Days") ? "btn-primary" : "btn-outline-secondary"'
                    @click='togglePreset("Last 30 Days")'
                >
                    Last 30 Days
                </button>
                <button
                    type='button'
                    class='btn btn-sm btn-pill'
                    :class='isPreset("This Year") ? "btn-primary" : "btn-outline-secondary"'
                    @click='togglePreset("This Year")'
                >
                    This Year
                </button>
                <button
                    type='button'
                    class='btn btn-sm btn-pill'
                    :class='modelValue.incidents === true ? "btn-primary" : "btn-outline-secondary"'
                    @click='update({ incidents: modelValue.incidents === true ? null : true })'
                >
                    Has Incidents
                </button>
                <button
                    type='button'
                    class='btn btn-sm btn-pill'
                    :class='modelValue.people === true ? "btn-primary" : "btn-outline-secondary"'
                    @click='update({ people: modelValue.people === true ? null : true })'
                >
                    Has Subjects
                </button>
                <button
                    type='button'
                    class='btn btn-sm btn-pill'
                    :class='modelValue.users_min === 10 && modelValue.users_max === null ? "btn-primary" : "btn-outline-secondary"'
                    @click='update(modelValue.users_min === 10 && modelValue.users_max === null ? { users_min: null } : { users_min: 10, users_max: null })'
                >
                    10+ Personnel
                </button>

                <span
                    v-if='total !== null'
                    class='ms-auto text-muted small'
                    v-text='`${total} mission${total === 1 ? "" : "s"}`'
                />
            </div>
        </div>

        <div
            v-if='expanded'
            class='px-3 pb-3 pt-2 border-top bg-surface-secondary'
        >
            <div class='row g-3'>
                <div class='col-md-6'>
                    <label class='form-label'>Date Range</label>
                    <div class='row g-2'>
                        <div class='col-6'>
                            <TablerInput
                                :model-value='modelValue.start'
                                type='date'
                                placeholder='Start'
                                @update:model-value='update({ start: $event })'
                            />
                        </div>
                        <div class='col-6'>
                            <TablerInput
                                :model-value='modelValue.end'
                                type='date'
                                placeholder='End'
                                @update:model-value='update({ end: $event })'
                            />
                        </div>
                    </div>
                    <div class='d-flex flex-wrap gap-1 mt-2'>
                        <button
                            v-for='preset in DATE_PRESETS'
                            :key='preset.label'
                            type='button'
                            class='btn btn-sm'
                            :class='isPreset(preset.label) ? "btn-primary" : "btn-ghost-secondary"'
                            @click='togglePreset(preset.label)'
                            v-text='preset.label'
                        />
                    </div>
                </div>

                <div class='col-md-3'>
                    <label class='form-label'>Personnel</label>
                    <div class='row g-2'>
                        <div class='col-6'>
                            <input
                                type='number'
                                min='0'
                                class='form-control'
                                placeholder='Min'
                                :value='modelValue.users_min ?? ""'
                                @change='update({ users_min: toInt($event.target.value) })'
                            >
                        </div>
                        <div class='col-6'>
                            <input
                                type='number'
                                min='0'
                                class='form-control'
                                placeholder='Max'
                                :value='modelValue.users_max ?? ""'
                                @change='update({ users_max: toInt($event.target.value) })'
                            >
                        </div>
                    </div>
                </div>

                <div class='col-md-3'>
                    <label class='form-label'>Map Location</label>
                    <select
                        class='form-select'
                        :value='modelValue.geom === null ? "" : String(modelValue.geom)'
                        @change='update({ geom: $event.target.value === "" ? null : $event.target.value === "true" })'
                    >
                        <option value=''>
                            Any
                        </option>
                        <option value='true'>
                            With map location
                        </option>
                        <option value='false'>
                            Without map location
                        </option>
                    </select>
                </div>

                <div
                    v-if='tags.length'
                    class='col-md-6'
                >
                    <label class='form-label'>
                        Tags
                        <span class='form-label-description'>any selected</span>
                    </label>
                    <div class='d-flex flex-wrap gap-1'>
                        <span
                            v-for='tag in tags'
                            :key='tag.id'
                            class='cursor-pointer filter-chip'
                            :class='{ "filter-chip--off": !modelValue.tag.includes(tag.id) }'
                            role='button'
                            @click='toggleId("tag", tag.id)'
                        >
                            <TagBadge :tag='tag' />
                        </span>
                    </div>
                </div>

                <div
                    v-if='teams.length'
                    class='col-md-6'
                >
                    <label class='form-label'>
                        Teams
                        <span class='form-label-description'>any selected</span>
                    </label>
                    <div class='d-flex flex-wrap gap-1'>
                        <span
                            v-for='team in teams'
                            :key='team.id'
                            class='cursor-pointer filter-chip'
                            :class='{ "filter-chip--off": !modelValue.team.includes(team.id) }'
                            role='button'
                            @click='toggleId("team", team.id)'
                        >
                            <TeamBadge :team='team' />
                        </span>
                    </div>
                </div>

                <div
                    v-if='agencies.length > 1'
                    class='col-md-6'
                >
                    <label class='form-label'>
                        Agencies
                        <span class='form-label-description'>any selected</span>
                    </label>
                    <div class='d-flex flex-wrap gap-1'>
                        <button
                            v-for='agency in agencies'
                            :key='agency.id'
                            type='button'
                            class='btn btn-sm btn-pill'
                            :class='modelValue.agency.includes(agency.id) ? "btn-primary" : "btn-outline-secondary"'
                            @click='toggleId("agency", agency.id)'
                            v-text='agency.name'
                        />
                    </div>
                </div>

                <div class='col-md-6'>
                    <label class='form-label'>
                        Attendees
                        <span class='form-label-description'>all selected attended</span>
                    </label>
                    <div class='d-flex flex-wrap gap-1 mb-2'>
                        <span
                            v-for='id in modelValue.user'
                            :key='id'
                            class='badge bg-blue-lt d-inline-flex align-items-center'
                        >
                            <span v-text='userName(id)' />
                            <IconX
                                :size='14'
                                stroke='1.5'
                                class='ms-1 cursor-pointer'
                                @click='toggleId("user", id)'
                            />
                        </span>
                    </div>
                    <TablerDropdown>
                        <button
                            type='button'
                            class='btn btn-sm btn-outline-secondary dropdown-toggle'
                        >
                            <IconUserPlus
                                :size='16'
                                stroke='1.5'
                                class='me-1'
                            />
                            Add Attendee
                        </button>
                        <template #dropdown>
                            <div
                                class='p-2'
                                style='min-width: 280px;'
                                @click.stop=''
                            >
                                <TablerInput
                                    v-model='userFilter'
                                    icon='search'
                                    placeholder='Search Users…'
                                />
                                <div
                                    v-for='user in userResults'
                                    :key='user.id'
                                    class='d-flex align-items-center my-1 p-2 cursor-pointer rounded hover-shadow'
                                    @click='addUser(user)'
                                >
                                    <Avatar :user='user' />
                                </div>
                                <div
                                    v-if='!userResults.length'
                                    class='text-muted text-center small py-2'
                                >
                                    No users found
                                </div>
                            </div>
                        </template>
                    </TablerDropdown>
                </div>
            </div>
        </div>

        <div
            v-if='chips.length'
            class='px-3 py-2 border-top d-flex flex-wrap align-items-center gap-1'
        >
            <span
                v-for='chip in chips'
                :key='chip.key'
                class='badge bg-azure-lt d-inline-flex align-items-center'
            >
                <span v-text='chip.label' />
                <IconX
                    :size='14'
                    stroke='1.5'
                    class='ms-1 cursor-pointer'
                    :title='`Remove ${chip.label}`'
                    @click='chip.remove()'
                />
            </span>
            <button
                type='button'
                class='btn btn-sm btn-link ms-auto'
                @click='clearAll'
            >
                Clear all
            </button>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import {
    TablerInput,
    TablerDropdown
} from '@tak-ps/vue-tabler';
import {
    IconAdjustmentsHorizontal,
    IconUserCheck,
    IconUserPlus,
    IconX
} from '@tabler/icons-vue';
import TagBadge from '../util/TagBadge.vue';
import TeamBadge from '../util/TeamBadge.vue';
import Avatar from '../util/Avatar.vue';
import {
    defaultFilters,
    activeCount,
    DATE_PRESETS,
    SORT_OPTIONS
} from '../../base/mission-filters.js';

/**
 * Search & filter panel for the Missions list. Filters live in the parent as
 * a plain object (see base/mission-filters.js) - every change emits a new
 * object so the parent can refetch, sync the URL and update the heat map.
 */
const props = defineProps({
    modelValue: {
        type: Object,
        required: true
    },
    auth: {
        type: Object,
        default: null
    },
    total: {
        type: Number,
        default: null
    }
});

const emit = defineEmits(['update:modelValue']);

const expanded = ref(activeCount(props.modelValue) > 0 && (props.modelValue.tag.length + props.modelValue.team.length + props.modelValue.user.length) > 0);
const tags = ref([]);
const teams = ref([]);
const agencies = ref([]);
const userFilter = ref('');
const userResults = ref([]);
const userCache = ref({});

const active = computed(() => activeCount(props.modelValue));
const sortKey = computed(() => `${props.modelValue.sort}-${props.modelValue.order}`);

function update(patch) {
    emit('update:modelValue', { ...props.modelValue, ...patch });
}

function setSort(key) {
    const opt = SORT_OPTIONS.find((o) => `${o.sort}-${o.order}` === key);
    if (opt) update({ sort: opt.sort, order: opt.order });
}

function toInt(value) {
    if (value === '' || value === null || value === undefined) return null;
    const n = parseInt(value, 10);
    return Number.isInteger(n) && n >= 0 ? n : null;
}

function toggleId(key, id) {
    const list = props.modelValue[key].includes(id)
        ? props.modelValue[key].filter((v) => v !== id)
        : [...props.modelValue[key], id];
    update({ [key]: list });
}

function presetRange(label) {
    const preset = DATE_PRESETS.find((p) => p.label === label);
    return preset ? preset.range() : null;
}

function isPreset(label) {
    const range = presetRange(label);
    return !!range && props.modelValue.start === range.start && props.modelValue.end === range.end;
}

function togglePreset(label) {
    if (isPreset(label)) {
        update({ start: '', end: '' });
    } else {
        update(presetRange(label));
    }
}

function clearAll() {
    update(defaultFilters({
        filter: props.modelValue.filter,
        sort: props.modelValue.sort,
        order: props.modelValue.order
    }));
}

function userName(id) {
    const user = userCache.value[id];
    return user ? `${user.fname} ${user.lname}`.trim() || user.username : `User #${id}`;
}

function addUser(user) {
    userCache.value[user.id] = user;
    if (!props.modelValue.user.includes(user.id)) toggleId('user', user.id);
}

const tagName = (id) => (tags.value.find((t) => t.id === id) || {}).name || `Tag #${id}`;
const teamName = (id) => (teams.value.find((t) => t.id === id) || {}).name || `Team #${id}`;
const agencyName = (id) => (agencies.value.find((a) => a.id === id) || {}).name || `Agency #${id}`;

// Removable summary of everything currently applied
const chips = computed(() => {
    const f = props.modelValue;
    const out = [];

    if (f.start || f.end) {
        const preset = DATE_PRESETS.find((p) => isPreset(p.label));
        out.push({
            key: 'dates',
            label: preset ? preset.label : `${f.start || '…'} → ${f.end || '…'}`,
            remove: () => update({ start: '', end: '' })
        });
    }
    if (f.attended) out.push({ key: 'attended', label: 'Attended by me', remove: () => update({ attended: false }) });
    for (const id of f.tag) out.push({ key: `tag-${id}`, label: `Tag: ${tagName(id)}`, remove: () => toggleId('tag', id) });
    for (const id of f.team) out.push({ key: `team-${id}`, label: `Team: ${teamName(id)}`, remove: () => toggleId('team', id) });
    for (const id of f.agency) out.push({ key: `agency-${id}`, label: `Agency: ${agencyName(id)}`, remove: () => toggleId('agency', id) });
    for (const id of f.user) out.push({ key: `user-${id}`, label: `Attendee: ${userName(id)}`, remove: () => toggleId('user', id) });
    if (f.geom === true) out.push({ key: 'geom', label: 'With map location', remove: () => update({ geom: null }) });
    if (f.geom === false) out.push({ key: 'geom', label: 'Without map location', remove: () => update({ geom: null }) });
    if (f.incidents === true) out.push({ key: 'incidents', label: 'Has incidents', remove: () => update({ incidents: null }) });
    if (f.incidents === false) out.push({ key: 'incidents', label: 'No incidents', remove: () => update({ incidents: null }) });
    if (f.people === true) out.push({ key: 'people', label: 'Has subjects', remove: () => update({ people: null }) });
    if (f.people === false) out.push({ key: 'people', label: 'No subjects', remove: () => update({ people: null }) });
    if (Number.isInteger(f.users_min) || Number.isInteger(f.users_max)) {
        let label = 'Personnel: ';
        if (Number.isInteger(f.users_min) && Number.isInteger(f.users_max)) label += `${f.users_min}–${f.users_max}`;
        else if (Number.isInteger(f.users_min)) label += `${f.users_min}+`;
        else label += `≤ ${f.users_max}`;
        out.push({ key: 'personnel', label, remove: () => update({ users_min: null, users_max: null }) });
    }

    return out;
});

async function listUsers() {
    const url = window.stdurl('/api/user');
    url.searchParams.set('filter', userFilter.value);
    url.searchParams.set('limit', '8');
    url.searchParams.set('disabled', 'false');
    const res = await window.std(url);
    userResults.value = res.items.filter((u) => !props.modelValue.user.includes(u.id));
}

async function loadOptions() {
    const [tagRes, teamRes, agencyRes] = await Promise.all([
        window.std('/api/mission-tag?limit=100&sort=name&order=asc'),
        window.std('/api/team?limit=100&sort=name&order=asc'),
        window.std('/api/agency?limit=100')
    ]);
    tags.value = tagRes.items;
    teams.value = teamRes.items;
    agencies.value = agencyRes.items.filter((a) => !a.archived);

    // Names for attendee IDs restored from the URL
    await Promise.all(props.modelValue.user.filter((id) => !userCache.value[id]).map(async (id) => {
        try {
            userCache.value[id] = await window.std(`/api/user/${id}`);
        } catch {
            // Unknown user - the chip falls back to the ID
        }
    }));
}

watch(userFilter, listUsers);
watch(() => props.modelValue.user, listUsers);

onMounted(async () => {
    await Promise.all([loadOptions(), listUsers()]);
});
</script>

<style scoped>
.filter-chip {
    transition: opacity 0.15s ease, transform 0.15s ease;
}

.filter-chip--off {
    opacity: 0.45;
}

.filter-chip:hover {
    opacity: 1;
    transform: translateY(-1px);
}
</style>
