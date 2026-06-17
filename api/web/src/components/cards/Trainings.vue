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
                    v-if='create && is_iam("Training:Manage")'
                    title='Create Training'
                    @click='$router.push(`/training/new`)'
                >
                    <IconPlus
                        size='32'
                        stroke='1'
                    />
                </TablerIconButton>
                <TablerRefreshButton
                    v-if='is_iam("Training:View")'
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
                    <template #dropdown>
                        <div
                            class='p-3 row g-2'
                            style='min-width: 500px;'
                            @click.stop=''
                        >
                            <div class='col-md-6'>
                                <TablerInput
                                    v-model='paging.start'
                                    type='date'
                                    label='Start Date'
                                />
                            </div>
                            <div class='col-md-6'>
                                <TablerInput
                                    v-model='paging.end'
                                    type='date'
                                    label='End Date'
                                />
                            </div>
                        </div>
                    </template>
                </TablerDropdown>
            </div>
        </div>

        <NoAccess
            v-if='!is_iam("Training:View")'
        />
        <TablerLoading
            v-else-if='loading'
            desc='Loading Trainings'
        />
        <TablerNone
            v-else-if='!list.items.length'
            :create='false'
            label='No Trainings'
        />
        <template v-else>
            <div class='d-flex flex-column gap-3 p-3'>
                <StandardItemTraining
                    v-for='training in list.items'
                    :key='training.id'
                    :training='training'
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
import TeamBadge from '../util/TeamBadge.vue'
import StandardItemTraining from '../util/StandardItemTraining.vue'
import iamHelper from '../../iam.js';
import NoAccess from '../util/NoAccess.vue';
import TableFooter from '../util/TableFooter.vue';
import {
    TablerBadge,
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
    IconPlus
} from '@tabler/icons-vue';

const props = defineProps({
    label: {
        type: String,
        default: 'Recent Trainings'
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
    await fetch();
})
</script>
