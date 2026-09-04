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
                    @click='$router.push("/rolodex")'
                    v-text='label'
                />
            </h3>

            <div class='btn-list ms-auto'>
                <div
                    class='btn-group'
                    role='group'
                >
                    <button
                        type='button'
                        class='btn btn-icon'
                        :class='{ "active": mode === "list" }'
                        title='List View'
                        @click='mode = "list"'
                    >
                        <IconList
                            :size='24'
                            :stroke='1'
                        />
                    </button>
                    <button
                        type='button'
                        class='btn btn-icon'
                        :class='{ "active": mode === "grid" }'
                        title='Grid View'
                        @click='mode = "grid"'
                    >
                        <IconLayoutGrid
                            :size='24'
                            :stroke='1'
                        />
                    </button>
                </div>

                <TablerIconButton
                    v-if='create && is_iam("Rolodex:Manage")'
                    title='Create Rolodex Item'
                    @click='$router.push(`/rolodex/new`)'
                >
                    <IconPlus
                        size='32'
                        stroke='1'
                    />
                </TablerIconButton>
            </div>
        </div>

        <NoAccess v-if='!is_iam("Rolodex:View")' />
        <template v-else>
            <div class='px-2 py-2 row g-2'>
                <div class='col-12 col-md-5'>
                    <TablerInput
                        v-model='paging.filter'
                        placeholder='Filter by name, organization, address, email or phone'
                        icon='search'
                    />
                </div>
                <div class='col-6 col-md-2'>
                    <select
                        v-model='paging.type'
                        class='form-select'
                        aria-label='Filter by type'
                    >
                        <option value=''>
                            All Types
                        </option>
                        <option value='person'>
                            People
                        </option>
                        <option value='place'>
                            Places
                        </option>
                        <option value='thing'>
                            Things
                        </option>
                    </select>
                </div>
                <div class='col-6 col-md-2'>
                    <select
                        v-model='paging.agency'
                        class='form-select'
                        aria-label='Filter by agency'
                    >
                        <option value=''>
                            All Agencies
                        </option>
                        <option
                            v-for='agency in agencies'
                            :key='agency.id'
                            :value='agency.id'
                            v-text='agency.name'
                        />
                    </select>
                </div>
                <div class='col-8 col-md-2'>
                    <select
                        v-model='paging.tag'
                        class='form-select'
                        aria-label='Filter by tag'
                    >
                        <option value=''>
                            All Tags
                        </option>
                        <option
                            v-for='tag in tags'
                            :key='tag.tag'
                            :value='tag.tag'
                            v-text='`${tag.tag} (${tag.count})`'
                        />
                    </select>
                </div>
                <div class='col-4 col-md-1 d-flex align-items-center justify-content-center'>
                    <label class='form-check form-switch mb-0'>
                        <input
                            v-model='paging.archived'
                            class='form-check-input'
                            type='checkbox'
                        >
                        <span class='form-check-label'>Archived</span>
                    </label>
                </div>
            </div>

            <TablerLoading
                v-if='loading'
                desc='Loading Rolodex'
            />
            <TablerNone
                v-else-if='!list.items.length'
                :create='false'
                label='Rolodex Items'
            />
            <template v-else-if='mode === "grid"'>
                <div class='row row-cards p-3'>
                    <div
                        v-for='rolodex in list.items'
                        :key='rolodex.id'
                        class='col-6 col-sm-4 col-md-3 col-lg-2 cursor-pointer'
                        @click='$router.push(`/rolodex/${rolodex.id}`)'
                    >
                        <div class='card card-sm hover-shadow-sm h-100'>
                            <RolodexProfile
                                :rolodex='rolodex'
                                size='mini'
                                :height='160'
                            />
                            <div class='card-body p-2'>
                                <div class='d-flex align-items-center'>
                                    <TypeIcon
                                        :type='rolodex.type'
                                        :size='16'
                                        :stroke='1'
                                        class='me-1 flex-shrink-0'
                                    />
                                    <div
                                        class='fw-bold text-truncate'
                                        :title='rolodex.name'
                                        v-text='rolodex.name'
                                    />
                                </div>
                                <div
                                    v-if='rolodex.title || rolodex.organization'
                                    class='text-secondary small text-truncate'
                                    v-text='[rolodex.title, rolodex.organization].filter(Boolean).join(" · ")'
                                />
                                <div
                                    v-if='rolodex.phone'
                                    class='small text-truncate'
                                    v-text='rolodex.phone'
                                />
                                <div
                                    v-if='rolodex.agencies.length'
                                    class='mt-1 d-flex flex-wrap gap-1'
                                >
                                    <span
                                        v-for='agency in rolodex.agencies'
                                        :key='agency.id'
                                        class='badge bg-blue-lt'
                                        v-text='agency.name'
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </template>
            <table
                v-else
                class='table card-table table-hover table-vcenter'
            >
                <TableHeader
                    v-model:sort='paging.sort'
                    v-model:order='paging.order'
                    v-model:header='header'
                    :allow-export='false'
                />
                <tbody>
                    <tr
                        v-for='rolodex in list.items'
                        :key='rolodex.id'
                        class='cursor-pointer'
                        @click='$router.push(`/rolodex/${rolodex.id}`)'
                    >
                        <template v-for='h in header'>
                            <template v-if='h.display'>
                                <td v-if='h.name === "name"'>
                                    <div class='d-flex align-items-center'>
                                        <span
                                            v-if='rolodex.photo'
                                            class='avatar avatar-sm me-2'
                                            :style='`background-image: url(${base}/api/rolodex/${rolodex.id}/profile?size=mini&token=${token})`'
                                        />
                                        <span
                                            v-else
                                            class='avatar avatar-sm me-2'
                                        >
                                            <TypeIcon
                                                :type='rolodex.type'
                                                :size='18'
                                                :stroke='1'
                                            />
                                        </span>
                                        <div>
                                            <div v-text='rolodex.name' />
                                            <div
                                                v-if='rolodex.title || rolodex.organization'
                                                class='text-secondary small'
                                                v-text='[rolodex.title, rolodex.organization].filter(Boolean).join(" · ")'
                                            />
                                        </div>
                                    </div>
                                </td>
                                <td v-else-if='h.name === "type"'>
                                    <span
                                        class='badge'
                                        :class='typeClass(rolodex.type)'
                                        v-text='rolodex.type'
                                    />
                                </td>
                                <td v-else-if='h.name === "agencies"'>
                                    <span
                                        v-if='!rolodex.agencies.length'
                                        class='text-secondary'
                                    >Everyone</span>
                                    <span
                                        v-for='agency in rolodex.agencies'
                                        v-else
                                        :key='agency.id'
                                        class='badge bg-blue-lt me-1'
                                        v-text='agency.name'
                                    />
                                </td>
                                <td v-else-if='h.name === "tags"'>
                                    <span
                                        v-for='tag in rolodex.tags'
                                        :key='tag'
                                        class='badge bg-secondary-lt me-1'
                                        v-text='tag'
                                    />
                                </td>
                                <td v-else-if='h.name === "archived"'>
                                    <TablerBadge
                                        v-if='rolodex.archived'
                                        background-color='#d63939'
                                        text-color='#ffffff'
                                    >
                                        Archived
                                    </TablerBadge>
                                    <TablerBadge
                                        v-else
                                        background-color='#2fb344'
                                        text-color='#ffffff'
                                    >
                                        Active
                                    </TablerBadge>
                                </td>
                                <td v-else-if='["updated", "created"].includes(h.name)'>
                                    <TablerEpoch
                                        v-if='rolodex[h.name]'
                                        :date='rolodex[h.name]'
                                    />
                                    <span v-else>Never</span>
                                </td>
                                <td v-else-if='h.name === "email"'>
                                    <a
                                        v-if='rolodex.email'
                                        :href='`mailto:${rolodex.email}`'
                                        @click.stop=''
                                        v-text='rolodex.email'
                                    />
                                </td>
                                <td v-else-if='h.name === "phone"'>
                                    <a
                                        v-if='rolodex.phone'
                                        :href='`tel:${rolodex.phone}`'
                                        @click.stop=''
                                        v-text='rolodex.phone'
                                    />
                                </td>
                                <td v-else>
                                    <span v-text='rolodex[h.name]' />
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
import { phone as phoneFormat } from 'phone';
import iamHelper from '../../iam.js';
import NoAccess from '../util/NoAccess.vue';
import TableHeader from '../util/TableHeader.vue';
import TableFooter from '../util/TableFooter.vue';
import RolodexProfile from '../Rolodex/Profile.vue';
import TypeIcon from '../Rolodex/TypeIcon.vue';
import {
    TablerBadge,
    TablerNone,
    TablerInput,
    TablerEpoch,
    TablerLoading,
    TablerIconButton
} from '@tak-ps/vue-tabler'

