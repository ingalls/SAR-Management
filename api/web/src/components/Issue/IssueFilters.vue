<template>
    <div class='issue-filters border-bottom'>
        <div class='px-3 pt-3 pb-2'>
            <div class='row g-2 align-items-center'>
                <div class='col'>
                    <TablerInput
                        :model-value='modelValue.filter'
                        icon='search'
                        placeholder='Search issues…'
                        @update:model-value='update({ filter: $event })'
                    />
                </div>
                <div class='col-auto'>
                    <div
                        class='btn-group'
                        role='group'
                        aria-label='Issue Status'
                    >
                        <button
                            v-for='opt in STATUS_OPTIONS'
                            :key='opt.value'
                            type='button'
                            class='btn'
                            :class='modelValue.status === opt.value ? "btn-primary" : "btn-outline-secondary"'
                            @click='update({ status: opt.value })'
                            v-text='opt.label'
                        />
                    </div>
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
                        class='btn'
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
                    :class='modelValue.assigned ? "btn-primary" : "btn-outline-secondary"'
                    @click='update({ assigned: !modelValue.assigned })'
                >
                    <IconUserCheck
                        :size='16'
                        stroke='1.5'
                        class='me-1'
                    />
                    Assigned to me
                </button>
                <button
                    v-if='auth && auth.id'
                    type='button'
                    class='btn btn-sm btn-pill'
                    :class='modelValue.author ? "btn-primary" : "btn-outline-secondary"'
                    @click='update({ author: !modelValue.author })'
                >
                    <IconPencil
                        :size='16'
                        stroke='1.5'
                        class='me-1'
                    />
                    Created by me
                </button>
                <button
                    type='button'
                    class='btn btn-sm btn-pill'
                    :class='modelValue.poll === true ? "btn-primary" : "btn-outline-secondary"'
                    @click='update({ poll: modelValue.poll === true ? null : true })'
                >
                    <IconChartBar
                        :size='16'
                        stroke='1.5'
                        class='me-1'
                    />
                    Has Poll
                </button>

                <span
                    v-if='total !== null'
                    class='ms-auto text-muted small'
                    v-text='`${total} issue${total === 1 ? "" : "s"}`'
                />
            </div>
        </div>

        <div
            v-if='expanded'
            class='px-3 pb-3 pt-2 border-top bg-surface-secondary'
        >
            <div class='row g-3'>
                <div class='col-md-8'>
                    <label class='form-label'>
                        Tags
                        <span class='form-label-description'>any selected</span>
                    </label>
                    <div
                        v-if='tags.length'
                        class='d-flex flex-wrap gap-1'
                    >
                        <span
                            v-for='tag in tags'
                            :key='tag.id'
                            class='cursor-pointer filter-chip'
                            :class='{ "filter-chip--off": !modelValue.tag.includes(tag.id) }'
                            role='button'
                            @click='toggleTag(tag.id)'
                        >
                            <TagBadge :tag='tag' />
                        </span>
                    </div>
                    <div
                        v-else
                        class='text-muted small'
                    >
                        No Issue Tags have been created yet - add them under Admin › Issue Tags
                    </div>
                </div>
                <div class='col-md-4'>
                    <label class='form-label'>Poll</label>
                    <select
                        class='form-select'
                        :value='modelValue.poll === null ? "" : String(modelValue.poll)'
                        @change='update({ poll: $event.target.value === "" ? null : $event.target.value === "true" })'
                    >
                        <option value=''>
                            Any
                        </option>
                        <option value='true'>
                            With poll
                        </option>
                        <option value='false'>
                            Without poll
                        </option>
                    </select>
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
import { ref, computed, onMounted } from 'vue';
import { TablerInput } from '@tak-ps/vue-tabler';
import {
    IconAdjustmentsHorizontal,
    IconUserCheck,
    IconPencil,
    IconChartBar,
    IconX
} from '@tabler/icons-vue';
import TagBadge from '../util/TagBadge.vue';
import {
    defaultFilters,
    activeCount,
    STATUS_OPTIONS,
    SORT_OPTIONS
} from '../../base/issue-filters.js';

/**
 * Search & filter panel for the Issues list - the Issues counterpart of
 * Mission/MissionFilters.vue. Emits a new filters object on every change
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

const expanded = ref(props.modelValue.tag.length > 0);
const tags = ref([]);

const active = computed(() => activeCount(props.modelValue));
const sortKey = computed(() => `${props.modelValue.sort}-${props.modelValue.order}`);

function update(patch) {
    emit('update:modelValue', { ...props.modelValue, ...patch });
}

function setSort(key) {
    const opt = SORT_OPTIONS.find((o) => `${o.sort}-${o.order}` === key);
    if (opt) update({ sort: opt.sort, order: opt.order });
}

function toggleTag(id) {
    const list = props.modelValue.tag.includes(id)
        ? props.modelValue.tag.filter((v) => v !== id)
        : [...props.modelValue.tag, id];
    update({ tag: list });
}

function clearAll() {
    update(defaultFilters({
        filter: props.modelValue.filter,
        status: props.modelValue.status,
        sort: props.modelValue.sort,
        order: props.modelValue.order
    }));
}

const tagName = (id) => (tags.value.find((t) => t.id === id) || {}).name || `Tag #${id}`;

const chips = computed(() => {
    const f = props.modelValue;
    const out = [];
    for (const id of f.tag) out.push({ key: `tag-${id}`, label: `Tag: ${tagName(id)}`, remove: () => toggleTag(id) });
    if (f.assigned) out.push({ key: 'assigned', label: 'Assigned to me', remove: () => update({ assigned: false }) });
    if (f.author) out.push({ key: 'author', label: 'Created by me', remove: () => update({ author: false }) });
    if (f.poll === true) out.push({ key: 'poll', label: 'Has poll', remove: () => update({ poll: null }) });
    if (f.poll === false) out.push({ key: 'poll', label: 'No poll', remove: () => update({ poll: null }) });
    return out;
});

onMounted(async () => {
    const res = await window.std('/api/issue-tag?limit=100&sort=name&order=asc');
    tags.value = res.items;
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
