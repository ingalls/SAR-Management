<template>
    <div class='card h-100 w-100'>
        <div class='card-header'>
            <IconGripVertical
                v-if='dragHandle'
                class='drag-handle cursor-move'
                :size='24'
                :stroke='1'
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
                    v-if='create && is_iam("Training:Manage")'
                    title='Create Training'
                    @click='$router.push(`/training/new`)'
                >
                    <IconPlus
                        :size='32'
                        :stroke='1'
                    />
                </TablerIconButton>
                <TablerRefreshButton
                    v-if='is_iam("Training:View")'
                    :loading='loading'
                    @click='fetch'
                />
            </div>
        </div>

        <NoAccess v-if='!is_iam("Training:View")' />
        <template v-else-if='loading'>
            <TablerLoading desc='Loading Trainings' />
        </template>
        <template v-else-if='!list.items.length'>
            <TablerNone
                :create='false'
                :label='Trainings'
            />
        </template>
        <template v-else>
            <div
                v-if='!props.start && !props.end'
                class='btn-group mx-2 my-2'
                role='group'
            >
                <input
                    type='radio'
                    class='btn-check'
                    name='btn-radio-toolbar'
                    :checked='range === "past"'
                    value='past'
                >
                <label
                    class='btn btn-icon px-2'
                    @click='range = "past"'
                >
                    <span class='ms-2'>Past Trainings</span>
                </label>

                <input
                    type='radio'
                    class='btn-check'
                    name='btn-radio-toolbar'
                    :checked='range === "future"'
                    value='future'
                >
                <label
                    class='btn btn-icon px-2'
                    @click='range = "future"'
                >
                    <span class='ms-2'>Upcoming Trainings</span>
                </label>
            </div>
            <div class='overflow-auto'>
                <table class='table card-table table-hover table-vcenter'>
                    <TableHeader
                        v-model:sort='paging.sort'
                        v-model:order='paging.order'
                        v-model:header='header'
                        :allow-export='false'
                    />
                    <tbody>
                        <tr
                            v-for='training in list.items'
                            :key='training.id'
                            class='cursor-pointer'
                            @click='$router.push(`/training/${training.id}`)'
                        >
                            <template v-for='h in header'>
                                <template v-if='h.display'>
                                    <td v-if='["updated", "created"].includes(h.name)'>
                                        <TablerEpoch
                                            v-if='training[h.name]'
                                            :date='training[h.name]'
                                        />
                                        <span v-else>Never</span>
                                    </td>
                                    <td v-else-if='h.name === "dates"'>
                                        <TablerEpochRange
                                            :start='training.start_ts'
                                            :end='training.end_ts'
                                        />
                                    </td>
                                    <td v-else-if='h.name === "title"'>
                                        <div class='d-flex align-items-center'>
                                            <span
                                                v-if='attendance'
                                                class='me-3'
                                            >
                                                <IconUserCheck
                                                    v-if='training.users.includes(auth.id)'
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

                                            <span v-text='training.title' />
                                            <div class='ms-auto btn-list h-25'>
                                                <template
                                                    v-for='team in training.teams'
                                                    :key='team.id'
                                                >
                                                    <TeamBadge
                                                        :team='team'
                                                        class='ms-auto'
                                                    />
                                                </template>
                                                <span
                                                    v-if='training.required'
                                                    class='ms-auto badge bg-red text-white'
                                                    style='height: 20px;'
                                                >Required</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td v-else>
                                        <span v-text='training[h.name]' />
                                    </td>
                                </template>
                            </template>
                        </tr>
                    </tbody>
                </table>
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
import TeamBadge from '../util/TeamBadge.vue'
import iamHelper from '../../iam.js';
import NoAccess from '../util/NoAccess.vue';
import TableHeader from '../util/TableHeader.vue';
import TableFooter from '../util/TableFooter.vue';
import {
    TablerNone,
    TablerEpoch,
    TablerIconButton,
    TablerRefreshButton,
    TablerEpochRange,
    TablerLoading
} from '@tak-ps/vue-tabler'

import {
    IconGripVertical,
    IconUserCheck,
    IconUserOff,
    IconPlus
} from '@tabler/icons-vue';

const range = ref('future');

const props = defineProps({
    label: {
        type: String,
        default: 'Upcoming Training'
    },
    iam: {
        type: Object,
        required: true
    },
    start: {
        type: String
    },
    order: {
        type: String,
        default: 'desc'
    },
    end: {
        type: String
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
    order: props.order || 'asc',
    limit: props.limit,
    start: props.start,
    end: props.end,
    page: 0
})
const list = reactive({
    total: 0,
    items: []
})

watch(range, async (newRange) => {
    if (!props.start && !props.end) {
        const now = new Date();
        if (newRange === 'past') {
            paging.page = 0;
            paging.end = now.toISOString();
            paging.start = '';
            paging.order = 'desc';
        } else if (newRange === 'future') {
            paging.page = 0;
            paging.start = now.toISOString();
            paging.end = '';
            paging.order = 'asc';
        }
        await fetch();
    }
})
const is_iam = (permission) => iamHelper(props.iam, props.auth, permission)

const goto = () => {
    if (props.assigned) router.push(`/training?assigned=${props.assigned}`);
    else router.push('/training');
}

const listSchema = async () => {
    const schema = await window.std('/api/schema?method=GET&url=/training');
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
    const url = window.stdurl('/api/training');
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
    if (is_iam("Training:View")) {
        await fetch();
    }
})
</script>
