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
                    @click='$router.push("/issue")'
                    v-text='label'
                />
            </h3>

            <div class='btn-list ms-auto'>
                <TablerIconButton
                    v-if='create && is_iam("Issue:Manage")'
                    title='New Issue'
                    @click='$router.push(`/issue/new`)'
                >
                    <IconPlus
                        :size='32'
                        stroke='1'
                    />
                </TablerIconButton>
                <Export
                    v-if='search && is_iam("Issue:View")'
                    :formats='["csv"]'
                    :show-button-text='false'
                    title='Export Issues'
                    @export='exportIssues'
                />
                <TablerRefreshButton
                    v-if='search && is_iam("Issue:View")'
                    @click='fetch'
                />

                <TablerDropdown
                    v-if='menu'
                >
                    <IconDotsVertical
                        class='cursor-pointer'
                        :size='32'
                        :stroke='1'
                    />
                    <template #dropdown>
                        <button
                            class='dropdown-item text-danger'
                            @click.stop='$emit("remove")'
                        >
                            <IconTrash
                                class='me-1'
                                :size='20'
                                :stroke='1'
                            />
                            Remove Widget
                        </button>
                    </template>
                </TablerDropdown>
            </div>
        </div>

        <IssueFilters
            v-if='search'
            v-model='filters'
            :auth='auth'
            :total='loading ? null : list.total'
        />

        <NoAccess v-if='!is_iam("Issue:View")' />
        <TablerLoading
            v-else-if='loading'
            desc='Loading Issues'
        />
        <TablerNone
            v-else-if='!list.items.length'
            :create='false'
            label='No Issues'
        />
        <template v-else>
            <div class='d-flex flex-column gap-3 p-3'>
                <StandardItemIssue
                    v-for='issue in list.items'
                    :key='issue.id'
                    :issue='issue'
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
import iamHelper from '../../iam.js';
import NoAccess from '../util/NoAccess.vue';
import TableFooter from '../util/TableFooter.vue';
import Export from '../util/Export.vue';
import StandardItemIssue from '../util/StandardItemIssue.vue';
import IssueFilters from '../Issue/IssueFilters.vue';
import { defaultFilters, applyFilters, toQuery } from '../../base/issue-filters.js';
import {
    TablerNone,
    TablerLoading,
    TablerDropdown,
    TablerIconButton,
    TablerRefreshButton
} from '@tak-ps/vue-tabler'
import {
    IconGripVertical,
    IconPlus,
    IconDotsVertical,
    IconTrash
} from '@tabler/icons-vue';

const props = defineProps({
    label: {
        type: String,
        default: 'Recent Issues'
    },
    search: {
        type: Boolean,
        default: false
    },
    dragHandle: {
        type: Boolean,
        default: false,
    },
    create: {
        type: Boolean,
        default: true,
    },
    menu: {
        type: Boolean,
        default: false,
    },
    limit: {
        type: Number,
        default: 10,
    },
    footer: {
        type: Boolean,
        default: true,
    },
    iam: {
        type: Object,
        required: true
    },
    auth: {
        type: Object,
        required: true
    },
    // Scope an embedded card to issues assigned to a fixed user
    assigned: {
        type: Number,
        default: null
    },
    // Initial filter state (see base/issue-filters.js) - the Issues page
    // restores this from the URL
    initial: {
        type: Object,
        default: null
    }
})

const emit = defineEmits(['remove', 'query'])

const loading = ref(true)
const paging = reactive({
    limit: props.limit,
    page: 0
})
const filters = ref(defaultFilters(props.initial || {}))
const list = reactive({
    total: 0,
    items: []
})
const is_iam = (permission) => iamHelper(props.iam, props.auth, permission)

const listURL = () => {
    const url = window.stdurl('/api/issue');
    applyFilters(url, filters.value, props.auth);
    if (props.assigned && !filters.value.assigned) url.searchParams.set('assigned', props.assigned);
    return url;
}

const fetch = async () => {
    loading.value = true;
    const url = listURL();
    url.searchParams.set('limit', paging.limit);
    url.searchParams.set('page', paging.page);
    const result = await window.std(url);
    list.total = result.total;
    list.items = result.items;
    loading.value = false;
}

const exportIssues = async (format) => {
    const url = listURL();
    url.searchParams.set('format', format);
    for (const field of ['id', 'title', 'status', 'created', 'updated', 'author']) {
        url.searchParams.append('fields', field);
    }
    await window.std(url, { download: true });
}

watch(paging, fetch, { deep: true })

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
    if (is_iam("Issue:View")) await fetch();
})
</script>
