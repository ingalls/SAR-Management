<template>
    <div class='card'>
        <div class='card-header'>
            <IconGripVertical
                v-if='dragHandle'
                class='drag-handle cursor-move'
                size='32'
            />
            <h3 class='card-title'>
                <a
                    class='cursor-pointer'
                    @click='router.push("/application")'
                    v-text='label'
                />
            </h3>

            <div class='btn-list ms-auto'>
                <TablerIconButton
                    v-if='create && is_iam("Application:Manage")'
                    title='Create Application'
                    @click='router.push(`/application/new`)'
                >
                    <IconPlus
                        size='32'
                        stroke='1'
                    />
                </TablerIconButton>
                <TablerIconButton
                    v-if='create && is_iam("Application:Manage")'
                    title='Edit Application Form'
                    @click='router.push(`/application/edit`)'
                >
                    <IconPencil
                        size='32'
                        stroke='1'
                    />
                </TablerIconButton>
            </div>
        </div>

        <NoAccess v-if='!is_iam("Application:View")' />
        <template v-else>
            <div class='px-2 pt-2 d-flex flex-wrap gap-1'>
                <button
                    v-for='tab in tabs'
                    :key='tab.value'
                    type='button'
                    class='btn btn-sm'
                    :class='paging.status === tab.value ? "btn-primary" : "btn-ghost-secondary"'
                    :title='tab.description'
                    @click='paging.status = tab.value'
                >
                    <span v-text='tab.label' />
                    <span
                        class='badge ms-2'
                        :class='paging.status === tab.value ? "bg-white text-primary" : `bg-${tab.colour}-lt`'
                        v-text='tab.count'
                    />
                </button>
            </div>
            <div class='px-2 py-2 row g-2'>
                <div class='col-12 col-md-6'>
                    <TablerInput
                        v-model='paging.filter'
                        placeholder='Filter by name, email or phone'
                        icon='search'
                    />
                </div>
                <div class='col-6 col-md-3'>
                    <TablerEnum
                        v-model='paging.cohort'
                        :options='cohortOptions'
                    />
                </div>
                <div class='col-6 col-md-3'>
                    <TablerEnum
                        v-model='paging.reviewer'
                        :options='["Any Reviewer", "Assigned to Me"]'
                    />
                </div>
            </div>

            <TablerLoading
                v-if='loading'
                desc='Loading Applications'
            />
            <TablerNone
                v-else-if='!list.items.length'
                :create='false'
                label='No Applications'
            />
            <div
                v-else
                class='table-responsive'
            >
                <table class='table card-table table-hover table-vcenter'>
                    <TableHeader
                        v-model:sort='paging.sort'
                        v-model:order='paging.order'
                        v-model:header='header'
                        :allow-export='false'
                    />
                    <tbody>
                        <tr
                            v-for='application in list.items'
                            :key='application.id'
                            class='cursor-pointer'
                            @click='stdclick(router, $event, `/application/${application.id}`)'
                        >
                            <template v-for='h in header'>
                                <template v-if='h.display'>
                                    <td v-if='h.name === "status"'>
                                        <StatusBadge :status='application.status' />
                                    </td>
                                    <td v-else-if='h.name === "name"'>
                                        <div class='d-flex align-items-center'>
                                            <span v-text='application.name' />
                                            <span
                                                v-if='application.comments'
                                                class='ms-2 text-muted d-flex align-items-center'
                                                :title='`${application.comments} comments`'
                                            >
                                                <IconMessage
                                                    size='16'
                                                    stroke='1'
                                                />
                                                <span
                                                    class='ms-1'
                                                    v-text='application.comments'
                                                />
                                            </span>
                                        </div>
                                    </td>
                                    <td v-else-if='h.name === "assigned"'>
                                        <Avatar
                                            v-if='application.assigned_user'
                                            :user='application.assigned_user'
                                            :link='false'
                                        />
                                        <span
                                            v-else
                                            class='text-muted'
                                        >Unassigned</span>
                                    </td>
                                    <td v-else-if='["updated", "created"].includes(h.name)'>
                                        <TablerEpoch
                                            v-if='application[h.name]'
                                            :date='application[h.name]'
                                        />
                                        <span v-else>Never</span>
                                    </td>
                                    <td v-else>
                                        <span v-text='application[h.name]' />
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
                :page='paging.page'
                @page='paging.page = $event'
            />
        </template>
    </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router';
