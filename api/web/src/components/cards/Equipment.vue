<template>
    <div class='card'>
        <div class='card-header'>
            <div class='col d-flex align-items-center'>
                <h3 class='card-title'>
                    <a
                        class='cursor-pointer'
                        @click='$router.push("/equipment")'
                        v-text='label'
                    />
                </h3>
                <div class='ms-auto btn-list'>
                    <TablerIconButton
                        v-if='create'
                        title='New Equipment'
                        @click='$router.push(`/equipment/new?parent=${parent}`)'
                    >
                        <IconPlus
                            :size='24'
                            :stroke='1'
                        />
                    </TablerIconButton>
                    <TablerIconButton
                        title='Export CSV'
                        @click='exportEquipment'
                    >
                        <IconDownload
                            :size='24'
                            :stroke='1'
                        />
                    </TablerIconButton>
                </div>
            </div>
        </div>

        <div
            v-if='search || userFilter'
            class='row g-2 mx-2 mt-1 mb-2 align-items-center'
        >
            <div
                v-if='search'
                class='col'
            >
                <TablerInput
                    v-model='paging.filter'
                    icon='search'
                    :placeholder='parent === 0 ? "Search all equipment…" : "Search…"'
                />
            </div>
            <div
                v-if='userFilter'
                class='col-auto d-flex align-items-center'
            >
                <TablerBadge
                    v-if='assignedUser'
                    class='me-2 d-flex align-items-center'
                    background-color='#206bc4'
                    text-color='#ffffff'
                >
                    <span v-text='`${assignedUser.fname} ${assignedUser.lname}`' />
                    <IconX
                        :size='16'
                        :stroke='2'
                        class='ms-1 cursor-pointer'
                        title='Clear user filter'
                        @click='selectUser(null)'
                    />
                </TablerBadge>
                <UserSelect
                    mode='icon'
                    title='Filter by User'
                    :height='40'
                    @selected='selectUser($event)'
                />
            </div>
            <div class='col-auto'>
                <TablerDropdown>
                    <TablerIconButton
                        title='Filter Options'
                        :style='{ height: "40px", width: "40px", display: "flex", alignItems: "center", justifyContent: "center" }'
                    >
                        <IconFilter
                            :size='24'
                            :stroke='1'
                        />
                    </TablerIconButton>
                    <template #dropdown>
                        <div
                            style='min-width: 260px;'
                            @click.stop=''
                        >
                            <div class='px-3 pt-3 pb-1 fw-bold'>
                                Filter Options
                            </div>
                            <div class='px-3 pb-3 row g-2'>
                                <div class='col-12'>
                                    <label class='form-label'>Equipment Type</label>
                                    <select
                                        v-model='paging.type_id'
                                        class='form-select'
                                    >
                                        <option :value='null'>
                                            All Types
                                        </option>
                                        <option
                                            v-for='t in types.list'
                                            :key='t.id'
                                            :value='t.id'
                                            v-text='t.type'
                                        />
                                    </select>
                                </div>
                                <div class='col-12'>
                                    <TablerToggle
                                        v-model='paging.archived'
                                        label='Show Archived'
                                    />
                                </div>
                            </div>
                        </div>
                    </template>
                </TablerDropdown>
            </div>
        </div>

        <template v-if='loading.list'>
            <TablerLoading />
        </template>
        <template v-else-if='!list.items.length'>
            <TablerNone
                :create='false'
                :label='paging.archived ? "No Archived Equipment" : "No Equipment"'
                :compact='true'
            />
        </template>
        <template v-else>
            <div class='table-responsive'>
                <table class='table card-table table-hover table-vcenter'>
                    <TableHeader
                        v-model:sort='paging.sort'
                        v-model:order='paging.order'
                        v-model:header='header'
                        :allow-export='true'
                        @export='exportEquipment'
                    />
                    <tbody>
                        <tr
                            v-for='equip in list.items'
                            :key='equip.id'
                        >
                            <template v-for='h in header'>
                                <template v-if='h.display'>
                                    <td v-if='h.name === "name"'>
                                        <div class='d-flex align-items-center'>
                                            <IconBox
                                                v-if='equip.container'
                                                :size='20'
                                                :stroke='1'
                                                class='me-2 text-secondary'
                                                title='Container'
                                            />
                                            <a
                                                class='cursor-pointer'
                                                @click='$router.push(`/equipment/${equip.id}`)'
                                                v-text='equip.name'
                                            />
                                            <TablerBadge
                                                v-if='equip.archived'
                                                class='ms-2'
                                                background-color='#d63939'
                                                text-color='#ffffff'
                                            >
                                                Archived
                                            </TablerBadge>
                                        </div>
                                    </td>
                                    <td
                                        v-else-if='h.name === "type"'
                                        v-text='typeName(equip.type_id)'
                                    />
                                    <td
                                        v-else-if='h.name === "quantity"'
                                        v-text='equip.quantity'
                                    />
                                    <td v-else-if='h.name === "assigned"'>
                                        <template v-if='equip.assigned.length'>
                                            <div class='d-flex align-items-center'>
                                                <Avatar
                                                    :link='true'
                                                    :user='equip.assigned[0]'
                                                />
                                                <span
                                                    v-if='equip.assigned.length > 1'
                                                    class='ms-2 text-secondary'
                                                    v-text='`+${equip.assigned.length - 1}`'
                                                />
                                            </div>
                                        </template>
                                        <template v-else>
                                            <span class='text-secondary'>None</span>
                                        </template>
                                    </td>
                                    <td
                                        v-else-if='h.name === "value"'
                                        v-text='formatValue(equip.value)'
                                    />
                                    <td v-else-if='h.name === "updated" || h.name === "created"'>
                                        <TablerEpoch :date='equip[h.name]' />
                                    </td>
                                    <td
                                        v-else
                                        v-text='equip[h.name]'
                                    />
                                </template>
                            </template>
                        </tr>
                    </tbody>
                </table>
            </div>
        </template>

        <TableFooter
            v-if='footer'
            :limit='paging.limit'
            :total='list.total'
            @page='paging.page = $event'
        />
    </div>
