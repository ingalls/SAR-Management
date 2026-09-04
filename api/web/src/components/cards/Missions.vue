<template>
    <div class='card'>
        <div class='card-header'>
            <IconGripVertical
                v-if='dragHandle'
                class='drag-handle cursor-move'
                size='24'
                stroke='1'
            />
            <h3 class='card-title'>
                <a
                    class='cursor-pointer'
                    @click='goto'
                    v-text='label'
                />
            </h3>

            <div class='btn-list ms-auto'>
                <TablerIconButton
                    v-if='create && is_iam("Mission:Manage")'
                    title='Create Mission'
                    @click='$router.push(`/mission/new`)'
                >
                    <IconPlus
                        size='32'
                        stroke='1'
                    />
                </TablerIconButton>
                <Export
                    v-if='is_iam("Mission:View")'
                    :formats='["csv"]'
                    :show-button-text='false'
                    title='Export Missions'
                    @export='exportMissions'
                />
                <TablerRefreshButton
                    v-if='is_iam("Mission:View")'
                    @click='fetch'
                />
            </div>
        </div>

        <MissionFilters
            v-if='search'
            v-model='filters'
            :auth='auth'
            :total='loading ? null : list.total'
        />

        <NoAccess
            v-if='!is_iam("Mission:View")'
        />
        <TablerLoading
            v-else-if='loading'
            desc='Loading Missions'
        />
        <TablerNone
            v-else-if='!list.items.length'
            :create='false'
            label='No Missions'
        />
        <template v-else>
            <div class='d-flex flex-column gap-3 p-3'>
                <StandardItemMission
                    v-for='mission in list.items'
                    :key='mission.id'
                    :mission='mission'
                    :auth='auth'
                    :attendance='attendance'
                />
            </div>
            <TableFooter
                v-if='footer'
                :limit='paging.limit'
                :total='list.total'
                @page='paging.page = $event'
            />
        </template>
    </div>
</template>

<script setup>
import { ref, reactive, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import StandardItemMission from '../util/StandardItemMission.vue'
import MissionFilters from '../Mission/MissionFilters.vue'
import { defaultFilters, applyFilters, toQuery } from '../../base/mission-filters.js'
import iamHelper from '../../iam.js';
import NoAccess from '../util/NoAccess.vue';
import TableFooter from '../util/TableFooter.vue';
import Export from '../util/Export.vue';
import {
    TablerNone,
    TablerRefreshButton,
    TablerIconButton,
    TablerLoading
} from '@tak-ps/vue-tabler'

import {
    IconGripVertical,
    IconPlus
} from '@tabler/icons-vue';

const props = defineProps({
    label: {
        type: String,
        default: 'Recent Missions'
    },
    iam: {
        type: Object,
        required: true
    },
    start: {
        type: Number
    },
    order: {
        type: String,
        default: 'desc'
    },
    end: {
        type: Number
    },
    dragHandle: {
        type: Boolean,
        default: false
    },
    footer: {
        type: Boolean,
        default: true
    },
    auth: {
        type: Object,
        required: true
    },
    create: {
        type: Boolean,
        default: true
    },
    limit: {
        type: Number,
        default: 10
    },
    search: {
        type: Boolean,
        default: false
    },
    assigned: {
        type: Number
    },
    attendance: {
        type: Boolean,
        default: true
    },
    // Initial filter state (see base/mission-filters.js) - used by the
    // Missions page to restore filters from the URL
    initial: {
        type: Object,
        default: null
    }
})

const emit = defineEmits(['query'])

const router = useRouter()
const loading = ref(true)
const header = ref([])
const paging = reactive({
    limit: props.limit,
    page: 0
})

const filters = ref(defaultFilters({
    order: props.order,
    start: props.start ? String(props.start) : '',
    end: props.end ? String(props.end) : '',
    ...(props.initial || {})
}))

const list = reactive({
    total: 0,
    items: []
})
const is_iam = (permission) => iamHelper(props.iam, props.auth, permission)

const goto = () => {
    if (props.assigned) router.push(`/mission?assigned=${props.assigned}`);
    else router.push('/mission');
}

const listSchema = async () => {
    const schema = await window.std('/api/schema?method=GET&url=/mission');
    header.value = ['title', 'dates'].map((h) => {
        return { name: h, display: true };
    });

    header.value.push(...schema.query.properties.sort.enum.map((h) => {
        return {
            name: h,
            display: false
        }
    }).filter((h) => {
        for (const hknown of header.value) {
            if (hknown.name === h.name) return false;
        }
        return true;
    }));
}

/**
 * Build the list URL with the current search filters applied
 * Shared by fetch & export so the export always matches what is shown
 */
const listURL = () => {
    const url = window.stdurl('/api/mission');
    applyFilters(url, filters.value, props.auth);

    // Cards embedded on other pages are scoped to a fixed user
    if (props.assigned && !filters.value.attended) url.searchParams.set('assigned', props.assigned);

    return url;
}

const fetch = async () => {
    loading.value = true;
    const url = listURL();
    url.searchParams.append('limit', paging.limit);
    url.searchParams.append('page', paging.page);
    const result = await window.std(url);
    list.total = result.total;
    list.items = result.items;
    loading.value = false;
}

const exportMissions = async (format) => {
    const url = listURL();
    url.searchParams.append('format', format);

    for (const field of ['title', 'externalid', 'location', 'start_ts', 'end_ts', 'status']) {
        url.searchParams.append('fields', field);
    }

    await window.std(url, { download: true });
}

watch(paging, async () => {
    await fetch();
}, { deep: true })

// Text search is debounced; every other filter refetches immediately
let searchTimeout;
watch(filters, (next, prev) => {
    emit('query', toQuery(next));
    paging.page = 0;

    const textOnly = prev && Object.keys(next).every((k) => k === 'filter' || JSON.stringify(next[k]) === JSON.stringify(prev[k]));

    clearTimeout(searchTimeout);
    if (textOnly) {
        searchTimeout = setTimeout(fetch, 300);
    } else {
        fetch();
    }
})

onMounted(async () => {
    await listSchema();
    await fetch();
})
</script>