import { stdclick } from '../../std.ts';
import { phone as phoneFormat } from 'phone';
import iamHelper from '../../iam.js';
import NoAccess from '../util/NoAccess.vue';
import TableHeader from '../util/TableHeader.vue';
import TableFooter from '../util/TableFooter.vue';
import Avatar from '../util/Avatar.vue';
import StatusBadge from '../Application/StatusBadge.vue';
import { Statuses, StatusOrder } from '../Application/status.ts';
import {
    TablerNone,
    TablerEnum,
    TablerInput,
    TablerEpoch,
    TablerLoading,
    TablerIconButton
} from '@tak-ps/vue-tabler'

import {
    IconGripVertical,
    IconMessage,
    IconPlus,
    IconPencil
} from '@tabler/icons-vue';

const router = useRouter();

const props = defineProps({
    label: {
        type: String,
        default: 'Team Applications'
    },
    iam: {
        type: Object,
        required: true
    },
    order: {
        type: String,
        default: 'desc'
    },
    dragHandle: {
        type: Boolean,
        default: false
    },
    limit: {
        type: Number,
        default: 10
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
    // Start with the list limited to the applications a given user is reviewing
    assigned: {
        type: Number
    }
})

const loading = ref(true)
const header = ref([])
const paging = reactive({
    filter: '',
    sort: 'created',
    order: props.order,
    limit: props.limit,
    status: 'active',
    cohort: 'All Cohorts',
    reviewer: props.assigned ? 'Assigned to Me' : 'Any Reviewer',
    page: 0
})
const list = reactive({
    total: 0,
    counts: {},
    cohorts: [],
    items: []
})

const cohortOptions = computed(() => ['All Cohorts', ...list.cohorts]);

// Groupings first, then each status in lifecycle order
const tabs = computed(() => {
    const count = (active) => StatusOrder
        .filter((status) => Statuses[status].active === active)
        .reduce((total, status) => total + (list.counts[status] || 0), 0);

    return [{
        value: 'active',
        label: 'Active',
        description: 'Applications that are still in progress',
        colour: 'blue',
        count: count(true)
    }, ...StatusOrder.map((status) => {
        return {
            value: status,
            label: Statuses[status].label,
            description: Statuses[status].description,
            colour: Statuses[status].colour,
            count: list.counts[status] || 0
        };
    }), {
        value: 'all',
        label: 'All',
        description: 'Every application',
        colour: 'secondary',
        count: count(true) + count(false)
    }];
});

const is_iam = (permission) => iamHelper(props.iam, props.auth, permission)

const listSchema = async () => {
    const schema = await window.std('/api/schema?method=GET&url=/application');
    header.value = ['status', 'name', 'cohort', 'assigned', 'created', 'updated'].map((h) => {
        return { name: h, display: true };
    });

    header.value.push(...schema.query.properties.sort.enum.map((h) => {
        return {
            name: h,
            display: false
        }
    }).filter((h) => {
        // Not meaningful as a table column
        if (['id', 'answers', 'schema', 'user_id', 'agency_id'].includes(h.name)) return false;

        for (const hknown of header.value) {
            if (hknown.name === h.name) return false;
        }
        return true;
    }));
}

const format = (number) => {
    const p = phoneFormat(number);

    if (!p.isValid) return number;

    if (p.countryCode === '+1') {
        return `${p.phoneNumber.slice(0, 2)} (${p.phoneNumber.slice(2, 5)}) ${p.phoneNumber.slice(5, 8)}-${p.phoneNumber.slice(8, 12)}`;
    } else {
        return p;
    }
}

// Only the most recent request is allowed to update the list
let request = 0;

const fetch = async () => {
    const current = ++request;
    loading.value = true;

    try {
        const url = window.stdurl('/api/application');
        url.searchParams.append('limit', paging.limit);
        url.searchParams.append('page', paging.page);
        url.searchParams.append('filter', paging.filter);
        url.searchParams.append('sort', paging.sort);
        url.searchParams.append('order', paging.order);
        url.searchParams.append('status', paging.status);
        if (paging.cohort !== 'All Cohorts') url.searchParams.append('cohort', paging.cohort);
        if (paging.reviewer === 'Assigned to Me') url.searchParams.append('assigned', props.assigned || props.auth.id);

        const result = await window.std(url);
        if (current !== request) return;

        result.items.map((i) => {
            i.phone = format(i.phone);
        })

        list.total = result.total;
        list.counts = result.counts;
        list.cohorts = result.cohorts;
        list.items = result.items;
    } finally {
        if (current === request) loading.value = false;
    }
}

// Any change to what is being listed invalidates the current page
watch(() => [paging.filter, paging.status, paging.cohort, paging.reviewer, paging.sort, paging.order], async () => {
    if (paging.page !== 0) {
        paging.page = 0;
    } else {
        await fetch();
    }
})

watch(() => paging.page, async () => {
    await fetch();
})

onMounted(async () => {
    await listSchema();
    if (is_iam("Application:View")) {
        await fetch();
    }
})
</script>