</template>

<script setup>
import { ref, reactive, watch, onMounted, onUnmounted } from 'vue'

import TableFooter from '../util/TableFooter.vue';
import TableHeader from '../util/TableHeader.vue';
import UserSelect from '../util/UserSelect.vue';
import {
    IconX,
    IconBox,
    IconPlus,
    IconFilter,
    IconDownload,
} from '@tabler/icons-vue';
import {
    TablerBadge,
    TablerEpoch,
    TablerToggle,
    TablerDropdown,
    TablerIconButton,
    TablerInput,
    TablerLoading,
    TablerNone
} from '@tak-ps/vue-tabler';
import Avatar from '../util/Avatar.vue';

const props = defineProps({
    label: {
        type: String,
        default: 'Equipment'
    },
    assigned: {
        type: Number,
        default: null
    },
    parent: {
        type: [Number, null],
        default: 0
    },
    search: {
        type: Boolean,
        default: true
    },
    create: {
        type: Boolean,
        default: false
    },
    footer: {
        type: Boolean,
        default: true
    },
    userFilter: {
        type: Boolean,
        default: false
    }
})

// Columns map to fields the API accepts for `sort`; `type` and `assigned`
// are display-only names translated in sortField()
const SORTABLE = new Set(['name', 'quantity', 'value', 'created', 'updated', 'type']);

const header = ref([
    { name: 'name', display: true },
    { name: 'type', display: true },
    { name: 'quantity', display: true },
    { name: 'assigned', display: true },
    { name: 'updated', display: true },
    { name: 'value', display: false },
    { name: 'created', display: false },
]);

const assignedUser = ref(null)
const types = reactive({
    list: [],
    byId: {}
})

const loading = reactive({
    list: true
})
const paging = reactive({
    filter: '',
    sort: 'name',
    order: 'asc',
    type_id: null,
    archived: false,
    limit: 25,
    page: 0
})
const list = reactive({
    total: 0,
    items: []
})

// Return to the first page and refetch. When the page is already 0 the
// page watcher won't fire, so fetch explicitly in that case.
const resetAndFetch = (fetcher = fetch) => {
    if (paging.page === 0) fetcher();
    else paging.page = 0;
}

const selectUser = (user) => {
    assignedUser.value = user;
    resetAndFetch();
}

const typeName = (type_id) => {
    return types.byId[type_id] || '';
}

const formatValue = (value) => {
    if (value === null || value === undefined) return '';
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0
    }).format(value);
}

const sortField = () => {
    if (!SORTABLE.has(paging.sort)) return 'name';
    if (paging.sort === 'type') return 'type_id';
    return paging.sort;
}

// Build the query shared by the list request and the CSV export
const baseUrl = () => {
    const url = window.stdurl('/api/equipment');
    url.searchParams.append('filter', paging.filter);
    url.searchParams.append('archived', paging.archived);
    url.searchParams.append('sort', sortField());
    url.searchParams.append('order', paging.order);

    if (paging.type_id) url.searchParams.append('type_id', paging.type_id);

    if (assignedUser.value) {
        url.searchParams.append('assigned', assignedUser.value.id);
    } else if (typeof props.assigned === 'number') {
        url.searchParams.append('assigned', props.assigned);
    }

    // The root list is scoped to top-level items so users can drill into
    // containers. Once they start searching, look across the whole hierarchy
    // so gear stored inside a container is still found.
    const searching = paging.filter.trim().length > 0;
    const rootList = props.parent === 0;
    if (typeof props.parent === 'number' && !(searching && rootList)) {
        url.searchParams.append('parent', props.parent);
    }

    return url;
}

const exportEquipment = async () => {
    const url = baseUrl();
    url.searchParams.append('format', 'csv');

    const fields = header.value.filter((h) => h.display && h.name !== 'type').map((h) => h.name);
    if (!fields.includes('name')) fields.unshift('name');
    for (const field of fields) {
        url.searchParams.append('fields', field);
    }

    const res = await window.std(url);
    const blob = await res.blob();
    const durl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = durl;
    a.download = 'sar-equipment.csv';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(durl);
}

const fetchTypes = async () => {
    const res = await window.std('/api/equipment-type?limit=100');
    types.list = res.items;
    types.byId = Object.fromEntries(res.items.map((t) => [t.id, t.type]));
}

// Track the latest request so a slow earlier response can't overwrite a
// newer one when the user types quickly
let requestId = 0;

const fetch = async () => {
    const id = ++requestId;
    loading.list = true;

    const url = baseUrl();
    url.searchParams.append('limit', paging.limit);
    url.searchParams.append('page', paging.page);

    try {
        const result = await window.std(url);
        if (id !== requestId) return;
        list.total = result.total;
        list.items = result.items;
    } finally {
        if (id === requestId) loading.list = false;
    }
}

let debounce = null;
const debouncedFetch = () => {
    if (debounce) clearTimeout(debounce);
    debounce = setTimeout(() => {
        debounce = null;
        fetch();
    }, 250);
}

onUnmounted(() => {
    if (debounce) clearTimeout(debounce);
});

watch(() => paging.page, async () => {
    await fetch();
})

watch(() => paging.filter, () => {
    resetAndFetch(debouncedFetch);
})

watch(() => [paging.sort, paging.order, paging.type_id, paging.archived], () => {
    resetAndFetch();
})

onMounted(async () => {
    await Promise.all([fetchTypes(), fetch()]);
})
</script>
