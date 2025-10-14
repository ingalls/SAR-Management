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
                <TablerRefreshButton
                    v-if='is_iam("Mission:View")'
                    @click='fetch'
                />
            </div>
        </div>

        <div
            v-if='search'
            class='row g-2'
        >
            <div
                class='col-auto'
                style='width: calc(100% - 48px)'
            >
                <TablerInput
                    v-model='paging.filter'
                    icon='search'
                    placeholder='Search…'
                />
            </div>
            <div class='col-auto'>
                <TablerDropdown>
                    <TablerIconButton
                        title='Search Filters'
                    >
                        <IconFilter
                            :size='32'
                            stroke='1'
                        />
                    </TablerIconButton>
                    <template #dropdown />
                </TablerDropdown>
            </div>
        </div>

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
            :label='Missions'
        />
        <template v-else>
            <table class='table card-table table-hover table-vcenter'>
                <TableHeader
                    v-model:sort='paging.sort'
                    v-model:order='paging.order'
                    v-model:header='header'
                    :export='false'
                />
                <tbody>
                    <tr
                        v-for='mission in list.items'
                        :key='mission.id'
                        class='cursor-pointer'
                        @click='$router.push(`/mission/${mission.id}`)'
                    >
                        <template v-for='h in header'>
                            <template v-if='h.display'>
                                <td v-if='["updated", "created"].includes(h.name)'>
                                    <TablerEpoch
                                        v-if='mission[h.name]'
                                        :date='mission[h.name]'
                                    />
                                    <span v-else>Never</span>
                                </td>
                                <td v-else-if='h.name === "dates"'>
                                    <TablerEpochRange
                                        :start='mission.start_ts'
                                        :end='mission.end_ts'
                                    />
                                </td>
                                <td v-else-if='h.name === "title"'>
                                    <div class='d-flex align-items-center'>
                                        <span
                                            v-if='attendance'
                                            class='me-3'
                                        >
                                            <IconUserCheck
                                                v-if='mission.users.includes(auth.id)'
                                                v-tooltip='"Attended"'
                                                size='32'
                                                stroke='1'
                                                color='green'
                                            />
                                            <IconUserOff
                                                v-else
                                                v-tooltip='"Did not attend"'
                                                size='32'
                                                stroke='1'
                                            />
                                        </span>
                                        <span v-text='mission.title' />
                                        <div class='ms-auto btn-list h-25'>
                                            <template v-for='team in mission.teams'>
                                                <TeamBadge
                                                    :team='team'
                                                    class='ms-auto'
                                                />
                                            </template>
                                            <span
                                                v-if='mission.required'
                                                class='ms-auto badge bg-red text-white'
                                                style='height: 20px;'
                                            >Required</span>
                                        </div>
                                    </div>
                                </td>
                                <td v-else>
                                    <span v-text='mission[h.name]' />
                                </td>
                            </template>
                        </template>
                    </tr>
                </tbody>
            </table>
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
import TeamBadge from '../util/TeamBadge.vue'
import NoAccess from '../util/NoAccess.vue';
import iam from '../../iam.js';
import TableHeader from '../util/TableHeader.vue';
import TableFooter from '../util/TableFooter.vue';
import {
    TablerNone,
    TablerEpoch,
    TablerRefreshButton,
    TablerEpochRange,
    TablerIconButton,
    TablerDropdown,
    TablerInput,
    TablerLoading
} from '@tak-ps/vue-tabler'

import {
    IconFilter,
    IconGripVertical,
    IconPlus,
    IconRefresh,
    IconUserCheck,
    IconUserOff
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
    }
})

const router = useRouter()
const loading = ref(true)
const header = ref([])
const paging = reactive({
    filter: '',
    sort: 'start_ts',
    order: props.order,
    limit: props.limit,
    start: props.start,
    end: props.end,
    page: 0
})
const list = reactive({
    total: 0,
    items: []
})

const is_iam = (permission) => iam(props.iam, props.auth, permission)

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

const fetch = async () => {
    loading.value = true;
    const url = window.stdurl('/api/mission');
    url.searchParams.append('limit', paging.limit);
    url.searchParams.append('page', paging.page);
    url.searchParams.append('filter', paging.filter);
    url.searchParams.append('sort', paging.sort);
    url.searchParams.append('order', paging.order);

    if (paging.start) url.searchParams.append('start', paging.start);
    if (paging.end) url.searchParams.append('end', paging.end);
    if (props.assigned) url.searchParams.append('assigned', props.assigned);
    const result = await window.std(url);
    list.total = result.total;
    list.items = result.items;
    loading.value = false;
}

watch(paging, async () => {
    await fetch();
}, { deep: true })

onMounted(async () => {
    await listSchema();
    await fetch();
})
</script>