import {
    IconGripVertical,
    IconLayoutGrid,
    IconList,
    IconPlus
} from '@tabler/icons-vue';

const props = defineProps({
    label: {
        type: String,
        default: 'Rolodex'
    },
    iam: {
        type: Object,
        required: true
    },
    order: {
        type: String,
        default: 'asc'
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
    assigned: {
        type: Number
    }
})

const MODE_KEY = 'rolodex-view-mode';

const loading = ref(true)
const header = ref([])
const sortable = ref([])
const agencies = ref([])
const tags = ref([])
const token = ref(localStorage.token)
const base = ref(window.stdurl('/').origin)
const mode = ref(readMode())
const paging = reactive({
    filter: '',
    type: '',
    tag: '',
    agency: '',
    archived: false,
    sort: 'name',
    order: props.order,
    limit: props.limit,
    page: 0
})
const list = reactive({
    total: 0,
    items: []
})
const is_iam = (permission) => iamHelper(props.iam, props.auth, permission)

function readMode() {
    try {
        return localStorage.getItem(MODE_KEY) === 'grid' ? 'grid' : 'list';
    } catch {
        return 'list';
    }
}

function typeClass(type) {
    if (type === 'person') return 'bg-blue-lt';
    if (type === 'place') return 'bg-green-lt';
    return 'bg-orange-lt';
}

const listSchema = async () => {
    const schema = await window.std('/api/schema?method=GET&url=/rolodex');
    sortable.value = schema.query.properties.sort.enum;
    header.value = ['name', 'type', 'phone', 'email', 'agencies', 'tags'].map((h) => {
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

const listAgencies = async () => {
    const url = window.stdurl('/api/agency');
    url.searchParams.append('limit', 100);
    url.searchParams.append('sort', 'name');
    url.searchParams.append('order', 'asc');
    const res = await window.std(url);
    agencies.value = res.items;
}

const listTags = async () => {
    const res = await window.std('/api/rolodex/tags?limit=100');
    tags.value = res.items;
}

const format = (number) => {
    if (!number) return number;
    const p = phoneFormat(number);

    if (!p.isValid) return number;

    if (p.countryCode === '+1') {
        return `${p.phoneNumber.slice(0, 2)} (${p.phoneNumber.slice(2, 5)}) ${p.phoneNumber.slice(5, 8)}-${p.phoneNumber.slice(8, 12)}`;
    } else {
        return p.phoneNumber;
    }
}

const fetch = async () => {
    loading.value = true;
    const url = window.stdurl('/api/rolodex');
    url.searchParams.append('limit', paging.limit);
    url.searchParams.append('page', paging.page);
    url.searchParams.append('filter', paging.filter);
    url.searchParams.append('sort', sortable.value.includes(paging.sort) ? paging.sort : 'name');
    url.searchParams.append('order', paging.order);
    url.searchParams.append('archived', paging.archived);
    if (paging.type) url.searchParams.append('type', paging.type);
    if (paging.tag) url.searchParams.append('tag', paging.tag);
    if (paging.agency) url.searchParams.append('agency', paging.agency);
    const result = await window.std(url);

    result.items.map((i) => {
        i.phone = format(i.phone);
    })

    list.total = result.total;
    list.items = result.items;

    loading.value = false;
}

watch(mode, () => {
    try {
        localStorage.setItem(MODE_KEY, mode.value);
    } catch {
        // Per-viewer convenience only
    }
});

// Filter changes restart at the first page; a page change alone just refetches
watch(() => [paging.filter, paging.type, paging.tag, paging.agency, paging.archived, paging.sort, paging.order], async () => {
    if (paging.page !== 0) {
        paging.page = 0;
    } else {
        await fetch();
    }
});

watch(() => paging.page, async () => {
    await fetch();
});

onMounted(async () => {
    await listSchema();
    if (is_iam("Rolodex:View")) {
        await Promise.all([fetch(), listAgencies(), listTags()]);
    }
})
</script>
